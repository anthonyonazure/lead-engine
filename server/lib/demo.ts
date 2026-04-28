export function isDemoMode(): boolean {
  return process.env.LEAD_ENGINE_DEMO_MODE === 'true' || process.env.LEAD_ENGINE_DEMO_MODE === '1';
}
