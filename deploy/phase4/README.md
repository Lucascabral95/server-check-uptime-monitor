# Phase 4 deployment

1. Create an agent token as an administrator:

```http
POST /api/v1/probe-agents
Authorization: Bearer <access-token>
Content-Type: application/json

{"name":"Secondary VPS","region":"secondary-buenos-aires","version":"0.1.0"}
```

The returned token is shown once. Put it only in the secondary VPS environment file and run:

```bash
cp .env.example .env
docker compose -f docker-compose.probe-agent.yml up -d --build
```

The agent has no database or Redis credentials. Restrict its egress to the control-plane HTTPS endpoint and monitored targets; do not expose PostgreSQL or Redis on the secondary host.
