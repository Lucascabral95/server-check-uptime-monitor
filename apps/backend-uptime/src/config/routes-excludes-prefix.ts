const routesExcludesPrefix = [
  '',
  '/health',
  '/health/liveness',
  '/health/readiness',
  '/status/(.*)',
  '/metrics',
  '/metrics/(.*)',
];

export default routesExcludesPrefix;
