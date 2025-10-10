import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "context/AuthContext";

function ProtectedRoute({ children, requiredRole = null }) {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect while loading
    if (loading) return;

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      console.log("🚫 Access denied: Not authenticated");
      navigate("/authentication/sign-in", { replace: true });
      return;
    }

    // Check role-based access if required
    if (requiredRole && user.role !== requiredRole) {
      console.log(`🚫 Access denied: Required role ${requiredRole}, user has ${user.role}`);

      // Redirect based on user role
      if (user.role === "user") {
        navigate("/fdo-panel", { replace: true });
      } else if (user.role === "admin") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/authentication/sign-in", { replace: true });
      }
      return;
    }

    console.log(`✅ Access granted to ${location.pathname} for ${user.role}`);
  }, [isAuthenticated, user, loading, navigate, location.pathname, requiredRole]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        Loading...
      </div>
    );
  }

  // Don't render children if not authenticated or wrong role
  if (!isAuthenticated || !user) {
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string,
};

export default ProtectedRoute;
