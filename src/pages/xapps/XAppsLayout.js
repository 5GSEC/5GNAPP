import React from "react";
import { Link, Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import PageHeader from "../../components/PageHeader";

/* Parent layout for /xapps – keeps sidebar and renders children via <Outlet />. */
export function XAppsLayout() {
  return (
    <div style={{ padding: "0 20px 20px", boxSizing: "border-box", width: "100%" }}>
      <Outlet />
    </div>
  );
}

export function XAppsIndex() {
  return (
    <p style={{ padding: 20 }}>
      Select an xApp on the left, or visit<br />
      <Link to="mobiexpert">/xapps/mobiexpert</Link>&nbsp;or&nbsp;
      <Link to="mobillm">/xapps/mobillm</Link>.
    </p>
  );
}

export function MobiflowAuditorPage() {
  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="Mobiflow Auditor Settings" subtitle="Stub" />
    </Box>
  );
}

export default XAppsLayout;
