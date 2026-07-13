export const PAYPAL_DONATE_URL =
  "https://www.paypal.com/paypalme/michelfritzsch/5";

export const PAYPAL_DONATE_LABEL = "5 € via PayPal";

export const KOFI_DONATE_URL = "https://ko-fi.com/michelfritzsch";

export const KOFI_DONATE_LABEL = "Ko-fi";

export const AMAZON_SUPPORT_URL = "https://amzn.to/4w1wbC5";

export const AMAZON_SUPPORT_LABEL = "Amazon";

export const TRADE_RE_AFFILIATE_URL = "https://refnocode.trade.re/5hldqrn8";

export const TRADE_RE_AFFILIATE_LABEL = "trade.re";

export const SHOOP_AFFILIATE_URL = "https://www.shoop.de/invite/Qvifjsukxa/";

export const SHOOP_AFFILIATE_LABEL = "Shoop";

export const AFFILIATE_OPTIONS = [
  {
    id: "amazon",
    url: AMAZON_SUPPORT_URL,
    label: "Amazon",
    ariaLabel: `Affiliate — ${AMAZON_SUPPORT_LABEL}`,
  },
  {
    id: "shoop",
    url: SHOOP_AFFILIATE_URL,
    label: "Shoop",
    ariaLabel: `Affiliate — ${SHOOP_AFFILIATE_LABEL}`,
  },
  {
    id: "tradere",
    url: TRADE_RE_AFFILIATE_URL,
    label: "trade.re",
    ariaLabel: `Affiliate — ${TRADE_RE_AFFILIATE_LABEL}`,
  },
] as const;

export const DONATE_OPTIONS = [
  {
    id: "paypal",
    url: PAYPAL_DONATE_URL,
    label: "PayPal",
    amountLabel: "5 €",
    ariaLabel: `Spenden — ${PAYPAL_DONATE_LABEL}`,
  },
  {
    id: "kofi",
    url: KOFI_DONATE_URL,
    label: "Ko-fi",
    amountLabel: null,
    ariaLabel: `Spenden — ${KOFI_DONATE_LABEL}`,
  },
  {
    id: "amazon",
    url: AMAZON_SUPPORT_URL,
    label: "Amazon",
    amountLabel: null,
    ariaLabel: `Unterstützung — ${AMAZON_SUPPORT_LABEL}`,
  },
] as const;
