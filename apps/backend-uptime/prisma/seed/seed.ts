import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { 
  SEED_USERS,
  ADMIN_USER,
  REGULAR_USER,
} from './data/user.data';
import { MonitorFactory } from './factories/monitor.factory';
import { PingLogFactory } from './factories/ping-log.factory';
import { config } from 'dotenv';
import { Queue } from 'bullmq';

config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/servercheck_dev',
});
const prisma = new PrismaClient({ adapter });

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
};

const monitorQueue = new Queue('uptime-monitor', { connection: redisConnection });

async function clearBullMQQueue() {
  console.log('🧹 Limpiando colas de BullMQ...');

  try {
    await monitorQueue.drain();
    const repeatJobs = await monitorQueue.getRepeatableJobs();
    for (const job of repeatJobs) {
      await monitorQueue.removeRepeatableByKey(job.key);
    }
    console.log(`✅ Cola de BullMQ limpiada (${repeatJobs.length} jobs recurrentes eliminados)`);
  } catch (error) {
    console.warn(`⚠️  Advertencia: No se pudo limpiar la cola de BullMQ: ${error.message}`);
  }
}

async function createMonitorJobs(monitors: Array<{ id: string; frequency: number; isActive: boolean }>) {
  console.log('📋 Creando jobs recurrentes para monitores activos...');

  let jobsCreated = 0;

  for (const monitor of monitors) {
    if (!monitor.isActive) continue;

    const jobId = `monitor:${monitor.id}`;

    try {
      await monitorQueue.add(
        'check-monitor',
        { monitorId: monitor.id },
        {
          jobId,
          repeat: {
            every: monitor.frequency * 1000,
          },
        },
      );
      jobsCreated++;
    } catch (error) {
      console.warn(`⚠️  No se pudo crear job para monitor ${monitor.id}: ${error.message}`);
    }
  }

  console.log(`✅ Jobs creados: ${jobsCreated}`);
  return jobsCreated;
}

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  await clearBullMQQueue();
  console.log('');

  console.log('🧹 Limpiando datos existentes...');
  await prisma.pingLog.deleteMany();
  await prisma.monitor.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Datos limpiados\n');

  console.log('👥 Creando usuarios...');
  const users = await Promise.all(
    SEED_USERS.map((userData) => prisma.user.create({ data: userData })),
  );
  console.log(`✅ Admin: ${ADMIN_USER.email}`);
  console.log(`✅ User: ${REGULAR_USER.email}\n`);

  console.log('🖥️  Creando 6 monitores para Admin...');
  const adminMonitorsData = MonitorFactory.createMany(ADMIN_USER.id, 6);
  const adminMonitors = await Promise.all(
    adminMonitorsData.map((data) => prisma.monitor.create({ data })),
  );
  console.log(`✅ ${adminMonitors.length} monitores creados para Admin:`);
  adminMonitors.forEach((m, i) => {
    console.log(`   ${i + 1}. ${m.name} - ${m.url} (${m.frequency}s) - ${m.status}`);
  });
  console.log('');

  console.log('🖥️  Creando 6 monitores para Usuario Regular...');
  const userMonitorsData = MonitorFactory.createMany(REGULAR_USER.id, 6);
  const userMonitors = await Promise.all(
    userMonitorsData.map((data) => prisma.monitor.create({ data })),
  );
  console.log(`✅ ${userMonitors.length} monitores creados para Usuario Regular:`);
  userMonitors.forEach((m, i) => {
    console.log(`   ${i + 1}. ${m.name} - ${m.url} (${m.frequency}s) - ${m.status}`);
  });
  console.log('');

  console.log('📊 Creando 30 ping logs por monitor (coherentes con el estado)...');
  let totalLogs = 0;
  let totalSuccess = 0;
  let totalFailed = 0;

  for (const monitor of [...adminMonitors, ...userMonitors]) {
    const isHealthy = monitor.status === 'UP';
    const logs = PingLogFactory.createMany(monitor.id, 30, isHealthy);
    await prisma.pingLog.createMany({ data: logs });
    
    const successCount = logs.filter(log => log.success).length;
    totalLogs += logs.length;
    totalSuccess += successCount;
    totalFailed += (logs.length - successCount);
  }
  console.log(`✅ ${totalLogs} ping logs creados (30 por monitor)`);
  console.log(`   📈 Exitosos: ${totalSuccess} (${Math.round(totalSuccess/totalLogs*100)}%)`);
  console.log(`   📉 Fallidos: ${totalFailed} (${Math.round(totalFailed/totalLogs*100)}%)\n`);

  const allMonitors = [...adminMonitors, ...userMonitors];
  await createMonitorJobs(allMonitors);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Seed completado exitosamente!\n');
  console.log('📊 Resumen:');
  console.log(`   • Usuarios: ${users.length}`);
  console.log(`   • Monitores: ${allMonitors.length} (6 por usuario)`);
  console.log(`   • Ping Logs: ${totalLogs} (30 por monitor)`);
  console.log(`   • Jobs en BullMQ: ${allMonitors.filter(m => m.isActive).length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('👤 Credenciales de acceso:');
  console.log(`   Admin: ${ADMIN_USER.email}`);
  console.log(`   User:  ${REGULAR_USER.email}`);
  console.log('\n📋 Monitores creados:');
  console.log('   ✅ 4 sitios saludables (95% uptime):');
  console.log('      - Google Search (60s)');
  console.log('      - GitHub API (5min)');
  console.log('      - JSONPlaceholder API (10min)');
  console.log('      - HTTPBin Status (30min)');
  console.log('   ❌ 2 sitios con problemas (10% uptime):');
  console.log('      - Invalid Domain (1h)');
  console.log('      - HTTPBin Error 500 (2h)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await monitorQueue.close();
  });