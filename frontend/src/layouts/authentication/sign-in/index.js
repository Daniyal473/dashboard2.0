/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState } from "react";

// react-router-dom components
import { Link, useNavigate } from "react-router-dom";

// Authentication context
import { useAuth } from "context/AuthContext";
import { API_ENDPOINTS } from "config/api";

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import TwitterIcon from "@mui/icons-material/Twitter";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import Logo from "components/Logo";

function Basic() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [adminDialog, setAdminDialog] = useState({
    open: false,
    password: "",
    showPassword: false,
    loading: false,
    error: "",
  });
  const [loginState, setLoginState] = useState({
    loading: false,
    error: "",
    success: false,
  });

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleCheckboxChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.checked,
    });
  };

  // Admin dialog handlers
  const handleAdminDialogOpen = () => {
    setAdminDialog({
      open: true,
      password: "",
      showPassword: false,
      loading: false,
      error: "",
    });
  };

  const handleAdminDialogClose = () => {
    setAdminDialog({
      open: false,
      password: "",
      showPassword: false,
      loading: false,
      error: "",
    });
  };

  const handleAdminPasswordChange = (event) => {
    setAdminDialog({
      ...adminDialog,
      password: event.target.value,
      error: "",
    });
  };

  const handleAdminSubmit = async () => {
    if (!adminDialog.password) {
      setAdminDialog({ ...adminDialog, error: "Admin password is required!" });
      return;
    }

    setAdminDialog({ ...adminDialog, loading: true, error: "" });

    try {
      const response = await fetch(API_ENDPOINTS.VERIFY_ADMIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminPassword: adminDialog.password }),
      });

      const result = await response.json();

      if (result.success) {
        // Create admin user session
        const adminUser = {
          username: "admin",
          role: "admin",
          id: "admin-user",
        };

        // Generate a temporary admin token
        const adminToken = "admin-session-" + Date.now();

        // Use auth context to log in as admin
        login(adminToken, adminUser);

        // Admin access granted - logging removed for silent mode

        handleAdminDialogClose();
        navigate("/admin-panel");
      } else {
        setAdminDialog({ ...adminDialog, loading: false, error: "Invalid admin password!" });
      }
    } catch (error) {
      // Admin verification error - logging removed for silent mode
      setAdminDialog({ ...adminDialog, loading: false, error: "Admin verification failed!" });
    }
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    // Form submitted - logging removed for silent mode

    // Validation
    if (!formData.username.trim()) {
      setLoginState({ ...loginState, error: "Username is required" });
      return;
    }
    if (!formData.password.trim()) {
      setLoginState({ ...loginState, error: "Password is required" });
      return;
    }

    setLoginState({ loading: true, error: "", success: false });

    try {
      // Call authentication API
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Use auth context to store login data
        login(result.token, result.user);

        // Login successful - logging removed for silent mode

        setLoginState({ loading: false, error: "", success: true });

        // Small delay to show success message
        setTimeout(() => {
          // Always navigate to FDO panel regardless of role
          navigate("/fdo-panel");
        }, 1000);
      } else {
        // Login failed - logging removed for silent mode
        setLoginState({ loading: false, error: result.message, success: false });
      }
    } catch (error) {
      // Login error - logging removed for silent mode
      const errorMessage = "Login failed. Please check your connection and try again.";
      setLoginState({ loading: false, error: errorMessage, success: false });
    }
  };

  return (
    <MDBox
      sx={{
        minHeight: "100vh",
        width: "100vw",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
      }}
    >
      <Container maxWidth="sm">
        {/* Main Card */}
        <Card
          sx={{
            background: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "1px solid #e2e8f0",
            maxWidth: "400px",
            margin: "0 auto",
          }}
        >
          <MDBox p={4}>
            {/* Dashboard Logo and Header */}
            <MDBox textAlign="center" mb={4}>
              {/* Custom Logo */}
              <MDBox
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 3,
                }}
              >
                {/* Custom Logo */}
                <Logo
                  height="150px"
                  maxWidth="350px"
                />
              </MDBox>

              {/* Greeting */}
              <MDTypography
                variant="h4"
                sx={{
                  color: "#000000",
                  fontWeight: "400",
                  fontSize: "1.875rem",
                  mb: 1,
                }}
              >
                Sign into your account
              </MDTypography>
            </MDBox>



            {/* Error Alert */}
            {loginState.error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: "8px",
                  "& .MuiAlert-message": {
                    fontSize: "0.875rem",
                    fontWeight: "500",
                  },
                }}
                onClose={() => setLoginState({ ...loginState, error: "" })}
              >
                {loginState.error}
              </Alert>
            )}

            {/* Success Alert */}
            {loginState.success && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3,
                  borderRadius: "8px",
                  "& .MuiAlert-message": {
                    fontSize: "0.875rem",
                    fontWeight: "500",
                  },
                }}
              >
                Login successful! Redirecting...
              </Alert>
            )}

            {/* Form */}
            <MDBox component="form" onSubmit={handleSubmit}>
              {/* Username Field */}
              <MDBox mb={3}>
                <MDTypography
                  variant="body2"
                  sx={{
                    color: "#000000",
                    fontWeight: "500",
                    mb: 1,
                    fontSize: "0.875rem",
                  }}
                >
                  Username
                </MDTypography>
                <MDInput
                  type="text"
                  placeholder="Username"
                  fullWidth
                  value={formData.username}
                  onChange={handleInputChange("username")}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      backgroundColor: "#ffffff",
                      fontSize: "0.875rem",
                      "& fieldset": {
                        border: "none",
                      },
                      "&:hover fieldset": {
                        border: "none",
                      },
                      "&.Mui-focused fieldset": {
                        border: "none",
                      },
                    },
                    "& .MuiInputBase-input": {
                      padding: "12px 16px",
                      fontSize: "0.875rem",
                      color: "#374151",
                      "&::placeholder": {
                        color: "#9ca3af",
                        opacity: 1,
                      },
                    },
                  }}
                />
              </MDBox>

              {/* Password Field */}
              <MDBox mb={4} position="relative">
                <MDTypography
                  variant="body2"
                  sx={{
                    color: "#000000",
                    fontWeight: "500",
                    mb: 1,
                    fontSize: "0.875rem",
                  }}
                >
                  Password
                </MDTypography>
                <MDInput
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  fullWidth
                  value={formData.password}
                  onChange={handleInputChange("password")}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      backgroundColor: "#ffffff",
                      fontSize: "0.875rem",
                      "& fieldset": {
                        border: "none",
                      },
                      "&:hover": {
                        borderColor: "#9ca3af",
                      },
                      "&:hover fieldset": {
                        border: "none",
                      },
                      "&.Mui-focused": {
                        borderColor: "#476746", // Exact color specified by user
                      },
                      "&.Mui-focused fieldset": {
                        border: "none",
                      },
                    },
                    "& .MuiInputBase-input": {
                      padding: "12px 16px",
                      fontSize: "0.875rem",
                      color: "#374151",
                      "&::placeholder": {
                        color: "#9ca3af",
                        opacity: 1,
                      },
                    },
                  }}
                />
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: "calc(50% + 12px)", // Adjusted to account for label
                    transform: "translateY(-50%)",
                    zIndex: 1,
                    color: "#6b7280",
                    padding: "8px",
                    "&:hover": {
                      backgroundColor: "rgba(107, 114, 128, 0.1)",
                      color: "#374151",
                    },
                  }}
                >
                  {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </MDBox>

              {/* Login Button */}
              <MDBox mb={4}>
                <MDButton
                  type="submit"
                  fullWidth
                  size="large"
                  disabled={loginState.loading}
                  sx={{
                    background: loginState.loading ? "#d1d5db !important" : "#8a8a8a !important",
                    borderRadius: "6px",
                    textTransform: "none",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    py: 1.5,
                    color: "#ffffff !important",
                    boxShadow: "none !important",
                    transition: "none !important",
                    position: "relative",
                    "&:hover": {
                      background: loginState.loading ? "#d1d5db !important" : "#8a8a8a !important",
                      backgroundColor: loginState.loading ? "#d1d5db !important" : "#8a8a8a !important",
                      boxShadow: "none !important",
                      transform: "none !important",
                      filter: "none !important",
                    },
                    "&:active": {
                      background: loginState.loading ? "#d1d5db !important" : "#8a8a8a !important",
                      backgroundColor: loginState.loading ? "#d1d5db !important" : "#8a8a8a !important",
                    },
                    "&:focus": {
                      background: loginState.loading ? "#d1d5db !important" : "#8a8a8a !important",
                      backgroundColor: loginState.loading ? "#d1d5db !important" : "#8a8a8a !important",
                    },
                    "&.Mui-disabled": {
                      color: "#ffffff !important",
                    },
                  }}
                >
                  {loginState.loading ? (
                    <MDBox display="flex" alignItems="center" gap={1}>
                      <CircularProgress 
                        size={16} 
                        sx={{ color: "#ffffff" }} 
                      />
                      Signing in...
                    </MDBox>
                  ) : (
                    "Login"
                  )}
                </MDButton>
              </MDBox>

              {/* Forgot Password Link */}
              <MDBox mt={2} textAlign="center">
                <MDButton
                  component={Link}
                  to="/forgot-password"
                  variant="text"
                  size="small"
                  sx={{
                    textTransform: "none",
                    fontSize: "0.875rem",
                    fontWeight: "400",
                    color: "#1f93ff",
                    cursor: "pointer",
                    transition: "none !important",
                    "&:hover": {
                      backgroundColor: "transparent !important",
                      textDecoration: "none !important",
                      boxShadow: "none !important",
                      transform: "none !important",
                      filter: "none !important",
                      opacity: "1 !important",
                      color: "#1f93ff !important",
                    },
                    "&:focus": {
                      backgroundColor: "transparent !important",
                      boxShadow: "none !important",
                      color: "#1f93ff !important",
                    },
                    "&:active": {
                      backgroundColor: "transparent !important",
                      boxShadow: "none !important",
                      color: "#1f93ff !important",
                    },
                    "& .MuiTouchRipple-root": {
                      display: "none !important",
                    },
                  }}
                >
                  Forgot your password?
                </MDButton>
              </MDBox>

              {/* Admin Access Button - Keep for functionality */}
              <MDBox mt={1} textAlign="center">
                <MDButton
                  variant="text"
                  size="small"
                  onClick={handleAdminDialogOpen}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.75rem",
                    fontWeight: "400",
                    color: "#6b7280",
                    cursor: "pointer",
                    transition: "none !important",
                    "&:hover": {
                      backgroundColor: "transparent !important",
                      textDecoration: "none !important",
                      boxShadow: "none !important",
                      transform: "none !important",
                      filter: "none !important",
                      opacity: "1 !important",
                      color: "#6b7280 !important",
                    },
                    "&:focus": {
                      backgroundColor: "transparent !important",
                      boxShadow: "none !important",
                      color: "#6b7280 !important",
                    },
                    "&:active": {
                      backgroundColor: "transparent !important",
                      boxShadow: "none !important",
                      color: "#6b7280 !important",
                    },
                    "& .MuiTouchRipple-root": {
                      display: "none !important",
                    },
                  }}
                >
                  Admin Access
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>
        </Card>
      </Container>

      {/* Admin Password Dialog */}
      <Dialog
        open={adminDialog.open}
        onClose={handleAdminDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            pb: 2,
            color: "#1f2937",
            fontSize: "1.25rem",
            fontWeight: "600",
          }}
        >
          Admin Access
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <MDTypography variant="body2" color="text" mb={3} textAlign="center">
            Enter admin password to access the admin panel
          </MDTypography>

          {adminDialog.error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {adminDialog.error}
            </Alert>
          )}

          <MDBox position="relative">
            <MDInput
              type={adminDialog.showPassword ? "text" : "password"}
              label="Admin Password"
              fullWidth
              value={adminDialog.password}
              onChange={handleAdminPasswordChange}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAdminSubmit();
                }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  "& fieldset": {
                    border: "none",
                  },
                  "&:hover fieldset": {
                    border: "none",
                  },
                  "&.Mui-focused fieldset": {
                    border: "none",
                  },
                },
              }}
            />
            <IconButton
              onClick={() =>
                setAdminDialog({
                  ...adminDialog,
                  showPassword: !adminDialog.showPassword,
                })
              }
              sx={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 1,
                color: "#6b7280",
                padding: "8px",
                "&:hover": {
                  backgroundColor: "rgba(107, 114, 128, 0.1)",
                  color: "#374151",
                },
              }}
            >
              {adminDialog.showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
            </IconButton>
          </MDBox>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <MDButton
            variant="text"
            color="secondary"
            onClick={handleAdminDialogClose}
            disabled={adminDialog.loading}
            sx={{
              textTransform: "none",
              fontSize: "0.9rem",
            }}
          >
            Cancel
          </MDButton>
          <MDButton
            onClick={handleAdminSubmit}
            disabled={adminDialog.loading}
            sx={{
              background: "#1f93ff",
              borderRadius: "6px",
              textTransform: "none",
              fontSize: "0.875rem",
              fontWeight: "500",
              px: 3,
              color: "#ffffff",
              "&:hover": {
                background: "#1e40af",
              },
            }}
          >
            {adminDialog.loading ? "Verifying..." : "Access Admin Panel"}
          </MDButton>
        </DialogActions>
      </Dialog>

    </MDBox>
  );
}

export default Basic;
