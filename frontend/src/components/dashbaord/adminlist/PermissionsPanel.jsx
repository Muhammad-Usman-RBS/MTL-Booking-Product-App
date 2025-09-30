import React from "react";

const PermissionsPanel = ({
    selectedRole,
    selectedPermissions,
    setSelectedPermissions,
    getAvailablePermissions,
}) => {
    const allPerms = getAvailablePermissions(selectedRole);
    const allSelected = allPerms.every((p) => selectedPermissions.includes(p));

    return (
        <div className="bg-gray-50 p-4 rounded-lg mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 className="text-lg font-medium text-gray-700">Permissions</h3>
                <button
                    className="btn btn-back w-full sm:w-auto"
                    onClick={() => setSelectedPermissions(allSelected ? [] : allPerms)}
                >
                    {allSelected ? "Unselect All" : "Select All"}
                </button>
            </div>

            {/* Permissions grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allPerms.map((perm) => {
                    const checked = selectedPermissions.includes(perm);
                    return (
                        <label
                            key={perm}
                            className="flex items-center gap-2 p-2 bg-white rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer transition"
                        >
                            <input
                                type="checkbox"
                                className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 rounded"
                                checked={checked}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedPermissions([...selectedPermissions, perm]);
                                    } else {
                                        setSelectedPermissions(
                                            selectedPermissions.filter((p) => p !== perm)
                                        );
                                    }
                                }}
                            />
                            <span className="text-sm sm:text-base text-gray-700 break-words">{perm}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};

export default PermissionsPanel;
