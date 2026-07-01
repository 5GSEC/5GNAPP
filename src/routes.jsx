import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import DashboardPage from "./pages/DashboardPage";
import IssuesPage from "./pages/IssuesPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import CompliancePage from "./pages/CompliancePage";
import MobieXpertPage from "./pages/MobieXpertPage";
import MobiLLMPage from "./pages/MobiLLMPage";
import { XAppsLayout, XAppsIndex, MobiflowAuditorPage } from "./pages/xapps/XAppsLayout";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/issues" element={<IssuesPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/compliance" element={<CompliancePage />} />

      {/* /xapps parent + nested children */}
      <Route path="/xapps" element={<XAppsLayout />}>
        <Route index element={<XAppsIndex />} />
        <Route path="mobiexpert" element={<MobieXpertPage />} />
        <Route path="mobiflow-auditor" element={<MobiflowAuditorPage />} />
        <Route path="mobillm" element={<MobiLLMPage />} />
        <Route path="*" element={<div style={{ padding: 20 }}>xApp Not Found</div>} />
      </Route>

      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<div style={{ padding: 20 }}>Page Not Found</div>} />
    </Routes>
  );
}

export default AppRoutes;
