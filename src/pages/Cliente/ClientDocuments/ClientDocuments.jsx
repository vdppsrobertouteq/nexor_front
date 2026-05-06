// File: frontend/src/pages/Administrador/AdminDashboard/AdminDashboard.jsx
import React from "react";
import ClientLayout from "../../../layouts/ClientLayout";
import DocumentsContent from "./DocumentsContent";

const ClientDocuments = () => {
    return (
        <ClientLayout>
            <DocumentsContent />
        </ClientLayout>
    );
};

export default ClientDocuments;