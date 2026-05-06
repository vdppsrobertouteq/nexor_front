// File: frontend/src/pages/Administrador/AdminDashboard/AdminDashboard.jsx
import React from "react";
import SuperAdminLayout from "../../../layouts/SuperAdminLayout";
import DashboardMetricsContent from "./DashboardMetricsContent";

const SuperDashboardMetrics = () => {
    return (
        <SuperAdminLayout>
            <DashboardMetricsContent />
        </SuperAdminLayout>
    );
};

export default SuperDashboardMetrics;