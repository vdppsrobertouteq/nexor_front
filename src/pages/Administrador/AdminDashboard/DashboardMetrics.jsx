// File: frontend/src/pages/Administrador/AdminDashboard/AdminDashboard.jsx
import React from "react";
import AdminLayout from "../../../layouts/AdminLayout";
import DashboardMetricsContent from "./DashboardMetricsContent";

const DashboardMetrics = () => {
    return (
        <AdminLayout>
            <DashboardMetricsContent />
        </AdminLayout>
    );
};

export default DashboardMetrics;