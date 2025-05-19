// import React from 'react';
// import { Navigate, Outlet } from 'react-router-dom';

// const ProtectedRoute = ({ role }) => {
//   const user = JSON.parse(localStorage.getItem('user'));

//   if (!user || user.role !== role) {
//     return <Navigate to="/" replace />;
//   }

//   return <Outlet />;
// };

// export default ProtectedRoute;



import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import sidebarItems from "../constants/constantscomponents/sidebarItems";

const ProtectedRoute = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userPermissions = user?.permissions || [];
  const location = useLocation();
  const currentPath = location.pathname;

  // console.log("Current path:", currentPath);

  const authorizedSidebarItems = sidebarItems.filter(item =>
    userPermissions.includes(item.title)
  );


  const authorizedRoutes = authorizedSidebarItems.some(item => {
    // Check top-level route
    if (item.route === currentPath) return true;

    // Check subTabs, if any
    if (item.subTabs) {
      return item.subTabs.some(sub => sub.route === currentPath);
    }

    return false;
  });


  if (!user || !authorizedRoutes) {
    return <Navigate to="*" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;