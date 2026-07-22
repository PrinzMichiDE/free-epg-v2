export type HealthStatus = "ok" | "error";

export function evaluateOverallHealth(
  checks: Record<string, HealthStatus>
): "healthy" | "degraded" {
  return Object.values(checks).every((v) => v === "ok") ? "healthy" : "degraded";
}
