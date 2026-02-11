import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type AppRole = "candidate" | "recruiter" | "admin";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: AppRole;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading, hasRole, approvalStatus } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    const loginPath = requiredRole === "admin" ? "/admin-login" : requiredRole === "recruiter" ? "/recruiter-login" : "/candidate-login";
    return <Navigate to={loginPath} replace />;
  }

  // Admins bypass approval check
  if (requiredRole !== "admin" && approvalStatus !== "approved") {
    const loginPath = requiredRole === "recruiter" ? "/recruiter-login" : "/candidate-login";
    return <Navigate to={loginPath} replace />;
  }

  if (!hasRole(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
