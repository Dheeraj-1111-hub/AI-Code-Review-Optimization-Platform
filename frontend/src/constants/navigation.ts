import {
  LayoutDashboard,
  GitPullRequest,
  FolderGit2,
  Bot,
  BarChart3,
  Settings,
  Code2,
} from "lucide-react";

export type NavItem = {
  to: string;
  icon: React.ElementType;
  label: string;
  badge?: string;
  children?: { to: string; params?: any; label: string }[];
};

export const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard",     icon: LayoutDashboard, label: "Dashboard" },
  { to: "/reviews",       icon: GitPullRequest,  label: "Reviews" },
  { to: "/repositories",  icon: FolderGit2,      label: "Repositories" },
  { to: "/review",        icon: Code2,           label: "Review Workspace" },
  { to: "/pr-simulator",  icon: GitPullRequest,  label: "PR Simulator" },

  { to: "/analytics",     icon: BarChart3,       label: "Analytics" },

  { to: "/settings",      icon: Settings,        label: "Settings" },
];
