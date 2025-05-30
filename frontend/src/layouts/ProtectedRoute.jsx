import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import sidebarItems from "../constants/constantscomponents/sidebarItems";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const user = useSelector((state) => state.auth.user);
  const userPermissions = user?.permissions || [];
  const location = useLocation();
  const currentPath = location.pathname;

  const authorizedSidebarItems = sidebarItems.filter(item =>
    userPermissions.includes(item.title)
  );

  const authorizedRoutes = authorizedSidebarItems.some(item => {
    // Check top-level route
    if (currentPath.startsWith(item.route)) return true;

    // Check subTabs, if any
    if (item.subTabs) {
      return item.subTabs.some(sub => currentPath.startsWith(sub.route));
    }

    return false;
  });


  if (!user || !authorizedRoutes) {
    return <Navigate to="*" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;