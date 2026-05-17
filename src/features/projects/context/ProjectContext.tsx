import React, { createContext, useContext, useState, useEffect } from "react";
import {
  ActiveProject,
  ProjectContext as IProjectContext,
} from "../../../shared/types/projects.types";

const ProjectContext = createContext<IProjectContext | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeProject, setActiveProjectState] = useState<ActiveProject | null>(
    null,
  );

  useEffect(() => {
    const savedProject = localStorage.getItem("activeProject");
    if (savedProject) {
      setActiveProjectState(JSON.parse(savedProject));
    }
  }, []);

  const setActiveProject = (project: ActiveProject) => {
    setActiveProjectState(project);
    localStorage.setItem("activeProject", JSON.stringify(project));
  };

  return (
    <ProjectContext.Provider value={{ activeProject, setActiveProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context)
    throw new Error("useProject must be used within a ProjectProvider");
  return context;
};
