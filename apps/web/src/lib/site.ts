export const PAYPAL_DONATE_URL =
  "https://www.paypal.com/paypalme/michelfritzsch/5";

export const PAYPAL_DONATE_LABEL = "5 € via PayPal";

export const KOFI_DONATE_URL = "https://ko-fi.com/michelfritzsch";

export const KOFI_DONATE_LABEL = "Ko-fi";

export const AMAZON_SUPPORT_URL = "https://amzn.to/4w1wbC5";

export const AMAZON_SUPPORT_LABEL = "Amazon";

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
