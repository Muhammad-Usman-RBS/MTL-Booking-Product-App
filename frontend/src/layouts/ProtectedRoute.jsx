// import React, { useEffect, useState } from "react";
// import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
// import sidebarItems from "../constants/constantscomponents/sidebarItems";
// import { useSelector } from "react-redux";
// import { isTokenExpired } from "../utils/isTokenExpired";

// const ProtectedRoute = () => {
//   const user = useSelector((state) => state.auth.user);
//   const userPermissions = user?.permissions || [];
//   const location = useLocation();
//   const currentPath = location.pathname;

//   const token = localStorage.getItem("token");
//   useEffect(() => {
//     if (!token || isTokenExpired(token)) {
//       localStorage.clear();
//       window.location.replace("/login");
//     }
//   }, [currentPath]);
//   const authorizedSidebarItems = sidebarItems.filter((item) =>
//     userPermissions.includes(item.title)
//   );

//   const authorizedRoutes = authorizedSidebarItems.some((item) => {
//     if (currentPath.startsWith(item.route)) return true;

//     if (item.subTabs) {
//       return item.subTabs.some((sub) => currentPath.startsWith(sub.route));
//     }

//     return false;
//   });

//   if (!user || !authorizedRoutes) {
//     return <Navigate to="*" replace />;
//   }

//   return <Outlet />;
// };

// export default ProtectedRoute;

import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import sidebarItems from "../constants/constantscomponents/sidebarItems";
import { useSelector, useDispatch } from "react-redux";
import { useGetCurrentUserQuery } from "../redux/api/userApi";
import { setUser } from "../redux/slices/authSlice";

const ProtectedRoute = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const currentPath = location.pathname;

  // Redux state
  const user = useSelector((state) => state.auth.user);

  // Skip API call if no user in Redux (prevents 401 after logout)
  const { data: currentUser, isLoading } = useGetCurrentUserQuery(undefined, {
    skip: !user,
  });

  // Update Redux user when API returns fresh data
  useEffect(() => {
    if (currentUser) {
      dispatch(setUser(currentUser));
    }
  }, [currentUser, dispatch]);

  // Loading state while checking user
  if (isLoading) return <div>Loading...</div>;

  // No user → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Permissions check
  const userPermissions = user?.permissions || [];
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

  if (!authorizedRoutes) {
    return <Navigate to="*" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
