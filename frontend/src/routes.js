// Material Dashboard 2 React layouts
import FDOPanel from "layouts/fdo-panel";
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Revenue from "layouts/Revenue";
import RTL from "layouts/rtl";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import ForgotPassword from "layouts/forgot-password";
import AdminPanel from "layouts/admin-panel";

// @mui icons
import Icon from "@mui/material/Icon";

// Role-based route filtering
export const getRoleBasedRoutes = (userRole, isAuthenticated) => {
  // If not authenticated, only show sign-in and forgot password
  if (!isAuthenticated) {
    return routes.filter((route) => route.key === "sign-in" || route.key === "forgot-password");
  }

  // If user role, only show FDO Panel
  if (userRole === "user") {
    return routes.filter((route) => route.key === "fdo-panel");
  }

  // If admin role, show all routes except sign-in
  if (userRole === "admin") {
    return routes.filter((route) => route.key !== "sign-in");
  }

  // Default: only show sign-in
  return routes.filter((route) => route.key === "sign-in");
};

// All available routes
const routes = [
  {
    type: "collapse",
    name: "FDO Panel",
    key: "fdo-panel",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/fdo-panel",
    component: <FDOPanel />,
  },
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Tables",
    key: "tables",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/tables",
    component: <Tables />,
  },
  {
    type: "collapse",
    name: "Revenue",
    key: "revenue",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/revenue",
    component: <Revenue />,
  },
  {
    type: "collapse",
    name: "RTL",
    key: "rtl",
    icon: <Icon fontSize="small">format_textdirection_r_to_l</Icon>,
    route: "/rtl",
    component: <RTL />,
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  {
    type: "collapse",
    name: "Admin Panel",
    key: "admin-panel",
    icon: <Icon fontSize="small">admin_panel_settings</Icon>,
    route: "/admin-panel",
    component: <AdminPanel />,
  },
  {
    type: "collapse",
    name: "Reset Password",
    key: "forgot-password",
    icon: <Icon fontSize="small">lock_reset</Icon>,
    route: "/forgot-password",
    component: <ForgotPassword />,
  },
  {
    type: "divider",
    key: "divider-1",
  },
  {
    type: "collapse",
    name: "Logout",
    key: "logout",
    icon: <Icon fontSize="small">logout</Icon>,
    route: "/logout",
    component: null, // This will be handled by the sidebar component
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
];

// Export individual route components for direct access
export { FDOPanel, SignIn, ForgotPassword };

export default routes;
