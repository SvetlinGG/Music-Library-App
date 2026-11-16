import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";


export function PrivateRoute() {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  
  const [wasLoggedIn] = useState(isLoggedIn);

  if (!isLoggedIn) {
    
    if (wasLoggedIn) return <Navigate to="/" replace />;

    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, message: "Please log in to see this page." }}
      />
    );
  }
  return <Outlet />;
}


export function GuestRoute() {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (isLoggedIn) {
    return <Navigate to={location.state?.from ?? "/"} replace />;
  }
  return <Outlet />;
}