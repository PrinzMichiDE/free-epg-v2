const STORAGE_KEY = "freeepg:player-prefs";

export interface PlayerPreferences {
  viewMode?: "list" | "grid";
  countryFilter?: string;
  volume?: number;
  muted?: boolean;
  showEpgPanel?: boolean;
  theaterMode?: boolean;
}

const defaults: PlayerPreferences = {
  viewMode: "list",
  countryFilter: "all",
  volume: 1,
  muted: false,
  showEpgPanel: true,
  theaterMode: false,
};

export function readPlayerPreferences(): PlayerPreferences {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...(JSON.parse(raw) as PlayerPreferences) };
  } catch {
    return defaults;
  }
}

export function writePlayerPreferences(patch: Partial<PlayerPreferences>) {
  if (typeof window === "undefined") return;
  try {
    const current = readPlayerPreferences();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch }));
  } catch {
    // ignore
  }
}
