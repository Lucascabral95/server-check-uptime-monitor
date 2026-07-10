/**
 * Backfill de una sola vez: convierte el historial de ping_logs en filas de
 * `incidents`, ahora que uptime.processor.ts escribe incidentes en cada
 * transición de estado en vez de derivarlos escaneando ping_logs.
 *
 * Por qué esto NO es una migración de Prisma:
 * - ping_logs es la tabla más grande de la app; un scan completo + insert
 *   corriendo dentro de `prisma migrate deploy` puede bloquear o hacer
 *   timeout, y una migración fallida deja el historial en estado "failed" y
 *   bloquea los deploys siguientes.
 * - Este script sí puede batchear por monitor, loguear progreso, y correrse
 *   por separado del pipeline de deploy.
 *
 * Es idempotente: un monitor que ya tiene al menos un Incident se SALTEA (no
 * duplica). Para reprocesar un monitor desde cero, borrar sus incidentes
 * primero (`DELETE FROM incidents WHERE monitor_id = '...'`) y volver a
 * correr el script.
 *
 * Uso:
 *   npx ts-node prisma/backfill/backfill-incidents.ts             (aplica)
 *   npx ts-node prisma/backfill/backfill-incidents.ts --dry-run    (solo muestra qué haría)
 */
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config();

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/servercheck_dev',
});
const prisma = new PrismaClient({ adapter });

const isDryRun = process.argv.includes('--dry-run');

interface IncidentIsland {
  startedAt: Date;
  lastFailAt: Date;
  affectedChecks: number;
  firstError: string | null;
  firstStatusCode: number;
}

// Gaps-and-islands: agrupa checks fallidos consecutivos de un monitor usando
// la diferencia clásica de dos ROW_NUMBER() (uno global, uno por `success`).
// Filas dentro de la misma racha de fallos comparten el mismo `grp_id`.
async function findFailureIslands(monitorId: string): Promise<IncidentIsland[]> {
  return prisma.$queryRaw<IncidentIsland[]>`
    SELECT
      MIN(timestamp) AS "startedAt",
      MAX(timestamp) AS "lastFailAt",
      COUNT(*)::int AS "affectedChecks",
      (ARRAY_AGG(error ORDER BY timestamp))[1] AS "firstError",
      (ARRAY_AGG(status_code ORDER BY timestamp))[1] AS "firstStatusCode"
    FROM (
      SELECT timestamp, error, status_code,
             (ROW_NUMBER() OVER (ORDER BY timestamp)
              - ROW_NUMBER() OVER (PARTITION BY success ORDER BY timestamp)) AS grp_id
      FROM ping_logs
      WHERE monitor_id = ${monitorId} AND success = false
    ) sub
    GROUP BY grp_id
    ORDER BY MIN(timestamp)
  `;
}

async function findNextSuccessAfter(monitorId: string, after: Date): Promise<Date | null> {
  const rows = await prisma.$queryRaw<{ ts: Date | null }[]>`
    SELECT MIN(timestamp) AS ts FROM ping_logs
    WHERE monitor_id = ${monitorId} AND success = true AND timestamp > ${after}
  `;
  return rows[0]?.ts ?? null;
}

async function backfillMonitor(monitor: { id: string; userId: string; status: string }): Promise<number> {
  const islands = await findFailureIslands(monitor.id);
  if (islands.length === 0) return 0;

  const rows: {
    monitorId: string;
    userId: string;
    status: 'ONGOING' | 'RESOLVED';
    startedAt: Date;
    endedAt: Date | null;
    firstStatusCode: number | null;
    firstError: string | null;
    lastError: string | null;
    affectedChecks: number;
  }[] = [];

  for (const island of islands) {
    const nextSuccess = await findNextSuccessAfter(monitor.id, island.lastFailAt);

    // La última racha de fallos, sin un success posterior, es la única que
    // puede quedar ONGOING — y solo si el monitor está DOWN ahora mismo. Si
    // el monitor ya no está DOWN pero la racha nunca vio un success después
    // (p.ej. se desactivó a mitad de la caída), la cerramos igual: no hay
    // forma de saber cuándo "terminó", así que se resuelve en su último fallo
    // conocido en vez de dejar un incidente fantasma abierto para siempre.
    const isTrailingOpenRun = nextSuccess === null;
    const status: 'ONGOING' | 'RESOLVED' =
      isTrailingOpenRun && monitor.status === 'DOWN' ? 'ONGOING' : 'RESOLVED';
    const endedAt = status === 'ONGOING' ? null : (nextSuccess ?? island.lastFailAt);

    rows.push({
      monitorId: monitor.id,
      userId: monitor.userId,
      status,
      startedAt: island.startedAt,
      endedAt,
      firstStatusCode: island.firstStatusCode,
      firstError: island.firstError,
      lastError: island.firstError,
      affectedChecks: island.affectedChecks,
    });
  }

  if (!isDryRun) {
    await prisma.incident.createMany({ data: rows });
  }

  return rows.length;
}

async function main() {
  console.log(`🔧 Backfill de incidentes${isDryRun ? ' (DRY RUN, no escribe nada)' : ''}...\n`);

  const monitors = await prisma.monitor.findMany({
    select: { id: true, userId: true, status: true, name: true },
  });

  console.log(`📋 ${monitors.length} monitores encontrados\n`);

  let processed = 0;
  let skipped = 0;
  let totalIncidents = 0;

  for (const monitor of monitors) {
    const existingCount = await prisma.incident.count({ where: { monitorId: monitor.id } });

    if (existingCount > 0) {
      skipped++;
      console.log(`⏭️  ${monitor.name} (${monitor.id}) ya tiene ${existingCount} incidente(s), se saltea`);
      continue;
    }

    const created = await backfillMonitor(monitor);
    processed++;
    totalIncidents += created;

    if (created > 0) {
      console.log(`✅ ${monitor.name} (${monitor.id}): ${created} incidente(s)${isDryRun ? ' [dry-run]' : ''}`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🎉 Backfill ${isDryRun ? 'simulado' : 'completado'}`);
  console.log(`   • Monitores procesados: ${processed}`);
  console.log(`   • Monitores salteados (ya tenían incidentes): ${skipped}`);
  console.log(`   • Incidentes ${isDryRun ? 'a crear' : 'creados'}: ${totalIncidents}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el backfill:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
