# Deploy and rollback

1. Confirmá la revisión de Git a desplegar y ejecutá `sh ./scripts/deploy-primary.sh` en la VPS principal. El script valida secretos, ejecuta una sola vez `prisma migrate deploy` y espera `/health/readiness` por Caddy.
2. Verificá el dashboard de Grafana, `/metrics`, logs de Loki, trazas de Tempo, profundidad de colas y heartbeats de agentes antes de declarar el despliegue sano.
3. Conservá la revisión anterior hasta que los smoke checks y el backup diario hayan sido verificados.

Para revertir código, hacé checkout de la revisión anterior y volvé a ejecutar el script. Nunca reviertas una migración automáticamente: usá una migración aditiva hacia adelante o restaurá un backup tras declarar un incidente y validar la recuperación en una base aislada.
