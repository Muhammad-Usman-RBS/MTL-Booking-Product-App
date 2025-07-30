import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedAddCustomer = ({ children }) => {
  const isWidgetFormFilled = localStorage.getItem("isWidgetFormFilled") === "true";

  return isWidgetFormFilled ? children : <Navigate to="/login" replace />;
};

export default ProtectedAddCustomer;
