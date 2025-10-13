import { useAuth } from "context/AuthContext";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// @mui material components
import { AppBar, Toolbar, Typography, Box, Avatar, Chip } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";
import NotificationsIcon from "@mui/icons-material/Notifications";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";

function UserLayout({ children }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // Use replace to prevent back button issues
    navigate("/authentication/sign-in", { replace: true });
  };

  return (
    <MDBox
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
      }}
    >
      {/* Modern Top Navigation Bar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "#ffffff",
          color: "#1f2937",
          borderBottom: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", px: 4, py: 1 }}>
          {/* Left Side - Logo and Title */}
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              <NotificationsIcon fontSize="medium" />
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "700",
                  color: "#1f2937",
                  fontSize: "1.5rem",
                  lineHeight: 1,
                }}
              >
                FDO Panel
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#6b7280",
                  fontSize: "0.75rem",
                  fontWeight: "500",
                }}
              >
                Guest Management System
              </Typography>
            </Box>
          </Box>

          {/* Right Side - User Info and Logout */}
          <Box display="flex" alignItems="center" gap={2}>
            {user && (
              <Box display="flex" alignItems="center" gap={2}>

                {/* User Avatar and Info */}
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      backgroundColor: "#f3f4f6",
                      color: "#374151",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                    }}
                  >
                    {user.username?.charAt(0)?.toUpperCase() || "U"}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#1f2937",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        lineHeight: 1,
                      }}
                    >
                      {user.username}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Logout Button */}
            <MDButton
              variant="outlined"
              size="medium"
              onClick={handleLogout}
              sx={{
                textTransform: "none",
                fontSize: "0.875rem",
                fontWeight: "600",
                borderRadius: "10px",
                px: 3,
                py: 1,
                borderColor: "#ef4444",
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                gap: 1,
                transition: "none !important",
                "&:hover": {
                  backgroundColor: "transparent !important",
                  color: "#ef4444 !important",
                  borderColor: "#ef4444 !important",
                  transform: "none !important",
                  boxShadow: "none !important",
                },
                "&:focus": {
                  backgroundColor: "transparent !important",
                  color: "#ef4444 !important",
                  borderColor: "#ef4444 !important",
                  boxShadow: "none !important",
                },
                "&:active": {
                  backgroundColor: "transparent !important",
                  color: "#ef4444 !important",
                  borderColor: "#ef4444 !important",
                  boxShadow: "none !important",
                },
                "& .MuiTouchRipple-root": {
                  display: "none !important",
                },
              }}
            >
              <LogoutIcon fontSize="small" />
              Logout
            </MDButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <MDBox sx={{ p: 3 }}>{children}</MDBox>
    </MDBox>
  );
}

UserLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserLayout;
