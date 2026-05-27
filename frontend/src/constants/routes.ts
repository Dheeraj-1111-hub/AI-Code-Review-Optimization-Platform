export const ROUTES = {
  HOME:          "/",
  LOGIN:         "/login",
  SIGNUP:        "/signup",
  DASHBOARD:     "/dashboard",
  REVIEWS:       "/reviews",
  REVIEW:        "/review",
  REPOSITORIES:  "/repositories",
  PR_SIMULATOR:  "/pr-simulator",
  AGENTS:        "/agents",
  ANALYTICS:     "/analytics",
  TEAM:          "/team",
  SETTINGS:      "/settings",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
