import React from "react";
import { Box, Typography } from "@mui/material";
import PageHeader from "../components/PageHeader";

function ProfilePage() {
  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="Profile" />
      <Typography sx={{ mt: 3 }}>Placeholder for the Profile page.</Typography>
    </Box>
  );
}

export default ProfilePage;
