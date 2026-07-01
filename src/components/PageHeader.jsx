import React from "react";
import { Box, Typography, useTheme } from "@mui/material";

/**
 * Shared page header that matches the dashboard title style
 * (eyebrow + title + optional subtitle). Colors are theme-driven so it stays
 * consistent across light/dark modes.
 *
 * @param {string} [eyebrow]  small uppercase brand line above the title
 * @param {string} title      the page title
 * @param {string} [subtitle] optional supporting line below the title
 * @param {React.ReactNode} [actions] optional right-aligned actions
 */
function PageHeader({
  eyebrow = "5G Native Security Operations",
  title,
  subtitle,
  actions,
}) {
  const theme = useTheme();
  const c = theme.custom;

  return (
    <Box
      component="header"
      sx={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "18px",
        borderBottom: `1px solid ${c.divider}`,
        pb: 1.75,
      }}
    >
      <div>
        {eyebrow && (
          <Typography
            component="p"
            sx={{
              color: c.textEyebrow,
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              lineHeight: 1.2,
              mb: 0.75,
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </Typography>
        )}
        <Typography
          component="h1"
          variant="h4"
          sx={{
            color: c.textTitle,
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: "clamp(1.45rem, 2.1vw, 2rem)",
            fontWeight: 760,
            letterSpacing: 0,
            lineHeight: 1.12,
            mb: subtitle ? 0.75 : 0,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="subtitle1"
            sx={{
              color: c.textSecondary,
              fontSize: "0.95rem",
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </div>
      {actions && <div>{actions}</div>}
    </Box>
  );
}

export default PageHeader;
