import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: string; // optional for role-based access
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  // === Mock authentication logic ===
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const userRole = localStorage.getItem("userRole") || "guest";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />; // Redirect if role mismatch
  }

  return <>{children}</>;
};

export default PrivateRoute;
