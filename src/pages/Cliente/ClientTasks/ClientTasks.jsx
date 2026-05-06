// File: frontend/src/pages/Administrador/AdminDashboard/AdminDashboard.jsx
import React from "react";
import CollaboratorLayout from "../../../layouts/CollaboratorLayout";
import ClientTasksContent from "./ClientTasksContent";

const ColabProjects = () => {
    return (
        <CollaboratorLayout>
            <ClientTasksContent />
        </CollaboratorLayout>
    );
};

export default ColabProjects;