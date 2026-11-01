import type { XmltvDocument } from "@freeepg/epg-core";
import type { EpgSourceAdapter } from "../types.js";

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  timeoutMs?: number;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  timeoutMs: 120000,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateBackoff(attempt: number, initialDelayMs: number, maxDelayMs: number): number {
  const delay = initialDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * 0.1 * delay;
  return Math.min(delay + jitter, maxDelayMs);
}

export abstract class BaseAdapter implements EpgSourceAdapter {
  abstract name: string;
  abstract type: string;
  abstract priority: number;

  protected retryOptions: RetryOptions = DEFAULT_RETRY_OPTIONS;

  abstract fetchCountry(countryCode: string): Promise<XmltvDocument | null>;

  fetchGlobal?(): Promise<XmltvDocument | null>;

  protected async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    retryOptions: RetryOptions = this.retryOptions
  ): Promise<Response | null> {
    const opts = { ...DEFAULT_RETRY_OPTIONS, ...retryOptions };
    let lastError: unknown;

    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), opts.timeoutMs);

        const res = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          return res;
        }

        if (res.status >= 400 && res.status < 500 && res.status !== 429) {
          return res;
        }

        lastError = new Error(`HTTP ${res.status}`);
      } catch (error) {
        lastError = error;
      }

      if (attempt < opts.maxRetries) {
        const delay = calculateBackoff(attempt, opts.initialDelayMs, opts.maxDelayMs);
        await sleep(delay);
      }
    }

    return null;
  }
}

export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: "closed" | "open" | "half-open" = "closed";

  constructor(
    private threshold = 3,
    private timeoutMs = 300000 // 5 minutes
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T | null> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime > this.timeoutMs) {
        this.state = "half-open";
      } else {
        return null;
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = "closed";
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.threshold) {
      this.state = "open";
    }
  }

  getState() {
    return this.state;
  }

  reset() {
    this.failures = 0;
    this.state = "closed";
    this.lastFailureTime = 0;
  }
}
