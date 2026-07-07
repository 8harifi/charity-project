/** Dashboard paths keyed by backend JWT role claim. */
export const DASHBOARD_ROUTES = {
  doctor: "/doctor/dashboard",
  patient: "/patient/dashboard",
  benefactor: "/charitable/dashboard",
  health_assistant: "/salamatyar/dashboard",
  service_center: "/healthcenter/dashboard",
  charity_center: "/charitycenter/dashboard",
  social_work_unit: "/loginpage",
  admin: "/admin/dashboard",
};

export function getDashboardRoute(role) {
  return DASHBOARD_ROUTES[role] || "/";
}
