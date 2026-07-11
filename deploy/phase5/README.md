# Despliegue manual de producción: dos VPS con Docker Compose

Este es el único orden operativo para producción. La VPS principal ejecuta el control plane, Caddy y la observabilidad; la VPS secundaria ejecuta únicamente `probe-agent`. No requiere Terraform, Kubernetes, registry de imágenes ni CI/CD.

| Host | Servicios | Puertos públicos |
| --- | --- | --- |
| Principal | PostgreSQL, Redis, API, web, Caddy, Prometheus, Grafana, Loki, Tempo, OpenTelemetry Collector y Alloy | `80/tcp`, `443/tcp`, `51820/udp`; Grafana solo `127.0.0.1:3001` |
| Secundaria | probe-agent y WireGuard | ninguno de Docker; `51820/udp` saliente hacia la principal |

## 1. Preparar ambas VPS

Usá Linux, Docker Engine con el plugin Docker Compose v2, `curl` y WireGuard. En la principal también instalá `age` y AWS CLI v2 para los backups. El ejemplo asume el checkout en `/opt/server-check` y un usuario de servicio `servercheck` con acceso al socket Docker.

```bash
sudo useradd --system --create-home --shell /usr/sbin/nologin servercheck
sudo usermod -aG docker servercheck
sudo mkdir -p /opt/server-check
sudo chown -R servercheck:servercheck /opt/server-check
```

Copiá el repositorio a esa ruta, verificá que la revisión a desplegar esté completa y ejecutá los scripts desde la raíz. Las imágenes se construyen localmente desde el monorepo con el único `package-lock.json`; no se usa `npm install` dentro de Docker.

## 2. Configurar la VPS principal

1. Creá `deploy/phase5/.env` desde `.env.example`. Reemplazá dominio, valores públicos de Cognito y la versión de la revisión.
2. Creá `deploy/phase5/secrets/bootstrap.env` desde su ejemplo, cargalo fuera del historial y generá los secretos:

   ```bash
   set -a
   . deploy/phase5/secrets/bootstrap.env
   set +a
   sh ./scripts/bootstrap-production-secrets.sh
   ```

3. Creá `deploy/phase5/secrets/s3.env` y `backup.env` a partir de sus ejemplos. El bucket debe tener acceso privado, versionado, lifecycle y una credencial limitada a su prefijo.
4. Restringí los permisos:

   ```bash
   chmod 700 deploy/phase5/secrets
   chmod 600 deploy/phase5/secrets/*.env deploy/phase5/secrets/grafana_admin_password
   ```

5. Configurá el registro DNS A/AAAA de `PUBLIC_DOMAIN` hacia la VPS principal y confirmá que TCP 80/443 llega a Caddy. Caddy solicita y renueva TLS automáticamente.

El preflight rechaza secretos faltantes, placeholders, enlaces simbólicos y archivos leíbles por grupo u otros usuarios.

## 3. Configurar WireGuard y firewall

Seguí las plantillas y la guía de [WireGuard](wireguard/README.md) en ambos hosts antes de registrar el agente. El dominio del control plane debe resolver en la secundaria a `10.44.0.1`, manteniendo el nombre que cubre el certificado TLS.

## 4. Levantar la VPS principal

```bash
sh ./scripts/deploy-primary.sh
```

El script valida la configuración, ejecuta `docker compose config`, levanta PostgreSQL y Redis, espera sus healthchecks, ejecuta `migrate` una única vez y aborta ante cualquier error de migración. Después construye y actualiza API y web, espera `/health/readiness` a través de Caddy y no publica PostgreSQL ni Redis.

Para una actualización posterior repetí el mismo comando. No ejecutes migraciones desde el `CMD` de la API ni hagas rollback automático de una migración.

## 5. Registrar y levantar el agente secundario

Con un access token de administrador, registrá una región única después de que la principal esté sana:

```bash
curl --fail --show-error --request POST "https://status.example.com/api/v1/probe-agents" \
  --header "Authorization: Bearer <admin-access-token>" \
  --header 'Content-Type: application/json' \
  --data '{"name":"Secondary VPS","region":"secondary-buenos-aires","version":"0.1.0"}'
```

El token de la respuesta se muestra una sola vez. En la VPS secundaria, creá `deploy/phase4/.env` desde su ejemplo, almacenalo con modo `600`, usá el dominio privado por WireGuard y ejecutá:

```bash
sh ./scripts/deploy-probe-agent.sh
```

El script no simula un heartbeat: espera el evento estructurado que el agente emite solo después de recibir una respuesta exitosa del control plane. Para una comprobación adicional con rol administrador, consultá `GET /api/v1/probe-agents/health`.

## 6. Verificar métricas, logs y trazas

Grafana queda en loopback en la VPS principal. Abrí un túnel SSH desde tu equipo:

```bash
ssh -L 3000:127.0.0.1:3001 <operator>@<primary-vps>
```

Ingresá a `http://localhost:3000` con la contraseña en `grafana_admin_password`. Al iniciar, Grafana aprovisiona automáticamente los datasources Prometheus, Loki y Tempo, además del dashboard `Server Check`.

- Confirmá la métrica `server_check_http_requests_total` en Prometheus y en el dashboard.
- En Explore/Loki buscá `{source="docker"}`; Alloy lee los archivos JSON de Docker en modo solo lectura, sin montar el socket Docker.
- En Explore/Tempo buscá trazas de `service.name = server-check-api`. El API exporta OTLP al collector y este lo reenvía a Tempo.

No se configura Alertmanager ni canales externos en esta etapa. Las reglas de Prometheus existentes permanecen como señales para consulta local.

## 7. Instalar y probar backups diarios

Instalá las unidades en la VPS principal después de crear los secretos S3 y age:

```bash
sudo install -D -m 0644 deploy/phase5/systemd/server-check-backup.service /etc/systemd/system/server-check-backup.service
sudo install -D -m 0644 deploy/phase5/systemd/server-check-backup.timer /etc/systemd/system/server-check-backup.timer
sudo systemctl daemon-reload
sudo systemctl enable --now server-check-backup.timer
sudo systemctl start server-check-backup.service
sudo journalctl -u server-check-backup.service -n 100 --no-pager
```

El servicio obtiene dumps desde los contenedores internos, los cifra con age, los sube al bucket S3-compatible y conserva como máximo `BACKUP_RETENTION_DAYS` días en disco. Para el restore drill mensual, seguí [backup-restore](../../docs/runbooks/backup-restore.md) y restaurá primero en una instancia temporal.

## Operación y límites

- Los límites de CPU, memoria y PID de Compose son límites básicos para esta etapa; dimensionálos con métricas reales antes de aumentar carga.
- Tempo usa almacenamiento local con retención de siete días. Si se necesita retención o alta disponibilidad mayores, migralo a object storage como trabajo independiente.
- Alloy necesita el directorio de logs JSON de Docker. Si el host cambia el logging driver o el directorio raíz de Docker, actualizá el bind mount y `observability/alloy.config.alloy` de forma conjunta.
