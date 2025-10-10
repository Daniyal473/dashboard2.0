import { useState, useEffect } from "react";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// API Configuration
import { API_ENDPOINTS } from "config/api";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function AdminPanel() {
  const [createUserForm, setCreateUserForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "user", // Default to user role
  });
  const [users, setUsers] = useState([]);
  const [passwordHistory, setPasswordHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("users"); // users, history
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState("");
  const [originalRole, setOriginalRole] = useState("");

  // Admin password dialog state
  const [adminDialog, setAdminDialog] = useState({
    open: false,
    password: "",
    action: null, // 'create', 'fetch', 'update', 'delete'
    actionData: null
  });

  // Handle form input changes
  const handleInputChange = (field) => (event) => {
    setCreateUserForm({
      ...createUserForm,
      [field]: event.target.value,
    });
  };

  // Create new user
  const handleCreateUser = async (event) => {
    event.preventDefault();

    if (createUserForm.password !== createUserForm.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match!" });
      return;
    }

    if (!createUserForm.username) {
      setMessage({ type: "error", text: "Username is required!" });
      return;
    }

    if (!createUserForm.password) {
      setMessage({ type: "error", text: "Password is required!" });
      return;
    }

    // Prompt for admin password
    setAdminDialog({
      open: true,
      password: "",
      action: 'create',
      actionData: { ...createUserForm }
    });
  };

  // Execute create user with admin password
  const executeCreateUser = async (adminPassword) => {
    setLoading(true);

    console.log("👤 Creating user:", adminDialog.actionData.username);

    try {
      const response = await fetch(API_ENDPOINTS.CREATE_USER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminPassword: adminPassword,
          username: adminDialog.actionData.username,
          password: adminDialog.actionData.password,
          role: adminDialog.actionData.role,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: "success",
          text: `User "${adminDialog.actionData.username}" created successfully!`,
        });
        setCreateUserForm({ username: "", password: "", confirmPassword: "", role: "user" });
        setAdminDialog({ open: false, password: "", action: null, actionData: null });
        fetchUsers(); // Refresh user list
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create user. Please try again." });
      console.error("Create user error:", error);
    }
    setLoading(false);
  };

  // Fetch all users - prompt for admin password
  const fetchUsers = () => {
    setAdminDialog({
      open: true,
      password: "",
      action: 'fetch',
      actionData: null
    });
  };

  // Execute fetch users with admin password
  const executeFetchUsers = async (adminPassword) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.USERS}?adminPassword=${encodeURIComponent(adminPassword)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setUsers(result.users);
        setAdminDialog({ open: false, password: "", action: null, actionData: null });
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to fetch users. Please try again." });
      console.error("Fetch users error:", error);
    }
  };

  // Update user role - prompt for admin password
  const handleUpdateUserRole = (username, newRole) => {
    setAdminDialog({
      open: true,
      password: "",
      action: 'update',
      actionData: { username, newRole }
    });
  };

  // Execute update user role with admin password
  const executeUpdateUserRole = async (adminPassword) => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.UPDATE_USER_ROLE, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminPassword: adminPassword,
          username: adminDialog.actionData.username,
          role: adminDialog.actionData.newRole,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: "success",
          text: `User "${adminDialog.actionData.username}" role updated to ${adminDialog.actionData.newRole} successfully!`,
        });
        setEditingUser(null);
        setEditRole("");
        setOriginalRole("");
        setAdminDialog({ open: false, password: "", action: null, actionData: null });
        fetchUsers(); // Refresh user list
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update user role. Please try again." });
      console.error("Update role error:", error);
    }
    setLoading(false);
  };

  // Delete user - prompt for admin password
  const handleDeleteUser = (username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    setAdminDialog({
      open: true,
      password: "",
      action: 'delete',
      actionData: { username }
    });
  };

  // Execute delete user with admin password
  const executeDeleteUser = async (adminPassword) => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.DELETE_USER, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminPassword: adminPassword,
          username: adminDialog.actionData.username,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: "success", text: `User "${adminDialog.actionData.username}" deleted successfully!` });
        setAdminDialog({ open: false, password: "", action: null, actionData: null });
        fetchUsers(); // Refresh user list
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete user. Please try again." });
      console.error("Delete user error:", error);
    }
    setLoading(false);
  };

  // Fetch password reset history - prompt for admin password
  const fetchPasswordHistory = () => {
    setAdminDialog({
      open: true,
      password: "",
      action: 'history',
      actionData: null
    });
  };

  // Execute fetch password history with admin password
  const executeFetchPasswordHistory = async (adminPassword) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.PASSWORD_HISTORY}?adminPassword=${encodeURIComponent(adminPassword)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(
            "Password history endpoint not available. This is normal if the backend route doesn't exist yet."
          );
          setPasswordHistory([]);
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log("📋 Password history received:", result.history);
        result.history?.forEach((record, index) => {
          console.log(`Frontend Record ${index}:`, {
            username: record.username,
            status: record.status,
            newPassword: record.newPassword,
            rawRecord: record,
          });
        });
        setPasswordHistory(result.history || []);
        setAdminDialog({ open: false, password: "", action: null, actionData: null });
      } else {
        console.error("Failed to fetch password history:", result.message);
        setPasswordHistory([]);
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      console.warn("Password history not available:", error.message);
      setPasswordHistory([]);
      setMessage({ type: "error", text: "Failed to fetch password history. Please try again." });
    }
  };

  // Handle admin password dialog submission
  const handleAdminSubmit = async () => {
    if (!adminDialog.password) {
      setMessage({ type: "error", text: "Admin password is required!" });
      return;
    }

    try {
      switch (adminDialog.action) {
        case 'create':
          await executeCreateUser(adminDialog.password);
          break;
        case 'fetch':
          await executeFetchUsers(adminDialog.password);
          break;
        case 'update':
          await executeUpdateUserRole(adminDialog.password);
          break;
        case 'delete':
          await executeDeleteUser(adminDialog.password);
          break;
        case 'history':
          await executeFetchPasswordHistory(adminDialog.password);
          break;
        default:
          console.error('Unknown admin action:', adminDialog.action);
      }
    } catch (error) {
      console.error('Admin action error:', error);
      setMessage({ type: "error", text: "Operation failed. Please try again." });
    }
  };

  // Load users on component mount, password history is optional
  useEffect(() => {
    fetchUsers();
    // Only fetch password history if needed (when user clicks on history tab)
    // fetchPasswordHistory();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={{ xs: 4, sm: 6 }} pb={3} px={{ xs: 2, sm: 3 }}>
        <Container maxWidth="xl">
          {/* Header - Mobile Responsive */}
          <MDBox textAlign="center" mb={4} px={{ xs: 2, sm: 0 }}>
            <MDTypography
              variant={{ xs: "h4", sm: "h3" }}
              fontWeight="bold"
              sx={{
                background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 2,
                fontSize: { xs: "1.75rem", sm: "2.5rem" },
              }}
            >
              Admin Panel
            </MDTypography>
            <MDTypography
              variant="body1"
              color="text"
              fontWeight="medium"
              sx={{
                fontSize: { xs: "0.875rem", sm: "1rem" },
                px: { xs: 1, sm: 0 },
              }}
            >
              Manage user accounts and view password history with new passwords
            </MDTypography>
          </MDBox>

          {/* Navigation Tabs - Mobile Responsive */}
          <MDBox display="flex" justifyContent="center" mb={4}>
            <MDBox
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                p: 1,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                width: { xs: "100%", sm: "auto" },
                maxWidth: { xs: "400px", sm: "none" },
              }}
            >
              <MDButton
                variant={activeTab === "users" ? "gradient" : "text"}
                color="info"
                onClick={() => setActiveTab("users")}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  mx: { xs: 0, sm: 1 },
                  my: { xs: 0.5, sm: 0 },
                  px: 3,
                  width: { xs: "100%", sm: "auto" },
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                User Management
              </MDButton>
              <MDButton
                variant={activeTab === "history" ? "gradient" : "text"}
                color="info"
                onClick={() => {
                  setActiveTab("history");
                  if (!passwordHistory || passwordHistory.length === 0) {
                    fetchPasswordHistory();
                  }
                }}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  mx: { xs: 0, sm: 1 },
                  my: { xs: 0.5, sm: 0 },
                  px: 3,
                  width: { xs: "100%", sm: "auto" },
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                Password History
              </MDButton>
            </MDBox>
          </MDBox>

          {message.text && (
            <MDBox mb={4}>
              <Alert severity={message.type}>{message.text}</Alert>
            </MDBox>
          )}

          {/* User Management Tab */}
          {activeTab === "users" && (
            <Grid container spacing={4}>
              {/* Create User Form */}
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    p: 4,
                    borderRadius: "20px",
                    boxShadow: "0 25px 50px -12px rgba(30, 58, 138, 0.25)",
                  }}
                >
                  <MDTypography variant="h5" fontWeight="bold" mb={3}>
                    Create New User
                  </MDTypography>

                  <MDBox component="form" onSubmit={handleCreateUser}>
                    <MDBox mb={3}>
                      <MDInput
                        type="text"
                        label="Username"
                        fullWidth
                        value={createUserForm.username}
                        onChange={handleInputChange("username")}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                          },
                        }}
                      />
                    </MDBox>

                    <MDBox mb={3}>
                      <MDInput
                        type="password"
                        label="Password"
                        fullWidth
                        value={createUserForm.password}
                        onChange={handleInputChange("password")}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                          },
                        }}
                      />
                    </MDBox>

                    <MDBox mb={3}>
                      <MDInput
                        type="password"
                        label="Confirm Password"
                        fullWidth
                        value={createUserForm.confirmPassword}
                        onChange={handleInputChange("confirmPassword")}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                          },
                        }}
                      />
                    </MDBox>

                    <MDBox mb={4}>
                      <MDTypography
                        variant="body2"
                        fontWeight="600"
                        sx={{
                          color: "#374151",
                          fontSize: "0.875rem",
                          mb: 1.5,
                        }}
                      >
                        Access Level
                      </MDTypography>
                      <FormControl fullWidth>
                        <Select
                          value={createUserForm.role}
                          onChange={handleInputChange("role")}
                          displayEmpty
                          sx={{
                            borderRadius: "12px",
                            backgroundColor: "#f8fafc",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#e2e8f0",
                              borderWidth: "2px",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#3b82f6",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#3b82f6",
                              borderWidth: "2px",
                            },
                            "& .MuiSelect-select": {
                              py: 1.5,
                            },
                          }}
                        >
                          <MenuItem value="user">
                            <MDBox display="flex" alignItems="center" gap={2} width="100%">
                              <MDBox
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "8px",
                                  backgroundColor: "#dcfce7",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <MDBox
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: "50%",
                                    backgroundColor: "#16a34a",
                                  }}
                                />
                              </MDBox>
                              <MDBox>
                                <MDTypography
                                  variant="body2"
                                  fontWeight="600"
                                  sx={{ color: "#1f2937", lineHeight: 1.2 }}
                                >
                                  Standard User
                                </MDTypography>
                                <MDTypography
                                  variant="caption"
                                  sx={{ color: "#6b7280", fontSize: "0.75rem" }}
                                >
                                  FDO Panel Access Only
                                </MDTypography>
                              </MDBox>
                            </MDBox>
                          </MenuItem>
                          <MenuItem value="admin">
                            <MDBox display="flex" alignItems="center" gap={2} width="100%">
                              <MDBox
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "8px",
                                  backgroundColor: "#fef3c7",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <MDBox
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: "50%",
                                    backgroundColor: "#f59e0b",
                                  }}
                                />
                              </MDBox>
                              <MDBox>
                                <MDTypography
                                  variant="body2"
                                  fontWeight="600"
                                  sx={{ color: "#1f2937", lineHeight: 1.2 }}
                                >
                                  Administrator
                                </MDTypography>
                                <MDTypography
                                  variant="caption"
                                  sx={{ color: "#6b7280", fontSize: "0.75rem" }}
                                >
                                  Full Dashboard Access
                                </MDTypography>
                              </MDBox>
                            </MDBox>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </MDBox>

                    <MDButton
                      type="submit"
                      variant="gradient"
                      color="success"
                      fullWidth
                      size="large"
                      disabled={loading}
                      sx={{
                        borderRadius: "12px",
                        textTransform: "none",
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        py: 1.5,
                      }}
                    >
                      {loading ? "Creating..." : "Create User"}
                    </MDButton>
                  </MDBox>
                </Card>
              </Grid>

              {/* User List */}
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    p: 4,
                    borderRadius: "20px",
                    boxShadow: "0 25px 50px -12px rgba(30, 58, 138, 0.25)",
                  }}
                >
                  <MDTypography variant="h5" fontWeight="bold" mb={3}>
                    Existing Users ({users?.length || 0})
                  </MDTypography>

                  {!users || users.length === 0 ? (
                    <MDTypography variant="body2" color="text" textAlign="center" py={4}>
                      No users found
                    </MDTypography>
                  ) : (
                    <MDBox>
                      {users?.map((user, index) => (
                        <MDBox
                          key={user.id}
                          display="flex"
                          flexDirection={{ xs: "column", sm: "row" }}
                          justifyContent="space-between"
                          alignItems={{ xs: "stretch", sm: "center" }}
                          p={2}
                          mb={2}
                          sx={{
                            backgroundColor: "#f8f9fa",
                            borderRadius: "12px",
                            border: "1px solid #e9ecef",
                          }}
                        >
                          <MDBox>
                            <MDBox display="flex" alignItems="center" gap={1} mb={0.5}>
                              <MDTypography variant="h6" fontWeight="medium">
                                {user.username}
                              </MDTypography>
                              <MDBox
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                  backgroundColor: user.role === "admin" ? "#fef3c7" : "#dcfce7",
                                  border: `1px solid ${
                                    user.role === "admin" ? "#fbbf24" : "#22c55e"
                                  }`,
                                }}
                              >
                                <MDBox
                                  sx={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: "50%",
                                    backgroundColor: user.role === "admin" ? "#f59e0b" : "#10b981",
                                  }}
                                />
                                <MDTypography
                                  variant="caption"
                                  sx={{
                                    color: user.role === "admin" ? "#92400e" : "#065f46",
                                    fontWeight: "600",
                                    fontSize: "0.7rem",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  {user.role || "user"}
                                </MDTypography>
                              </MDBox>
                            </MDBox>
                            <MDTypography variant="caption" color="text">
                              Created:{" "}
                              {user.createdDate
                                ? new Date(user.createdDate).toLocaleDateString()
                                : "Unknown"}
                            </MDTypography>
                          </MDBox>
                          <MDBox
                            display="flex"
                            gap={1}
                            mt={{ xs: 2, sm: 0 }}
                            justifyContent={{ xs: "stretch", sm: "flex-end" }}
                            flexDirection={{ xs: "column", sm: "row" }}
                          >
                            {editingUser === user.username ? (
                              <MDBox
                                display="flex"
                                alignItems="center"
                                gap={1}
                                flexDirection={{ xs: "column", sm: "row" }}
                                width={{ xs: "100%", sm: "auto" }}
                              >
                                <FormControl
                                  size="small"
                                  sx={{
                                    minWidth: { xs: "100%", sm: 140 },
                                    width: { xs: "100%", sm: "auto" },
                                  }}
                                >
                                  <Select
                                    value={editRole}
                                    onChange={(e) => setEditRole(e.target.value)}
                                    sx={{
                                      borderRadius: "8px",
                                      fontSize: "0.875rem",
                                      backgroundColor:
                                        editRole !== originalRole ? "#f0f9ff" : "#ffffff",
                                      border:
                                        editRole !== originalRole
                                          ? "2px solid #3b82f6"
                                          : "1px solid #e5e7eb",
                                      "& .MuiOutlinedInput-notchedOutline": {
                                        border: "none",
                                      },
                                    }}
                                  >
                                    <MenuItem value="user">
                                      <MDBox display="flex" alignItems="center" gap={1}>
                                        <MDBox
                                          sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: "50%",
                                            backgroundColor: "#10b981",
                                          }}
                                        />
                                        User
                                      </MDBox>
                                    </MenuItem>
                                    <MenuItem value="admin">
                                      <MDBox display="flex" alignItems="center" gap={1}>
                                        <MDBox
                                          sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: "50%",
                                            backgroundColor: "#f59e0b",
                                          }}
                                        />
                                        Admin
                                      </MDBox>
                                    </MenuItem>
                                  </Select>
                                </FormControl>
                                <MDButton
                                  variant="contained"
                                  color={editRole !== originalRole ? "success" : "secondary"}
                                  size="small"
                                  onClick={() => handleUpdateUserRole(user.username, editRole)}
                                  disabled={loading || !editRole || editRole === originalRole}
                                  sx={{
                                    borderRadius: "6px",
                                    textTransform: "none",
                                    minWidth: { xs: "100%", sm: "auto" },
                                    width: { xs: "100%", sm: "auto" },
                                    px: 1.5,
                                    opacity: editRole !== originalRole ? 1 : 0.5,
                                    boxShadow:
                                      editRole !== originalRole
                                        ? "0 2px 4px rgba(34, 197, 94, 0.2)"
                                        : "none",
                                    "&:hover": {
                                      boxShadow:
                                        editRole !== originalRole
                                          ? "0 4px 8px rgba(34, 197, 94, 0.3)"
                                          : "none",
                                    },
                                  }}
                                >
                                  {editRole !== originalRole ? "✓" : "—"}
                                </MDButton>
                                <MDButton
                                  variant="outlined"
                                  color="secondary"
                                  size="small"
                                  onClick={() => {
                                    setEditingUser(null);
                                    setEditRole("");
                                    setOriginalRole("");
                                  }}
                                  sx={{
                                    borderRadius: "6px",
                                    textTransform: "none",
                                    minWidth: { xs: "100%", sm: "auto" },
                                    width: { xs: "100%", sm: "auto" },
                                    px: 1.5,
                                  }}
                                >
                                  ✕
                                </MDButton>
                              </MDBox>
                            ) : (
                              <>
                                <MDButton
                                  variant="outlined"
                                  color="info"
                                  size="small"
                                  onClick={() => {
                                    setEditingUser(user.username);
                                    setEditRole(user.role || "user");
                                    setOriginalRole(user.role || "user");
                                  }}
                                  disabled={loading}
                                  sx={{
                                    borderRadius: "8px",
                                    textTransform: "none",
                                    fontSize: "0.75rem",
                                    width: { xs: "100%", sm: "auto" },
                                    mb: { xs: 1, sm: 0 },
                                  }}
                                >
                                  Edit Role
                                </MDButton>
                                <MDButton
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  onClick={() => handleDeleteUser(user.username)}
                                  disabled={loading}
                                  sx={{
                                    borderRadius: "8px",
                                    textTransform: "none",
                                    fontSize: "0.75rem",
                                    width: { xs: "100%", sm: "auto" },
                                  }}
                                >
                                  Delete
                                </MDButton>
                              </>
                            )}
                          </MDBox>
                        </MDBox>
                      ))}
                    </MDBox>
                  )}
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Password History Tab */}
          {activeTab === "history" && (
            <Grid container>
              <Grid item xs={12}>
                <Card
                  sx={{
                    p: 4,
                    borderRadius: "20px",
                    boxShadow: "0 25px 50px -12px rgba(30, 58, 138, 0.25)",
                  }}
                >
                  <MDBox
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    justifyContent="space-between"
                    mb={4}
                    gap={{ xs: 2, sm: 0 }}
                  >
                    <MDBox display="flex" alignItems="center" gap={2}>
                      <MDBox
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "12px",
                          backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "1.25rem",
                        }}
                      >
                        📊
                      </MDBox>
                      <MDBox>
                        <MDTypography
                          variant="h4"
                          fontWeight="700"
                          sx={{ color: "#1f2937", mb: 0.5 }}
                        >
                          Password History
                        </MDTypography>
                        <MDTypography variant="body2" sx={{ color: "#6b7280" }}>
                          {passwordHistory?.length || 0} password reset records
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                    <MDBox
                      sx={{
                        padding: "8px 16px",
                        borderRadius: "20px",
                        backgroundColor: "#f3f4f6",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <MDTypography variant="caption" sx={{ color: "#6b7280", fontWeight: "600" }}>
                        Total: {passwordHistory?.length || 0}
                      </MDTypography>
                    </MDBox>
                  </MDBox>

                  {!passwordHistory || passwordHistory.length === 0 ? (
                    <MDTypography variant="body2" color="text" textAlign="center" py={4}>
                      No password update history found
                    </MDTypography>
                  ) : (
                    <MDBox>
                      {passwordHistory.map((record, index) => (
                        <MDBox
                          key={record.id}
                          p={3}
                          mb={3}
                          sx={{
                            backgroundColor: "#ffffff",
                            borderRadius: "16px",
                            border: "1px solid #e5e7eb",
                            boxShadow:
                              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                            transition: "all 0.2s ease-in-out",
                            "&:hover": {
                              boxShadow:
                                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          <Grid container spacing={2} alignItems={{ xs: "stretch", sm: "center" }}>
                            <Grid item xs={12} sm={3}>
                              <MDBox display="flex" alignItems="center" gap={1}>
                                <MDBox
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    backgroundColor: "#3b82f6",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "white",
                                    fontWeight: "bold",
                                    fontSize: "0.875rem",
                                  }}
                                >
                                  {record.username?.charAt(0).toUpperCase() || "U"}
                                </MDBox>
                                <MDBox>
                                  <MDTypography
                                    variant="h6"
                                    fontWeight="600"
                                    sx={{ color: "#1f2937", fontSize: "1rem" }}
                                  >
                                    {record.username}
                                  </MDTypography>
                                </MDBox>
                              </MDBox>
                            </Grid>
                            <Grid item xs={12} sm={2}>
                              <MDBox mb={{ xs: 2, sm: 0 }}>
                                <MDBox
                                  sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    padding: "6px 12px",
                                    borderRadius: "20px",
                                    backgroundColor:
                                      record.status === "Success" ? "#dcfce7" : "#fee2e2",
                                    border: `1px solid ${
                                      record.status === "Success" ? "#bbf7d0" : "#fecaca"
                                    }`,
                                  }}
                                >
                                  <MDBox
                                    sx={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: "50%",
                                      backgroundColor:
                                        record.status === "Success" ? "#16a34a" : "#dc2626",
                                    }}
                                  />
                                  <MDTypography
                                    variant="caption"
                                    sx={{
                                      color: record.status === "Success" ? "#16a34a" : "#dc2626",
                                      fontWeight: "600",
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    {record.status}
                                  </MDTypography>
                                </MDBox>
                              </MDBox>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <MDBox
                                sx={{
                                  backgroundColor: "#f8fafc",
                                  border: "2px dashed #cbd5e1",
                                  borderRadius: "12px",
                                  padding: "12px 16px",
                                  position: "relative",
                                  "&:hover": {
                                    backgroundColor: "#f1f5f9",
                                    borderColor: "#94a3b8",
                                  },
                                }}
                              >
                                <MDBox display="flex" alignItems="center" gap={1}>
                                  <MDBox
                                    sx={{
                                      width: 16,
                                      height: 16,
                                      borderRadius: "4px",
                                      backgroundColor: "#3b82f6",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "white",
                                      fontSize: "0.625rem",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    🔑
                                  </MDBox>
                                  <MDTypography
                                    variant="body2"
                                    sx={{
                                      fontSize: "0.875rem",
                                      fontFamily:
                                        "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
                                      color: "#1e293b",
                                      fontWeight: "600",
                                      letterSpacing: "0.025em",
                                    }}
                                  >
                                    {record.newPassword &&
                                    record.newPassword !== "••••••••" &&
                                    record.newPassword !== "N/A"
                                      ? record.newPassword
                                      : "Password not available"}
                                  </MDTypography>
                                </MDBox>
                              </MDBox>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <MDBox display="flex" flexDirection="column" alignItems="flex-end">
                                <MDBox display="flex" alignItems="center" gap={0.5} mb={0.5}>
                                  <MDBox
                                    sx={{
                                      width: 12,
                                      height: 12,
                                      borderRadius: "50%",
                                      backgroundColor: "#6b7280",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "0.5rem",
                                    }}
                                  >
                                    🕐
                                  </MDBox>
                                  <MDTypography
                                    variant="caption"
                                    sx={{
                                      fontSize: "0.75rem",
                                      color: "#6b7280",
                                      fontWeight: "500",
                                    }}
                                  >
                                    {record.resetDateTime
                                      ? new Date(record.resetDateTime).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "2-digit",
                                          year: "numeric",
                                        })
                                      : "Unknown Date"}
                                  </MDTypography>
                                </MDBox>
                                <MDTypography
                                  variant="caption"
                                  sx={{
                                    fontSize: "0.7rem",
                                    color: "#9ca3af",
                                    fontWeight: "400",
                                  }}
                                >
                                  {record.resetDateTime
                                    ? new Date(record.resetDateTime).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                      })
                                    : "Unknown Time"}
                                </MDTypography>
                              </MDBox>
                            </Grid>
                          </Grid>
                        </MDBox>
                      ))}
                    </MDBox>
                  )}
                </Card>
              </Grid>
            </Grid>
          )}
        </Container>
      </MDBox>
      <Footer />

      {/* Admin Password Dialog */}
      <Dialog 
        open={adminDialog.open} 
        onClose={() => setAdminDialog({ open: false, password: "", action: null, actionData: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <MDTypography variant="h4" fontWeight="medium">
            Admin Authentication Required
          </MDTypography>
        </DialogTitle>
        <DialogContent>
          <MDBox pt={2}>
            <MDTypography variant="body2" color="text" mb={2}>
              Please enter the admin password to continue with this action.
            </MDTypography>
            <MDInput
              type="password"
              label="Admin Password"
              fullWidth
              value={adminDialog.password}
              onChange={(e) => setAdminDialog({ ...adminDialog, password: e.target.value })}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAdminSubmit();
                }
              }}
            />
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton 
            variant="text" 
            color="secondary"
            onClick={() => setAdminDialog({ open: false, password: "", action: null, actionData: null })}
          >
            Cancel
          </MDButton>
          <MDButton 
            variant="gradient" 
            color="info"
            onClick={handleAdminSubmit}
            disabled={!adminDialog.password}
          >
            Confirm
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default AdminPanel;
