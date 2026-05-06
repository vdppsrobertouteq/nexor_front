// File: frontend/src/pages/Administrador/AdminDashboard/AdminDashboard.jsx
import React from "react";
import AdminLayout from "../../../layouts/AdminLayout";
import DocumentsContent from "./DocumentsContent";

const AdminDocuments = () => {
    return (
        <AdminLayout>
            <DocumentsContent />
        </AdminLayout>
    );
};

export default AdminDocuments;