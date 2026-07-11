# Backup and restore runbook

La producción usa `server-check-backup.service` y `server-check-backup.timer`. El servicio genera un dump lógico de PostgreSQL y un RDB de Redis desde los contenedores internos, cifra ambos con `age` y luego los sincroniza con el bucket S3-compatible definido en `deploy/phase5/secrets/s3.env`.

## Ejecutar y comprobar un backup

```bash
sudo systemctl start server-check-backup.service
sudo journalctl -u server-check-backup.service -n 100 --no-pager
```

El servicio no necesita publicar PostgreSQL o Redis en el host. Requiere `age`, AWS CLI v2, Docker Compose y los archivos `s3.env` y `backup.env` con permisos `600`.

## Restore drill mensual

1. Elegí una copia concreta en el bucket y descargala a una máquina aislada.
2. Descifrá PostgreSQL con la clave privada age, descomprimí el `.sql.gz` y restauralo en una instancia PostgreSQL temporal, nunca sobre la base activa.
3. Ejecutá `prisma migrate deploy` contra esa instancia temporal y verificá tablas, migraciones, conteos y aislamiento de workspaces.
4. Descifrá el RDB solo si necesitás validar Redis. Detené la instancia Redis temporal antes de reemplazar su archivo de datos.
5. Registrá fecha, backup usado, duración, RPO y RTO en el log operacional.

El objetivo actual es RPO de 24 horas y RTO de 60 minutos. Un backup fallido o un restore drill fallido se trata como incidente operativo y bloquea cambios de esquema no urgentes.
