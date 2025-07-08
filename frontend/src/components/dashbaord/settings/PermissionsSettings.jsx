import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import { ALL_PERMISSIONS } from "../../../constants/dashboardTabsData/data";
import { useUpdateSuperAdminPermissionsMutation } from "../../../redux/api/superAdminApi";
import { updateUserPermissions } from "../../../redux/authSlice";

const PermissionsSettings = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [initialPermissions, setInitialPermissions] = useState([]);
  const [updatePermissions, { isLoading }] =
    useUpdateSuperAdminPermissionsMutation();

  useEffect(() => {
    if (user?.permissions) {
      setSelectedPermissions(user.permissions);
      setInitialPermissions(user.permissions);
    }
  }, [user]);

  const togglePermission = (permission) => {
    if (permission === "Permissions") return;
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const toggleAll = () => {
    const allPermissions = [...ALL_PERMISSIONS];
    const allExceptPermissions = allPermissions.filter(
      (p) => p !== "Permissions"
    );

    if (selectedPermissions.length === ALL_PERMISSIONS.length) {
      setSelectedPermissions(["Permissions"]);
    } else {
      setSelectedPermissions(allPermissions);
    }
  };

  const handleUpdateClick = async () => {
    try {
      const safePermissions = Array.from(
        new Set([...selectedPermissions, "Permissions"])
      );

      await updatePermissions(safePermissions).unwrap();
      toast.success("Permissions updated!");
      setInitialPermissions(safePermissions);

      dispatch(updateUserPermissions({ permissions: safePermissions }));

      const localUser = JSON.parse(localStorage.getItem("user"));
      localUser.permissions = safePermissions;
      localStorage.setItem("user", JSON.stringify(localUser));
    } catch (err) {
      toast.error("Failed to update permissions");
    }
  };

  const hasChanges =
    JSON.stringify([...initialPermissions].sort()) !==
    JSON.stringify([...selectedPermissions].sort());

  return (
    <div>
      <div className="flex justify-between items-center">
        <OutletHeading name="Permissions" />
        <button onClick={toggleAll} className="btn btn-edit mb-2">
          {selectedPermissions.length === ALL_PERMISSIONS.length
            ? "Unselect All"
            : "Select All"}
        </button>
      </div>

      <hr className="mb-6 border-gray-300" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {ALL_PERMISSIONS.map((perm) => (
          <label
            key={perm}
            className="flex items-center gap-2 p-2 bg-white rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              className="text-blue-600 focus:ring-blue-500 rounded"
              checked={selectedPermissions.includes(perm)}
              onChange={() => togglePermission(perm)}
            />
            <span className="text-sm text-gray-700">{perm}</span>
          </label>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          disabled={!hasChanges || isLoading}
          className={`btn btn-reset`}
          onClick={handleUpdateClick}
        >
          {isLoading ? "Updating..." : "Update Permissions"}
        </button>
      </div>
    </div>
  );
};

export default PermissionsSettings;
