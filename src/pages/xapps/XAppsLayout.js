import React from "react";
import { Link, Outlet } from "react-router-dom";

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
  return <h3 style={{ padding: 20 }}>Mobiflow Auditor Settings (stub)</h3>;
}

export default XAppsLayout;
