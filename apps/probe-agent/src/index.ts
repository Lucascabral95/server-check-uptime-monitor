import { createHash, createHmac } from "node:crypto";

interface ProbeJob {
  runId: string;
  monitorId: string;
  url: string;
  method?: string;
  timeoutMs?: number;
}

const controlPlane = process.env.CONTROL_PLANE_URL;
const region = process.env.PROBE_REGION;
const token = process.env.PROBE_TOKEN;
if (!controlPlane || !region || !token)
  throw new Error(
    "CONTROL_PLANE_URL, PROBE_REGION and PROBE_TOKEN are required",
  );
const CONTROL_PLANE: string = controlPlane;
const REGION: string = region;
const TOKEN: string = token;

async function heartbeat() {
  const response = await fetch(`${CONTROL_PLANE}/api/v1/probe-agents/${REGION}/heartbeat`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-probe-token": TOKEN },
    body: JSON.stringify({
      version: process.env.PROBE_VERSION ?? "0.1.0",
      queueLagMs: 0,
      capacity: 1,
    }),
  });
  await response.body?.cancel();

  if (!response.ok) {
    throw new Error(`Probe heartbeat was rejected with status ${response.status}`);
  }

  console.info(
    JSON.stringify({ event: "probe.heartbeat", region: REGION, status: response.status }),
  );
}

function logHeartbeatFailure(cause: unknown) {
  const message = cause instanceof Error ? cause.message : "Unknown heartbeat failure";
  console.error(JSON.stringify({ event: "probe.heartbeat.failed", region: REGION, message }));
}

export async function executeProbe(job: ProbeJob) {
  const started = Date.now();
  let statusCode = 0;
  let error: string | undefined;
  try {
    const response = await fetch(job.url, {
      method: job.method ?? "GET",
      signal: AbortSignal.timeout(job.timeoutMs ?? 10000),
    });
    statusCode = response.status;
    await response.body?.cancel();
    return {
      runId: job.runId,
      monitorId: job.monitorId,
      success: response.ok,
      statusCode,
      durationMs: Date.now() - started,
    };
  } catch (cause) {
    error = cause instanceof Error ? cause.message : "Probe failed";
    return {
      runId: job.runId,
      monitorId: job.monitorId,
      success: false,
      statusCode,
      durationMs: Date.now() - started,
      error,
    };
  }
}

export async function publishResult(
  result: Awaited<ReturnType<typeof executeProbe>>,
) {
  const signature = createHmac("sha256", TOKEN)
    .update(JSON.stringify(result))
    .digest("hex");
  await fetch(`${CONTROL_PLANE}/api/v1/probe-agents/${REGION}/results`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-probe-token": TOKEN,
      "x-probe-signature": signature,
    },
    body: JSON.stringify(result),
  });
}

async function pollJobs() {
  const response = await fetch(
    `${CONTROL_PLANE}/api/v1/probe-agents/${REGION}/jobs`,
    { headers: { "x-probe-token": TOKEN } },
  );
  if (!response.ok) return;
  const jobs = (await response.json()) as ProbeJob[];
  for (const job of jobs) await publishResult(await executeProbe(job));
}

void heartbeat().catch(logHeartbeatFailure);
setInterval(() => void heartbeat().catch(logHeartbeatFailure), 30000).unref();
void pollJobs().catch(() => undefined);
setInterval(() => void pollJobs().catch(() => undefined), 5000).unref();
console.log(
  `Probe agent ${REGION} started (${createHash("sha256").update(REGION).digest("hex").slice(0, 8)})`,
);
