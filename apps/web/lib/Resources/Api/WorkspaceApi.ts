import axiosInstance from "@/infraestructure/Api/Axios-config";
import { isAxiosError } from "axios";
import {
  Project,
  WorkspaceMembership,
  WorkspaceUsage,
} from "@/infraestructure/interfaces/workspace.interface";

async function request<T>(operation: () => Promise<{ data: T }>): Promise<T> {
  try {
    return (await operation()).data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw {
        status: error.response?.status ?? null,
        message: error.response?.data?.message ?? error.message,
      };
    }
    throw error;
  }
}

export const listWorkspaces = () =>
  request<WorkspaceMembership[]>(() => axiosInstance.get("/workspaces"));
export const createWorkspace = (name: string) =>
  request(() => axiosInstance.post("/workspaces", { name }));
export const getWorkspaceUsage = (workspaceId: string) =>
  request<WorkspaceUsage>(() =>
    axiosInstance.get(`/workspaces/${workspaceId}/usage`),
  );
export const listWorkspaceProjects = (workspaceId: string) =>
  request<Project[]>(() =>
    axiosInstance.get(`/workspaces/${workspaceId}/projects`),
  );
export const createWorkspaceProject = (
  workspaceId: string,
  data: { name: string; description?: string },
) =>
  request<Project>(() =>
    axiosInstance.post(`/workspaces/${workspaceId}/projects`, data),
  );
export const listWorkspaceMonitors = (workspaceId: string) =>
  request(() => axiosInstance.get(`/workspaces/${workspaceId}/monitors`));
