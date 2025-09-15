import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import sidebarItems from "../constants/constantscomponents/sidebarItems";
import { useSelector } from "react-redux";
import { isTokenExpired } from "../utils/isTokenExpired";

const ProtectedRoute = () => {
  const user = useSelector((state) => state.auth.user);
  const userPermissions = user?.permissions || [];
  const location = useLocation();
  const currentPath = location.pathname;
  
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (!token || isTokenExpired(token)) {
      localStorage.clear();
      window.location.replace("/login");
    }
  }, [currentPath]);
  const authorizedSidebarItems = sidebarItems.filter((item) =>
    userPermissions.includes(item.title)
  );

  const authorizedRoutes = authorizedSidebarItems.some((item) => {
    if (currentPath.startsWith(item.route)) return true;
    
    if (item.subTabs) {
      return item.subTabs.some((sub) => currentPath.startsWith(sub.route));
    }
  
    return false;
  });

  if (!user || !authorizedRoutes) {
    return <Navigate to="*" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
