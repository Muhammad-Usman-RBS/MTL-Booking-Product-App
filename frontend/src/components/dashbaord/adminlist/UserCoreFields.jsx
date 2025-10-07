import React from "react";
import Icons from "../../../assets/icons";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import UsePasswordToggle from "../../../hooks/UsePasswordToggle";

const UserCoreFields = ({
    isEdit,
    user,
    roleOptions,
    driversList,
    googleConnected,
    sendCalendarInvite,
    setSendCalendarInvite,
    selectedAccount,
    setSelectedAccount,
    corporateCustomersData,
    showSuggestions,
    setShowSuggestions,
    errors = {},
}) => {
    const {
        type: passwordType,
        visible: passwordVisible,
        toggleVisibility,
    } = UsePasswordToggle();

    // helpers
    const Req = () => <span className="text-red-500 ml-0.5">*</span>;
    const errCls = (name) =>
        errors?.[name] ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "";

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-6 mt-6">
            {/* Role / Type */}
            <div className="col-span-1">
                <SelectOption
                    label={
                        <span>
                            Type{!isEdit && <Req />}
                        </span>
                    }
                    value={selectedAccount?.role || ""}
                    onChange={(e) =>
                        setSelectedAccount({ ...selectedAccount, role: e.target.value })
                    }
                    options={roleOptions}
                />
                {errors?.role && <p className="text-red-600 text-sm mt-1">{errors.role}</p>}
            </div>

            {/* Full Name */}
            <div className="col-span-1 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name{!isEdit && <Req />}
                </label>
                <input
                    name="fullName"
                    placeholder="Full Name"
                    type="text"
                    value={selectedAccount?.fullName || ""}
                    onChange={(e) => {
                        setSelectedAccount({ ...selectedAccount, fullName: e.target.value });
                        setShowSuggestions(true);
                    }}
                    readOnly={selectedAccount?.role === "driver"}
                    className={`custom_input w-full ${errCls("fullName")} ${selectedAccount?.role === "driver" ? "bg-gray-100 cursor-not-allowed opacity-70" : ""
                        }`}
                />
                {errors?.fullName && (
                    <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
                )}

                {/* Suggestions (customer role only) */}
                {showSuggestions &&
                    selectedAccount?.role === "customer" &&
                    Array.isArray(corporateCustomersData?.customers) && (
                        <ul className="absolute z-10 bg-white border border-gray-200 rounded shadow mt-1 w-full max-h-48 overflow-y-auto">
                            {corporateCustomersData.customers
                                .filter((customer) =>
                                    customer.name
                                        .toLowerCase()
                                        .includes((selectedAccount.fullName || "").toLowerCase())
                                )
                                .map((customer) => (
                                    <li
                                        key={customer._id}
                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                            setSelectedAccount({
                                                ...selectedAccount,
                                                fullName: customer.name,
                                                email: customer.email,
                                                vatnumber: customer.vatnumber || "",
                                            });
                                            setShowSuggestions(false);
                                        }}
                                    >
                                        {customer.name} – {customer.email}
                                    </li>
                                ))}
                        </ul>
                    )}
            </div>

            {/* VAT (customer only) */}
            {selectedAccount?.role === "customer" && selectedAccount?.vatnumber && (
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        VAT Number
                    </label>
                    <input
                        placeholder="VAT Number"
                        type="text"
                        className="custom_input w-full"
                        value={selectedAccount?.vatnumber || ""}
                        readOnly
                        onChange={(e) =>
                            setSelectedAccount({ ...selectedAccount, vatnumber: e.target.value })
                        }
                    />
                </div>
            )}

            {/* Driver dropdown (driver role) */}
            {selectedAccount?.role === "driver" && (
                <div className="sm:col-span-2 lg:col-span-1">
                    <SelectOption
                        label="Select Driver"
                        value={selectedAccount?.driverId}
                        onChange={(e) => {
                            const selectedDriver = driversList?.drivers?.find(
                                (d) => d._id === e.target.value
                            );
                            if (selectedDriver) {
                                const driverData = selectedDriver?.DriverData || {};
                                setSelectedAccount({
                                    ...selectedAccount,
                                    driverId: selectedDriver._id,
                                    fullName: `${driverData.firstName || ""} ${driverData.surName || ""}`.trim(),
                                    employeeNumber: driverData.employeeNumber || "",
                                    email: driverData.email || "",
                                });
                            }
                        }}
                        options={driversList?.drivers?.map((driver) => ({
                            label: `${driver.DriverData.firstName} ${driver.DriverData.surName}`,
                            value: driver._id,
                        }))}
                    />
                </div>
            )}

            {/* Email */}
            <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email{!isEdit && <Req />}
                </label>
                <input
                    name="email"
                    placeholder="Email"
                    type="email"
                    maxLength={254}
                    className={`custom_input w-full ${errCls("email")} ${selectedAccount?.role === "driver" ? "bg-gray-100 cursor-not-allowed opacity-70" : ""
                        }`}
                    readOnly={selectedAccount?.role === "driver" || googleConnected}
                    value={selectedAccount?.email || ""}
                    onChange={(e) =>
                        setSelectedAccount({ ...selectedAccount, email: e.target.value })
                    }
                />
                {errors?.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="relative col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password{(!isEdit && selectedAccount?.role === "clientadmin") && <Req />}
                </label>
                <div className="relative">
                    <input
                        name="password"
                        placeholder="Password"
                        type={passwordType}
                        minLength={8}
                        maxLength={16}
                        className={`custom_input w-full ${errCls("password")}`}
                        value={selectedAccount?.password || ""}
                        onChange={(e) =>
                            setSelectedAccount({ ...selectedAccount, password: e.target.value })
                        }
                    />
                    <span
                        className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-500"
                        onClick={toggleVisibility}
                        aria-label={passwordVisible ? "Hide password" : "Show password"}
                    >
                        {passwordVisible ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
                    </span>
                </div>
                {errors?.password && (
                    <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
                {isEdit && (
                    <p className="text-red-500 text-sm mt-1">
                        Password is hidden for security purposes.
                    </p>
                )}
            </div>

            {/* Associate Admin Limit (clientadmin only) */}
            {["clientadmin"].includes(selectedAccount?.role) && (
                <div className="col-span-1">
                    <SelectOption
                        label="Max No. of Associate Admins"
                        value={
                            selectedAccount?.associateAdminLimit === ""
                                ? ""
                                : Number(selectedAccount?.associateAdminLimit)
                        }
                        onChange={(e) =>
                            setSelectedAccount({
                                ...selectedAccount,
                                associateAdminLimit:
                                    e.target.value === "" ? "" : Number(e.target.value),
                            })
                        }
                        options={[
                            { label: "0", value: 0 },
                            { label: "3", value: 3 },
                            { label: "5", value: 5 },
                            { label: "10", value: 10 },
                        ]}
                    />
                </div>
            )}

            {/* Status */}
            <div className="col-span-1">
                <SelectOption
                    label={
                        <span>
                            Status{!isEdit && <Req />}
                        </span>
                    }
                    value={selectedAccount?.status ?? ""}
                    onChange={(e) =>
                        setSelectedAccount({ ...selectedAccount, status: e.target.value })
                    }
                    options={[
                        { label: "Active", value: "Active" },
                        { label: "Pending", value: "Pending" },
                        { label: "Suspended", value: "Suspended" },
                    ]}
                />
                {errors?.status && (
                    <p className="text-red-600 text-sm mt-1">{errors.status}</p>
                )}
            </div>

            {selectedAccount?.role === "customer" && (
                <div className="col-span-1">
                    <SelectOption
                        label="Email Preference"
                        value={
                            selectedAccount?.emailPreference === true
                                ? "true"
                                : selectedAccount?.emailPreference === false
                                    ? "false"
                                    : ""
                        }
                        onChange={(e) =>
                            setSelectedAccount({
                                ...selectedAccount,
                                emailPreference: e.target.value === "true",
                            })
                        }
                        options={[
                            { label: "True", value: "true" },
                            { label: "False", value: "false" },
                        ]}
                    />
                    {errors?.emailPreference && (
      <p className="text-red-600 text-sm mt-1">{errors.emailPreference}</p>
    )}
                </div>
            )}

            {/* Google Calendar Invite toggle */}
            {user?.role === "superadmin" && selectedAccount.role === "clientadmin" && (
                <div className="col-span-1 flex items-center justify-between sm:justify-start gap-4">
                    <h3 className="text-sm font-semibold text-gray-700">
                        Send Google Calendar Invite
                    </h3>
                    <button
                        type="button"
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${sendCalendarInvite ? "bg-blue-500" : "bg-gray-300"
                            }`}
                        onClick={() => setSendCalendarInvite((prev) => !prev)}
                    >
                        <div
                            className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${sendCalendarInvite ? "translate-x-6" : "translate-x-0"
                                }`}
                        />
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserCoreFields;
