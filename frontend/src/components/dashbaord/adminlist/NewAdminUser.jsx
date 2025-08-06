import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Icons from "../../../assets/icons";
import "react-toastify/dist/ReactToastify.css";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import { useCreateClientAdminMutation, useFetchClientAdminsQuery, useUpdateClientAdminMutation } from "../../../redux/api/adminApi";
import { useParams } from "react-router-dom";

import { useGetAllDriversQuery } from "../../../redux/api/driverApi";
import UsePasswordToggle from "../../../hooks/UsePasswordToggle";
import { useSendGoogleAuthLinkMutation } from "../../../redux/api/googleApi";

const NewAdminUser = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const actualAdminId = id;
  const navigate = useNavigate();
  const {
    type: passwordType,
    visible: passwordVisible,
    toggleVisibility: toggleVisibility,
  } = UsePasswordToggle();
  const user = useSelector((state) => state.auth.user);
  const [sendGoogleAuthLink] = useSendGoogleAuthLinkMutation();
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const [sendCalendarInvite, setSendCalendarInvite] = useState(false);

  const { data: adminsListData = [] } = useFetchClientAdminsQuery();
  const { data: driversList = [] } = useGetAllDriversQuery(user?.companyId, {
    skip: !user?.companyId,
  });

  const [createAdmin] = useCreateClientAdminMutation();
  const [updateAdmin] = useUpdateClientAdminMutation();
  const [selectedAccount, setSelectedAccount] = useState({
    fullName: "",
    email: "",
    role: "",
    status: "Active",
    password: "",
    permissions: [],
    associateAdminLimit: 5,
  });
  const [googleConnected, setGoogleConnected] = useState(false);
  useEffect(() => {
    if (isEdit) return;

    const params = new URLSearchParams(window.location.search);

    const isGoogleConnected = params.get("googleConnected") === "true";
    const emailFromGoogle = params.get("email");
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (isGoogleConnected && access_token && refresh_token) {
      localStorage.setItem(
        "googleCalendarTokens",
        JSON.stringify({
          access_token,
          refresh_token,
          calendarId: "primary",
        })
      );

      const cached = localStorage.getItem("pendingClientAdmin");
      let parsedAccount;

      if (cached) {
        parsedAccount = JSON.parse(cached);
      } else {
        parsedAccount = {
          fullName: "",
          email: emailFromGoogle,
          role: "clientadmin",
          status: "Active",
          password: "",
          permissions: [],
          associateAdminLimit: 5,
        };
      }

      parsedAccount.email = emailFromGoogle;

      localStorage.setItem("pendingClientAdmin", JSON.stringify(parsedAccount));

      toast.success("✅ Google Calendar connected");
      setGoogleConnected(true);
      setSelectedAccount(parsedAccount);

      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  useEffect(() => {
    if (isEdit && actualAdminId && adminsListData.length > 0) {
      const adminToEdit = adminsListData.find(
        (admin) => admin._id === actualAdminId
      );
      if (adminToEdit) {
        setSelectedAccount({
          fullName: adminToEdit.fullName || "",
          email: adminToEdit.email || "",
          role: adminToEdit.role || "",
          status: adminToEdit.status || "Active",
          password: "",
          permissions: adminToEdit.permissions || [],
          associateAdminLimit: adminToEdit.associateAdminLimit || 5,
          driverId: adminToEdit.driverId || "",
          employeeNumber: adminToEdit.employeeNumber || "",
        });
      }
    }
  }, [isEdit, actualAdminId, adminsListData]);

  const handleSave = async () => {
    if (user?.role === "demo") {
      toast.error("Demo accounts are not allowed to create users.");
      return;
    }

    const { fullName, email, role, password } = selectedAccount;

    // Validate required fields
    if (!fullName || !email || !role) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // For clientadmin create only – require password
    if (!isEdit && role === "clientadmin" && !password) {
      toast.error("Please enter a password for the client admin.");
      return;
    }

    try {
      // 🔁 EDIT MODE
      if (isEdit && actualAdminId) {
        const payload = {
          ...selectedAccount,
          employeeNumber: selectedAccount.employeeNumber,
        };

        if (!["clientadmin", "manager"].includes(payload.role)) {
          delete payload.associateAdminLimit;
        }

        await updateAdmin({ adminId: actualAdminId, payload }).unwrap();
        toast.success("User updated successfully");
      } else {
        if (role === "clientadmin") {
          const payload = {
            ...selectedAccount,
            companyId:
              user?.role === "superadmin" ? null : user?.companyId || user?._id,
            createdBy: user?._id,
          };

          // Include Google Calendar if connected
          if (googleConnected) {
            const calendar = JSON.parse(
              localStorage.getItem("googleCalendarTokens")
            );
            payload.googleCalendar = calendar;
          }

          await createAdmin(payload).unwrap();

          // Send auth link only if toggle is true and not already connected
          if (sendCalendarInvite && !googleConnected) {
            await sendGoogleAuthLink({ email, role }).unwrap();
            toast.success("User created and Google auth link sent!");
          } else {
            toast.success("User created successfully");
          }

          localStorage.setItem(
            "pendingClientAdmin",
            JSON.stringify(selectedAccount)
          );
        } else if (role === "clientadmin" && sendCalendarInvite) {
          // Google workflow - only when toggle is true AND role is clientadmin
          const payload = {
            ...selectedAccount,
            companyId:
              user?.role === "superadmin" ? null : user?.companyId || user?._id,
            createdBy: user?._id,
          };

          await createAdmin(payload).unwrap();

          await sendGoogleAuthLink({
            email,
            role,
          }).unwrap();

          toast.success("User created and Google auth link sent successfully!");

          localStorage.setItem(
            "pendingClientAdmin",
            JSON.stringify(selectedAccount)
          );
        } else if (role === "clientadmin") {
          const payload = {
            ...selectedAccount,
            companyId:
              user?.role === "superadmin" ? null : user?.companyId || user?._id,
            createdBy: user?._id,
          };

          await createAdmin(payload).unwrap();
          toast.success("User created successfully");
        } else {
          const payload = {
            ...selectedAccount,
            employeeNumber: selectedAccount.employeeNumber,
            companyId:
              user?.role === "superadmin" && role === "clientadmin"
                ? null
                : user?.companyId || user?._id,
            createdBy: user?._id,
          };

          if (!["clientadmin", "manager"].includes(payload.role)) {
            delete payload.associateAdminLimit;
          }

          await createAdmin(payload).unwrap();
          toast.success("User created successfully");
        }
      }

      // Cleanup
      localStorage.removeItem("googleCalendarTokens");
      localStorage.removeItem("pendingClientAdmin");

      if (onClose) {
        onClose();
      } else {
        navigate("/dashboard/admin-list");
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.error);
    }
  };

  let roleOptions = [];
  if (user?.role === "superadmin")
    roleOptions = ["clientadmin", "manager", "demo"];
  else if (user?.role === "manager")
    roleOptions = ["manager", "demo", "driver", "customer"];
  else if (user?.role === "clientadmin")
    roleOptions = ["associateadmin", "staffmember", "driver", "customer"];
  else if (user?.role === "associateadmin")
    roleOptions = ["staffmember", "driver", "customer"];
  else if (user?.role === "demo")
    roleOptions = ["staffmember", "driver", "customer"];

  useEffect(() => {
    if (
      !isEdit &&
      roleOptions.length > 0 &&
      !selectedAccount.role
    ) {
      setSelectedAccount((prev) => ({ ...prev, role: roleOptions[0] }));
    }
  }, [roleOptions]);

  const getAvailablePermissions = (role) => {
    if (["driver"].includes(role)) {
      return [
        "Statements",
        "Company Accounts",
        "Drivers",
        "Settings",
        "Invoices",
        "Bookings"
      ];
    } else if (["customer"].includes(role)) {
      return ["Invoices", "Company Accounts", "Settings"];
    } else if (["clientadmin", "manager"].includes(role)) {
      return [
        "Users",
        "Bookings",
        "Invoices",
        "Drivers",
        "Customers",
        "Company Accounts",
        "Statements",
        "Pricing",
        "Settings",
        "Widget/API",
      ];
    } else if (["associateadmin"].includes(role)) {
      return [
        "Users",
        "Bookings",
        "Invoices",
        "Drivers",
        "Customers",
        "Company Accounts",
        "Statements",
        "Pricing",
        "Settings",
      ];
    } else {
      return [
        "Users",
        "Bookings",
        "Invoices",
        "Drivers",
        "Customers",
        "Company Accounts",
        "Statements",
        "Pricing",
        "Settings",
      ];
    }
  };
  useEffect(() => {
    if (selectedAccount?.role === "driver") {
      if (!driversList?.drivers?.length) {
        toast.warn(
          "⚠️ Please enter Driver details first from the Drivers tab."
        );
        setSelectedAccount({ role: roleOptions[0] });
        return;
      }
      const singleDriver = driversList.drivers[0];
      const driverData = singleDriver?.DriverData || {};

      setSelectedAccount({
        ...selectedAccount,
        driverId: singleDriver._id,
        fullName: `${driverData.firstName || ""} ${
          driverData.surName || ""
        }`.trim(),
        employeeNumber: driverData.employeeNumber || "",
        email: driverData.email || "",
      });
    }
  }, [selectedAccount?.role, driversList]);

  return (
    <div>
      <div
        className={`${
          isEdit ? "border-[var(--light-gray)] border-b" : ""
        } flex items-center justify-between `}
      >
        <OutletHeading name={isEdit ? "Edit User" : "Add User"} />

        <Link to="/dashboard/admin-list" className="mb-4">
          <button className="btn btn-primary ">← Back to Users List</button>
        </Link>
      </div>
      <hr className="mb-6 border-[var(--light-gray)]" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="md:col-span-1">
          <SelectOption
            label="Type"
            value={selectedAccount?.role || ""}
            onChange={(e) => {
              setSelectedAccount({
                ...selectedAccount,
                role: e.target.value,
              });
            }}
            options={roleOptions}
          />
        </div>
        <div className="md:col-span-1 ">
          <label className="text-sm ">Full Name</label>

          <input
            name="fullName"
            placeholder="Full Name"
            type="text"
            readOnly={selectedAccount?.role === "driver"}
            className={`custom_input mt-1   ${
              selectedAccount?.role === "driver"
                ? "bg-gray-100 cursor-not-allowed opacity-70"
                : ""
            }`}
            value={selectedAccount?.fullName || ""}
            onChange={(e) =>
              setSelectedAccount({
                ...selectedAccount,
                fullName: e.target.value,
              })
            }
          />
        </div>
        {selectedAccount?.role === "driver" && (
          <div className="md:col-span-2 lg:col-span-1">
            <SelectOption
              label="Select Driver"
              value={selectedAccount?.driverId}
              onChange={(e) => {
                const selectedDriver = driversList?.drivers?.find(
                  (driver) => driver._id === e.target.value
                );

                if (selectedDriver) {
                  const driverData = selectedDriver?.DriverData || {};
                  setSelectedAccount({
                    ...selectedAccount,
                    driverId: selectedDriver._id,
                    fullName: `${driverData.firstName || ""} ${
                      driverData.surName || ""
                    }`.trim(),
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
        <div className="md:col-span-1">
          <label className="text-sm">Email</label>

          <input
            placeholder="Email"
            type="email"
            className={`custom_input mt-1   ${
              selectedAccount?.role === "driver"
                ? "bg-gray-100 cursor-not-allowed opacity-70"
                : ""
            }`}
            readOnly={selectedAccount?.role === "driver" || googleConnected}
            value={selectedAccount?.email || ""}
            onChange={(e) =>
              setSelectedAccount({ ...selectedAccount, email: e.target.value })
            }
          />
        </div>
        <div className="relative md:col-span-1  ">
          <label className="text-sm">Password</label>
          <div className="relative mt-1">
            <input
              placeholder="Password"
              type={passwordType}
              className="custom_input"
              value={selectedAccount?.password || ""}
              onChange={(e) =>
                setSelectedAccount({
                  ...selectedAccount,
                  password: e.target.value,
                })
              }
            />
            <span
              className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={toggleVisibility}
            >
              {passwordVisible ? (
                <Icons.EyeOff size={18} />
              ) : (
                <Icons.Eye size={18} />
              )}
            </span>
          </div>
        </div>

        {["clientadmin", "manager"].includes(selectedAccount?.role) && (
          <div className="md:col-span-1">
            <SelectOption
              label="Associate Admin Limit"
              value={selectedAccount?.associateAdminLimit || 5}
              onChange={(e) =>
                setSelectedAccount({
                  ...selectedAccount,
                  associateAdminLimit: parseInt(e.target.value),
                })
              }
              options={[5, 10, 15].map((num) => ({
                label: `${num}`,
                value: num,
              }))}
            />
          </div>
        )}
        <div className="md:col-span-1">
          <SelectOption
            label="Status"
            value={selectedAccount?.status || ""}
            onChange={(e) =>
              setSelectedAccount({ ...selectedAccount, status: e.target.value })
            }
            options={["Active", "Pending", "Suspended"]}
          />
        </div>
        {user?.role === "superadmin" &&
          selectedAccount.role === "clientadmin" && (
            <div className="md:col-span-1 flex items-center gap-4">
              <label className="text-md font-semibold text-[var(--dark-gray)]">
                Send Google Calendar Invite
              </label>
              <button
                type="button"
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                  sendCalendarInvite ? "bg-blue-500" : "bg-gray-300"
                }`}
                onClick={() => setSendCalendarInvite((prev) => !prev)}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    sendCalendarInvite ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          )}

        <div className="md:col-span-2 lg:col-span-3 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-700">Permissions</h3>
            <button
              className="btn btn-edit"
              onClick={() => {
                const allPermissions = getAvailablePermissions(
                  selectedAccount?.role
                );
                const allSelected = allPermissions.every((perm) =>
                  selectedAccount?.permissions?.includes(perm)
                );

                setSelectedAccount({
                  ...selectedAccount,
                  permissions: allSelected ? [] : allPermissions,
                });
              }}
            >
              {getAvailablePermissions(selectedAccount?.role).every((perm) =>
                selectedAccount?.permissions?.includes(perm)
              )
                ? "Unselect All"
                : "Select All"}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {getAvailablePermissions(selectedAccount?.role).map((perm) => (
              <label
                key={perm}
                className="flex items-center gap-2 p-2 bg-white rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="text-blue-600 focus:ring-blue-500 rounded"
                  checked={selectedAccount?.permissions?.includes(perm)}
                  onChange={(e) => {
                    const updated = e.target.checked
                      ? [...(selectedAccount.permissions || []), perm]
                      : selectedAccount.permissions.filter((p) => p !== perm);
                    setSelectedAccount({
                      ...selectedAccount,
                      permissions: updated,
                    });
                  }}
                />
                <span className="text-sm text-gray-700">{perm}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          {selectedAccount.role === "clientadmin" ? (
            <>
              <button
                className={`${
                  isEdit ? "btn btn-success" : "btn btn-primary"
                } duration-300 ease-in-out ${
                  googleConnected || isSendingEmail
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={async () => {
                  if (googleConnected || isSendingEmail) return;
                  setIsSendingEmail(true);
                  await handleSave();
                  setIsSendingEmail(false);
                }}
              >
                {isSendingEmail
                  ? "Sending Email..."
                  : isEdit
                  ? "Update User"
                  : sendCalendarInvite
                  ? "Create & Send Email"
                  : "Create User"}
              </button>
            </>
          ) : (
            <div className="md:col-span-2 lg:col-span-3 flex justify-start gap-3 pt-5 border-t border-gray-200">
              <button
                className={`${isEdit ? "btn btn-success" : "btn btn-primary"}`}
                onClick={handleSave}
              >
                {isEdit ? "Update User" : "Create User"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewAdminUser;
