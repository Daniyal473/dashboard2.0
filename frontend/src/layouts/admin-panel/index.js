import { useState, useEffect } from "react";

// Authentication context
import { useAuth } from "context/AuthContext";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import CircularProgress from "@mui/material/CircularProgress";

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
  const { user, isAuthenticated, loading: authLoading, isAdmin } = useAuth();
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
  const [activeTab, setActiveTab] = useState("users"); // users, history, monthly-target
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState("");
  const [originalRole, setOriginalRole] = useState("");
  
  // Monthly Target state
  const [monthlyTarget, setMonthlyTarget] = useState({
    amount: "",
    days: ""
  });
  const [calculatedTargets, setCalculatedTargets] = useState({
    dailyTarget: 0,
    quarterlyTarget: 0
  });


  // Handle form input changes
  const handleInputChange = (field) => (event) => {
    setCreateUserForm({
      ...createUserForm,
      [field]: event.target.value,
    });
  };

  // Handle Monthly Target input changes
  const handleMonthlyTargetChange = (field) => (event) => {
    const value = event.target.value;
    const updatedTarget = {
      ...monthlyTarget,
      [field]: value,
    };
    setMonthlyTarget(updatedTarget);
    
    // Calculate targets when both amount and days are provided
    if (updatedTarget.amount && updatedTarget.days) {
      const amount = parseFloat(updatedTarget.amount.replace(/,/g, ''));
      const days = parseInt(updatedTarget.days);
      
      if (!isNaN(amount) && !isNaN(days) && days > 0) {
        const dailyTarget = amount / days;
        const quarterlyTarget = amount * 3;
        
        setCalculatedTargets({
          dailyTarget: dailyTarget,
          quarterlyTarget: quarterlyTarget
        });
      } else {
        setCalculatedTargets({
          dailyTarget: 0,
          quarterlyTarget: 0
        });
      }
    } else {
      setCalculatedTargets({
        dailyTarget: 0,
        quarterlyTarget: 0
      });
    }
  };

  // Format number with commas
  const formatNumber = (num) => {
    if (num === 0) return '0';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  // Handle Monthly Target form submission
  const handleMonthlyTargetSubmit = (event) => {
    event.preventDefault();
    
    if (!monthlyTarget.amount || !monthlyTarget.days) {
      setMessage({ type: "error", text: "Please enter both amount and days!" });
      return;
    }
    
    const amount = parseFloat(monthlyTarget.amount.replace(/,/g, ''));
    const days = parseInt(monthlyTarget.days);
    
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: "error", text: "Please enter a valid amount!" });
      return;
    }
    
    if (isNaN(days) || days <= 0 || days > 31) {
      setMessage({ type: "error", text: "Please enter valid days (1-31)!" });
      return;
    }
    
    // Store in localStorage for now (frontend only implementation)
    const targetData = {
      amount: amount,
      days: days,
      dailyTarget: calculatedTargets.dailyTarget,
      quarterlyTarget: calculatedTargets.quarterlyTarget,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('monthlyTargetData', JSON.stringify(targetData));
    
    setMessage({ 
      type: "success", 
      text: `Monthly Target set successfully! Daily: ${formatNumber(calculatedTargets.dailyTarget)}, Quarterly: ${formatNumber(calculatedTargets.quarterlyTarget)}` 
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

    // Execute create user directly
    await executeCreateUser();
  };

  // Execute create user
  const executeCreateUser = async () => {
    setLoading(true);

    console.log("👤 Creating user:", createUserForm.username);

    try {
      const response = await fetch(API_ENDPOINTS.CREATE_USER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: createUserForm.username,
          password: createUserForm.password,
          role: createUserForm.role,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: "success",
          text: `User "${createUserForm.username}" created successfully!`,
        });
        setCreateUserForm({ username: "", password: "", confirmPassword: "", role: "user" });
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

  // Fetch all users
  const fetchUsers = async () => {
    await executeFetchUsers();
  };

  // Execute fetch users
  const executeFetchUsers = async () => {
    try {
      const response = await fetch(
        API_ENDPOINTS.USERS,
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
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to fetch users. Please try again." });
      console.error("Fetch users error:", error);
    }
  };

  // Update user role
  const handleUpdateUserRole = async (username, newRole) => {
    await executeUpdateUserRole(username, newRole);
  };

  // Execute update user role
  const executeUpdateUserRole = async (username, newRole) => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.UPDATE_USER_ROLE, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          role: newRole,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: "success",
          text: `User "${username}" role updated to ${newRole} successfully!`,
        });
        setEditingUser(null);
        setEditRole("");
        setOriginalRole("");
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

  // Delete user
  const handleDeleteUser = async (username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    await executeDeleteUser(username);
  };

  // Execute delete user
  const executeDeleteUser = async (username) => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.DELETE_USER, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: "success", text: `User "${username}" deleted successfully!` });
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

  // Fetch password reset history
  const fetchPasswordHistory = async () => {
    await executeFetchPasswordHistory();
  };

  // Execute fetch password history
  const executeFetchPasswordHistory = async () => {
    try {
      const response = await fetch(
        API_ENDPOINTS.PASSWORD_HISTORY,
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


  // Load users on component mount, password history is optional
  useEffect(() => {
    fetchUsers();
    // Load existing monthly target data from localStorage
    const savedTargetData = localStorage.getItem('monthlyTargetData');
    if (savedTargetData) {
      try {
        const targetData = JSON.parse(savedTargetData);
        setMonthlyTarget({
          amount: targetData.amount.toString(),
          days: targetData.days.toString()
        });
        setCalculatedTargets({
          dailyTarget: targetData.dailyTarget,
          quarterlyTarget: targetData.quarterlyTarget
        });
      } catch (error) {
        console.error('Error loading monthly target data:', error);
      }
    }
    // Only fetch password history if needed (when user clicks on history tab)
    // fetchPasswordHistory();
  }, []);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
          <MDTypography variant="h6" ml={2}>
            Loading...
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isAuthenticated || !user) {
    window.location.href = "/authentication/sign-in";
    return null;
  }

  // Redirect non-admin users
  if (!isAdmin()) {
    window.location.href = "/fdo-panel";
    return null;
  }

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
              <MDButton
                variant={activeTab === "monthly-target" ? "gradient" : "text"}
                color="info"
                onClick={() => setActiveTab("monthly-target")}
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
                Monthly Target
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

          {/* Monthly Target Tab */}
          {activeTab === "monthly-target" && (
            <Grid container spacing={4}>
              {/* Monthly Target Form */}
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
                    alignItems="center"
                    gap={2}
                    mb={4}
                  >
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
                      🎯
                    </MDBox>
                    <MDBox>
                      <MDTypography variant="h4" fontWeight="bold" mb={1}>
                        Monthly Target Setup
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        Set monthly target amount and days to calculate daily and quarterly targets
                      </MDTypography>
                    </MDBox>
                  </MDBox>

                  <MDBox component="form" onSubmit={handleMonthlyTargetSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <MDBox mb={3}>
                          <MDTypography
                            variant="body2"
                            fontWeight="600"
                            sx={{
                              color: "#374151",
                              fontSize: "0.875rem",
                              mb: 1.5,
                            }}
                          >
                            Monthly Target Amount
                          </MDTypography>
                          <MDInput
                            type="text"
                            label=""
                            fullWidth
                            value={monthlyTarget.amount}
                            onChange={handleMonthlyTargetChange("amount")}
                            placeholder=""
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "12px",
                                backgroundColor: "#f8fafc",
                              },
                            }}
                          />
                        </MDBox>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <MDBox mb={3}>
                          <MDTypography
                            variant="body2"
                            fontWeight="600"
                            sx={{
                              color: "#374151",
                              fontSize: "0.875rem",
                              mb: 1.5,
                            }}
                          >
                            Days in Month
                          </MDTypography>
                          <MDInput
                            type="number"
                            label=""
                            fullWidth
                            value={monthlyTarget.days}
                            onChange={handleMonthlyTargetChange("days")}
                            placeholder=""
                            inputProps={{ min: 1, max: 31 }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "12px",
                                backgroundColor: "#f8fafc",
                              },
                            }}
                          />
                        </MDBox>
                      </Grid>
                    </Grid>

                    <MDButton
                      type="submit"
                      variant="gradient"
                      color="success"
                      fullWidth
                      size="large"
                      disabled={loading || !monthlyTarget.amount || !monthlyTarget.days}
                      sx={{
                        borderRadius: "12px",
                        textTransform: "none",
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        py: 1.5,
                        mt: 2,
                      }}
                    >
                      Set Monthly Target
                    </MDButton>
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          )}
        </Container>
      </MDBox>
      <Footer />


    </DashboardLayout>
  );
}

export default AdminPanel;
