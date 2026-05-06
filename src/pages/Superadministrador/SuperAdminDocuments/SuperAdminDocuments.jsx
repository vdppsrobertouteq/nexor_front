// File: frontend/src/pages/Administrador/AdminDashboard/AdminDashboard.jsx
import React from "react";
import SuperAdminLayout from "../../../layouts/SuperAdminLayout";
import DocumentsContent from "./DocumentsContent";

const SuperAdminDocuments = () => {
    return (
        <SuperAdminLayout>
            <DocumentsContent />
        </SuperAdminLayout>
    );
};

export default SuperAdminDocuments;