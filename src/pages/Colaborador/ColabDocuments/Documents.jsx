// File: frontend/src/pages/Administrador/AdminDashboard/AdminDashboard.jsx
import React from "react";
import CollaboratorLayout from "../../../layouts/CollaboratorLayout";
import DocumentsContent from "./DocumentsContent";

const ColabProjects = () => {
    return (
        <CollaboratorLayout>
            <DocumentsContent />
        </CollaboratorLayout>
    );
};

export default ColabProjects;