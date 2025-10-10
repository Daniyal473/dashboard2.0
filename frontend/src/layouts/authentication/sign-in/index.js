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

        console.log("✅ Admin access granted:", adminUser);

        handleAdminDialogClose();
        navigate("/admin-panel");
      } else {
        setAdminDialog({ ...adminDialog, loading: false, error: "Invalid admin password!" });
      }
    } catch (error) {
      console.error("Admin verification error:", error);
      setAdminDialog({ ...adminDialog, loading: false, error: "Admin verification failed!" });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Form submitted:", formData);

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

        console.log("✅ Login successful:", result.message);
        console.log("👤 User role:", result.user.role);

        // Navigate based on user role
        if (result.user.role === "user") {
          navigate("/fdo-panel");
        } else if (result.user.role === "admin") {
          navigate("/dashboard");
        } else {
          // Default fallback
          navigate("/fdo-panel");
        }
      } else {
        console.error("❌ Login failed:", result.message);
        alert(result.message);
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      alert("Login failed. Please check your connection and try again.");
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
            {/* Chatwoot Logo and Header */}
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
                <MDBox
                  component="img"
                  src={require("../../../assets/images/custom-logo.png")}
                  alt="Custom Logo"
                  sx={{
                    height: "150px", // Much larger logo
                    width: "auto",
                    maxWidth: "350px", // Increased max width for larger logos
                  }}
                />
              </MDBox>

              {/* Greeting */}
              <MDTypography
                variant="h4"
                sx={{
                  color: "#1f2937",
                  fontWeight: "600",
                  fontSize: "1.875rem",
                  mb: 1,
                }}
              >
                Howdy, admin 👋
              </MDTypography>
            </MDBox>

            {/* Form */}
            <MDBox component="form" onSubmit={handleSubmit}>
              {/* Email Address Field */}
              <MDBox mb={3}>
                <MDTypography
                  variant="body2"
                  sx={{
                    color: "#374151",
                    fontWeight: "500",
                    mb: 1,
                    fontSize: "0.875rem",
                  }}
                >
                  Email Address
                </MDTypography>
                <MDInput
                  type="text"
                  placeholder="Email eg: someone@example.com"
                  fullWidth
                  value={formData.username}
                  onChange={handleInputChange("username")}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "6px",
                      border: "2px solid #958e09", // Exact color specified by user
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
                    color: "#374151",
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
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 1,
                    color: "#6b7280",
                  }}
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </MDBox>

              {/* Login Button */}
              <MDBox mb={4}>
                <MDButton
                  type="submit"
                  fullWidth
                  size="large"
                  sx={{
                    background: "#8a8a8a !important", // Lighter gray to match logo
                    borderRadius: "6px",
                    textTransform: "none",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    py: 1.5,
                    color: "#ffffff !important",
                    boxShadow: "none !important",
                    transition: "none !important", // Disable all transitions
                    "&:hover": {
                      background: "#8a8a8a !important", // Force same color on hover
                      backgroundColor: "#8a8a8a !important",
                      boxShadow: "none !important",
                      transform: "none !important",
                      filter: "none !important",
                    },
                    "&:active": {
                      background: "#8a8a8a !important",
                      backgroundColor: "#8a8a8a !important",
                    },
                    "&:focus": {
                      background: "#8a8a8a !important",
                      backgroundColor: "#8a8a8a !important",
                    },
                  }}
                >
                  Login
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
              }}
            >
              {adminDialog.showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
