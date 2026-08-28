export const CALENDARIO_VIEWS = ["month", "week"] as const;
export type CalendarioView = (typeof CALENDARIO_VIEWS)[number];

export const COR_NEUTRA_EVENTO = "#607D8B";
export const COR_FALLBACK_AREA = "#9E9E9E";
export const REGEX_HORA = /^([01]\d|2[0-3]):([0-5]\d)$/;
export const REGEX_COR_HEX = /^#[0-9A-Fa-f]{6}$/;
