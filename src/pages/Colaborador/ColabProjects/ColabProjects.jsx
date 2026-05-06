// File: frontend/src/pages/Administrador/AdminDashboard/AdminDashboard.jsx
import React from "react";
import CollaboratorLayout from "../../../layouts/CollaboratorLayout";
import ColabProjectsContent from "./ColabProjectsContent";

const ColabProjects = () => {
    return (
        <CollaboratorLayout>
            <ColabProjectsContent />
        </CollaboratorLayout>
    );
};

export default ColabProjects;