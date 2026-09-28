import { Navigate } from "react-router";

export default function ProtectRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = localStorage.getItem("adminToken");
  return token ? <>{children}</> : <Navigate to="/login" />;
}
