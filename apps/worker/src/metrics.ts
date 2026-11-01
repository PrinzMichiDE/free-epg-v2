import { Redis } from "ioredis";

export interface EpgGenerationMetrics {
  adapterFetchDuration: Record<string, number[]>;
  mergeDuration: number;
  programmeCountPerGeneration: number;
  errorRatePerAdapter: Record<string, number>;
  cacheHitRate: number;
  lastGenerationAt: string | null;
}

const METRICS_KEY = "freeepg:metrics:epg-generation";

export class MetricsCollector {
  private redis: Redis;

  constructor() {
    const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
    this.redis = new Redis(redisUrl);
  }

  async recordAdapterFetch(adapterName: string, durationMs: number, success: boolean) {
    const metrics = await this.getMetrics();
    if (!metrics.adapterFetchDuration[adapterName]) {
      metrics.adapterFetchDuration[adapterName] = [];
    }
    metrics.adapterFetchDuration[adapterName].push(durationMs);

    if (!success) {
      metrics.errorRatePerAdapter[adapterName] =
        (metrics.errorRatePerAdapter[adapterName] || 0) + 1;
    }

    await this.saveMetrics(metrics);
  }

  async recordMerge(durationMs: number) {
    const metrics = await this.getMetrics();
    metrics.mergeDuration = durationMs;
    await this.saveMetrics(metrics);
  }

  async recordGeneration(programmeCount: number) {
    const metrics = await this.getMetrics();
    metrics.programmeCountPerGeneration = programmeCount;
    metrics.lastGenerationAt = new Date().toISOString();
    await this.saveMetrics(metrics);
  }

  async recordCacheHit(hit: boolean) {
    const metrics = await this.getMetrics();
    if (hit) {
      metrics.cacheHitRate = (metrics.cacheHitRate * 0.9) + (1 * 0.1);
    } else {
      metrics.cacheHitRate = metrics.cacheHitRate * 0.9;
    }
    await this.saveMetrics(metrics);
  }

  async getMetrics(): Promise<EpgGenerationMetrics> {
    const data = await this.redis.get(METRICS_KEY);
    if (!data) {
      return {
        adapterFetchDuration: {},
        mergeDuration: 0,
        programmeCountPerGeneration: 0,
        errorRatePerAdapter: {},
        cacheHitRate: 0,
        lastGenerationAt: null,
      };
    }
    return JSON.parse(data);
  }

  private async saveMetrics(metrics: EpgGenerationMetrics) {
    await this.redis.set(METRICS_KEY, JSON.stringify(metrics), "EX", 3600);
  }

  async getAdapterStats() {
    const metrics = await this.getMetrics();
    const stats: Record<string, { avgDuration: number; errors: number }> = {};

    for (const [adapter, durations] of Object.entries(metrics.adapterFetchDuration)) {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      stats[adapter] = {
        avgDuration: Math.round(avg),
        errors: metrics.errorRatePerAdapter[adapter] || 0,
      };
    }

    return stats;
  }
}

export const metricsCollector = new MetricsCollector();
