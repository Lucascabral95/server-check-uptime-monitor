# Probe Agent

Stateless regional probe with no PostgreSQL or Redis credentials. Configure `CONTROL_PLANE_URL`, `PROBE_REGION`, and `PROBE_TOKEN`; the agent sends heartbeats and publishes signed-by-transport probe results to the control plane.
