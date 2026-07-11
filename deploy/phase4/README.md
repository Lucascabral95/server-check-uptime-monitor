# Probe agent secundario

Este Compose se usa en el paso de agente de la guía operativa de [phase 5](../phase5/README.md). No es un flujo de despliegue independiente.

Después de registrar el agente con una cuenta administradora, guardá el token de una sola vez exclusivamente en `deploy/phase4/.env` y ejecutá desde la VPS secundaria:

```bash
sh ./scripts/deploy-probe-agent.sh
```

El script valida `CONTROL_PLANE_URL`, `PROBE_REGION` y `PROBE_TOKEN`, construye desde el lockfile raíz y espera un log de heartbeat aceptado. El agente no recibe credenciales de PostgreSQL ni Redis y no publica puertos.
