import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useGetCurrentUserQuery } from "../redux/api/userApi";
import { setUser } from "../redux/slices/authSlice";
import sidebarItems from "../constants/constantscomponents/sidebarItems";
import { useLoading } from "../components/common/LoadingProvider";

const ProtectedRoute = () => {
  const dispatch = useDispatch();
  const { showLoading, hideLoading } = useLoading();

  const location = useLocation();
  const currentPath = location.pathname;

  const { data: currentUser, isLoading, isError } = useGetCurrentUserQuery();
  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);
  useEffect(() => {
    if (currentUser) {
      dispatch(setUser(currentUser));
    }
  }, [currentUser, dispatch]);

  if (isError || !currentUser) return <Navigate to="/login" replace />;

  const userPermissions = currentUser.permissions || [];
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
