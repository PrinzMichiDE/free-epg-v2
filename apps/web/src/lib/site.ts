export const PAYPAL_DONATE_URL =
  "https://www.paypal.com/paypalme/michelfritzsch/5";

export const PAYPAL_DONATE_LABEL = "5 € via PayPal";

export const KOFI_DONATE_URL = "https://ko-fi.com/michelfritzsch";

export const KOFI_DONATE_LABEL = "Ko-fi";

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
] as const;
