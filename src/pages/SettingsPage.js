import React from "react";
import { Box, Typography } from "@mui/material";
import PageHeader from "../components/PageHeader";

function SettingsPage() {
  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="Settings" />
      <Typography sx={{ mt: 3 }}>Placeholder for the Settings page.</Typography>
    </Box>
  );
}

export default SettingsPage;
