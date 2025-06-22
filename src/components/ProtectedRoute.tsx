import { useAuth } from "../contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVerification?: boolean;
}

const ProtectedRoute = ({
  children,
  requireVerification = true,
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Caricamento</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/Profile" state={{ from: location }} replace />;
  }

  if (requireVerification && !user.emailVerification) {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
