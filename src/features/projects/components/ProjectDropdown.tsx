import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useProject } from "../context/ProjectContext";
import { api } from "../../../shared/api/axiosClient";

export const ProjectDropdown: React.FC = () => {
  const { activeProject, setActiveProject } = useProject();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["trackedProjects"],
    queryFn: async () => {
      const response = await api.get("/projects");
      // Safely ensure data structure parsing context arrays layout allocation matching standard array responses
      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
  });

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-slate-400 font-medium">
        Active Project:
      </label>
      {isLoading ? (
        <div className="h-9 w-40 bg-slate-900 animate-pulse rounded-lg border border-slate-800" />
      ) : (
        <select
          value={activeProject?.id || ""}
          onChange={(e) => {
            const selected = projects?.find(
              (p: any) => String(p.id) === e.target.value,
            );
            if (selected) {
              setActiveProject({
                id: String(selected.id),
                name: selected.name,
                owner: selected.owner,
                repoName: selected.repoName,
              });
            }
          }}
          className="bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500"
        >
          <option value="" disabled>
            Select a workspace...
          </option>
          {projects?.map((project: any) => (
            <option key={project.id} value={String(project.id)}>
              {project.owner}/{project.repoName}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};
