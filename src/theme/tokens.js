/**
 * Centralized design tokens for the 5GNAPP dashboard.
 *
 * This is the single source of truth for the color scheme. To refine the
 * palette, edit the values here; every component reads its colors from the
 * theme (see `createAppTheme.js`) rather than hardcoding hex values.
 *
 * Each token is defined for both the `dark` and `light` color modes.
 */

export const darkTokens = {
  // Backgrounds
  bgApp: "#000a19",
  bgPanel: "#071528",
  bgSurface: "#08182d",
  bgElevated: "#0d2038",
  bgAlt: "#0a1b31",
  bgInput: "#08182d",
  bgHeaderRow: "#0d2038",

  // Text
  textTitle: "#f3f8ff",
  textPrimary: "#dbe8f7",
  textSecondary: "#b8cce4",
  textMuted: "#9bb0c9",
  textFaint: "#9bb0c9",
  textEyebrow: "#89a4c5",

  // Brand / accent
  accent: "#8fbfff",
  accentStrong: "#8fbfff",
  primaryMain: "#234f8a",
  primaryHover: "#2f66ad",

  // Borders
  border: "rgba(123, 161, 207, 0.24)",
  divider: "rgba(143, 172, 207, 0.26)",

  // Status
  success: "#35d48b",
  warning: "#ed6c02",
  statusPending: "#f4d35e",
  error: "#ff6f87",
  neutral: "#9e9e9e",

  // Buttons
  successBtn: "#1d6b5d",
  successBtnHover: "#248270",
  dangerBtn: "#8c2f3d",
  dangerBtnHover: "#a83a4a",

  // Interaction
  rowHover: "rgba(71, 137, 213, 0.14)",
  controlActiveBg: "rgba(71, 137, 213, 0.22)",

  // Gradients
  headerGradient: "linear-gradient(90deg, #0d2038 0%, #14345c 100%)",
  chatHeaderGradient: "linear-gradient(90deg, #071528 0%, #102844 100%)",

  // Elevation
  panelShadow: "0 10px 24px rgba(0, 0, 0, 0.34)",
};

export const lightTokens = {
  // Backgrounds
  bgApp: "#f4f6f8",
  bgPanel: "#ffffff",
  bgSurface: "#f3f6fa",
  bgElevated: "#ffffff",
  bgAlt: "#f8fafd",
  bgInput: "#ffffff",
  bgHeaderRow: "#f7f9fc",

  // Text
  textTitle: "#182235",
  textPrimary: "#11182E",
  textSecondary: "#536274",
  textMuted: "#536274",
  textFaint: "#888888",
  textEyebrow: "#5a6b80",

  // Brand / accent
  accent: "#23305a",
  accentStrong: "#11182E",
  primaryMain: "#11182E",
  primaryHover: "#2d3c6b",

  // Borders
  border: "#e0e4ef",
  divider: "#d9e1ec",

  // Status
  success: "#2e7d32",
  warning: "#ed6c02",
  statusPending: "#ECD05F",
  error: "#d32f2f",
  neutral: "#9e9e9e",

  // Buttons
  successBtn: "#4E6A66",
  successBtnHover: "#435A57",
  dangerBtn: "#641B25",
  dangerBtnHover: "#56161F",

  // Interaction
  rowHover: "#e0e4ef",
  controlActiveBg: "rgba(25, 118, 210, 0.08)",

  // Gradients
  headerGradient: "linear-gradient(90deg, #11182E 60%, #2d3c6b 100%)",
  chatHeaderGradient: "linear-gradient(90deg, #11182E 60%, #2d3c6b 100%)",

  // Elevation
  panelShadow: "none",
};

/**
 * Returns the resolved token set for a given color mode.
 * @param {"dark"|"light"} mode
 */
export function getTokens(mode) {
  return mode === "light" ? lightTokens : darkTokens;
}

export default getTokens;
