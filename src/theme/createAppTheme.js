import { createTheme } from "@mui/material/styles";
import { getTokens } from "./tokens";

/**
 * Builds the MUI theme for a given color mode.
 *
 * The design tokens (see `tokens.js`) are mapped onto the standard MUI palette
 * slots so that MUI components and `sx` shorthands inherit them automatically,
 * and the full token set is also exposed under `theme.custom` for app-specific
 * needs (gradients, status colors, surfaces, etc.).
 *
 * @param {"dark"|"light"} mode
 */
export function createAppTheme(mode) {
  const tokens = getTokens(mode);

  return createTheme({
    palette: {
      mode,
      primary: {
        main: tokens.primaryMain,
        contrastText: "#ffffff",
      },
      success: { main: tokens.success },
      error: { main: tokens.error },
      warning: { main: tokens.warning },
      divider: tokens.divider,
      background: {
        default: tokens.bgApp,
        paper: tokens.bgPanel,
      },
      text: {
        primary: tokens.textPrimary,
        secondary: tokens.textMuted,
      },
    },
    // App-specific tokens, available via useTheme().custom.*
    custom: tokens,
  });
}

export default createAppTheme;
