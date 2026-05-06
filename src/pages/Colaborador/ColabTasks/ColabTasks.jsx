// File: frontend/src/pages/Administrador/AdminDashboard/AdminDashboard.jsx
import React from "react";
import CollaboratorLayout from "../../../layouts/CollaboratorLayout";
import ColabTasksContent from "./ColabTasksContent";

const ColabProjects = () => {
    return (
        <CollaboratorLayout>
            <ColabTasksContent />
        </CollaboratorLayout>
    );
};

export default ColabProjects;