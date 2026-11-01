export interface AlertConfig {
  webhookUrl?: string;
  staleThresholdMinutes: number;
  adapterFailureThreshold: number;
}

const DEFAULT_CONFIG: AlertConfig = {
  staleThresholdMinutes: 120,
  adapterFailureThreshold: 50,
};

export class AlertManager {
  private config: AlertConfig;

  constructor(config: Partial<AlertConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config, webhookUrl: process.env.ALERT_WEBHOOK_URL };
  }

  async sendAlert(title: string, message: string, severity: "info" | "warning" | "critical" = "warning") {
    console.error(`[ALERT:${severity.toUpperCase()}] ${title}: ${message}`);

    if (this.config.webhookUrl) {
      try {
        await fetch(this.config.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `[FreeEPG] ${title}`,
            content: message,
            severity,
          }),
        });
      } catch (error) {
        console.error("Failed to send alert webhook:", error);
      }
    }
  }

  async checkStaleEpg(lastGenerationAt: string | null) {
    if (!lastGenerationAt) {
      await this.sendAlert("EPG Generation Missing", "No EPG generation recorded", "critical");
      return;
    }

    const diffMinutes = (Date.now() - new Date(lastGenerationAt).getTime()) / 60000;
    if (diffMinutes > this.config.staleThresholdMinutes) {
      await this.sendAlert(
        "EPG Data Stale",
        `Last EPG generation was ${Math.round(diffMinutes)} minutes ago`,
        "warning"
      );
    }
  }

  async checkAdapterFailures(failures: Record<string, number>, total: Record<string, number>) {
    for (const [adapter, failCount] of Object.entries(failures)) {
      const totalCount = total[adapter] || 0;
      if (totalCount > 0) {
        const failureRate = (failCount / totalCount) * 100;
        if (failureRate > this.config.adapterFailureThreshold) {
          await this.sendAlert(
            "High Adapter Failure Rate",
            `Adapter ${adapter} has ${failureRate.toFixed(1)}% failure rate`,
            "warning"
          );
        }
      }
    }
  }
}

export const alertManager = new AlertManager();
