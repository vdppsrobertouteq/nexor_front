// File: frontend/src/pages/Administrador/AdminDashboard/AdminDashboard.jsx
import React from "react";
import ClientLayout from "../../../layouts/ClientLayout";
import ClientProjectsContent from "./ClientProjectsContent";

const ClientProjects = () => {
    return (
        <ClientLayout>
            <ClientProjectsContent />
        </ClientLayout>
    );
};

export default ClientProjects;