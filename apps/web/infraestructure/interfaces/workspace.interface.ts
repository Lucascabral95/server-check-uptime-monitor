export type WorkspaceRole = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";
export type WorkspacePlan = "FREE" | "PRO" | "BUSINESS";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: WorkspacePlan;
  ownerId: string;
}

export interface WorkspaceMembership {
  id: string;
  role: WorkspaceRole;
  workspace: Workspace;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface WorkspaceUsage {
  plan: WorkspacePlan;
  limits: { members: number; monitors: number; minIntervalSeconds: number };
  usage: { members: number; monitors: number };
}
