import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";
import OutletBtnHeading from "../../../constants/constantscomponents/OutletBtnHeading";

import { validateUserAccount } from "../../../utils/validation/validators";
import { useGetAllDriversQuery } from "../../../redux/api/driverApi";
import { useSendGoogleAuthLinkMutation } from "../../../redux/api/googleApi";
import { useGetCorporateCustomersQuery } from "../../../redux/api/corporateCustomerApi";
import {
  useCreateClientAdminMutation,
  useFetchClientAdminsQuery,
  useUpdateClientAdminMutation,
  useInitiateUserVerificationMutation,
} from "../../../redux/api/adminApi";

import UserCoreFields from "./UserCoreFields";
import PermissionsPanel from "./PermissionsPanel";
import { useLoading } from "../../common/LoadingProvider";

const NewAdminUser = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const actualAdminId = id;
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { showLoading, hideLoading } = useLoading();
  const [sendGoogleAuthLink] = useSendGoogleAuthLinkMutation();
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendCalendarInvite, setSendCalendarInvite] = useState(false);

  const { data: adminsListData = [] } = useFetchClientAdminsQuery();
  const { data: driversList = [], isLoading } = useGetAllDriversQuery(
    user?.companyId,
    {
      skip: !user?.companyId,
    }
  );

  const [selectedAccount, setSelectedAccount] = useState({
    fullName: "",
    email: "",
    role: "",
    status: "",
    password: "",
    permissions: [],
    associateAdminLimit: "",
    vatnumber: "",
    emailPreference: "",
  });

  const [errors, setErrors] = useState({});
  const [createAdmin] = useCreateClientAdminMutation();
  const [updateAdmin] = useUpdateClientAdminMutation();
  const [googleConnected, setGoogleConnected] = useState(false);
  const [initiateUserVerification] = useInitiateUserVerificationMutation();

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  });
  // --- Handle Google callback & prefill when returning from OAuth ---
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
      let parsedAccount = cached
        ? JSON.parse(cached)
        : {
          fullName: "",
          email: emailFromGoogle,
          role: "clientadmin",
          status: "",
          password: "",
          permissions: [],
          associateAdminLimit: "",
        };

      parsedAccount.email = emailFromGoogle;

      localStorage.setItem("pendingClientAdmin", JSON.stringify(parsedAccount));

      toast.success("Google Calendar connected");
      setGoogleConnected(true);
      setSelectedAccount(parsedAccount);

      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [isEdit]);

  useEffect(() => {
    if (!isEdit || !actualAdminId || adminsListData.length === 0) return;

    const adminToEdit = adminsListData.find((a) => a._id === actualAdminId);
    if (!adminToEdit) return;

    setSelectedAccount((prev) => {
      // Avoid unnecessary re-set to break loop
      if (prev.email === adminToEdit.email && prev.fullName === adminToEdit.fullName) {
        return prev;
      }

      let matchedDriverId = adminToEdit.driverId;
      if (adminToEdit.role === "driver" && !matchedDriverId && driversList?.drivers?.length) {
        const matchedDriver = driversList.drivers.find(
          (d) => d.DriverData?.email === adminToEdit.email
        );
        if (matchedDriver) matchedDriverId = matchedDriver._id;
      }

      return {
        fullName: adminToEdit.fullName || "",
        email: adminToEdit.email || "",
        role: adminToEdit.role || "",
        status: adminToEdit.status || "Active",
        password: "",
        permissions: adminToEdit.permissions || [],
        associateAdminLimit: adminToEdit.associateAdminLimit ?? "",
        driverId: matchedDriverId || "",
        employeeNumber: adminToEdit.employeeNumber || "",
        vatnumber: adminToEdit.vatnumber || "",
        emailPreference: adminToEdit.emailPreference,
      };
    });
  }, [isEdit, actualAdminId, adminsListData, driversList?.drivers?.length]);

  // --- Role options based on current user role ---
  let roleOptions = [];
  if (user?.role === "superadmin") roleOptions = ["clientadmin", "demo"];
  else if (user?.role === "clientadmin")
    roleOptions = ["associateadmin", "staffmember", "driver", "customer"];
  else if (user?.role === "associateadmin")
    roleOptions = ["staffmember", "driver", "customer"];
  else if (user?.role === "demo")
    roleOptions = ["staffmember", "driver", "customer"];

  useEffect(() => {
    if (!isEdit && roleOptions.length > 0 && !selectedAccount.role) {
      setSelectedAccount((prev) => {
        if (!prev.role) {
          return { ...prev, role: roleOptions[0] };
        }
        return prev;
      });
    }
  }, [roleOptions, isEdit]);

  // --- Permissions matrix (same logic, shared with child through prop) ---
  const getAvailablePermissions = (role) => {
    if (["driver"].includes(role)) {
      return [
        "Company Accounts",
        "Drivers",
        "Settings",
        "Invoices",
        "Bookings",
      ];
    } else if (["customer"].includes(role)) {
      return ["Bookings", "Invoices", "Company Accounts", "Settings"];
    } else if (["clientadmin"].includes(role)) {
      return [
        "Users",
        "Bookings",
        "Invoices",
        "Drivers",
        "Customers",
        "Company Accounts",
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
        "Widget/API",
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
        "Pricing",
        "Settings",
      ];
    }
  };

  useEffect(() => {
    if (isEdit) return;

    if (selectedAccount?.role === "driver") {
      if (!driversList?.drivers?.length) {
        if (roleOptions[0] && selectedAccount.role !== roleOptions[0]) {
          toast.warn("Please enter Driver details first from the Drivers tab.");
          setSelectedAccount((prev) => ({ ...prev, role: roleOptions[0] }));
        }
        return;
      }
      if (!selectedAccount.driverId) {
        const firstDriver = driversList.drivers[0];
        const driverData = firstDriver?.DriverData || {};

        setSelectedAccount((prev) => ({
          ...prev,
          driverId: firstDriver._id,
          fullName: `${driverData.firstName || ""} ${driverData.surName || ""
            }`.trim(),
          employeeNumber: driverData.employeeNumber || "",
          email: driverData.email || "",
        }));
      } else {
      }
    }
  }, [selectedAccount?.role, driversList?.drivers, isEdit]);

  // --- Save / Update (unchanged logic) ---
  const handleSave = async () => {
    // run form validation
    const { errors: vErrors, isValid } = validateUserAccount(selectedAccount, { isEdit });

    if (selectedAccount?.role === "customer" && selectedAccount?.emailPreference === "") {
      vErrors.emailPreference = "Please select an email preference.";
    }
    
    setErrors(vErrors);
    
    if (Object.keys(vErrors).length > 0) {
      if (vErrors.emailPreference) {
        toast.error(vErrors.emailPreference);
      } else {
        toast.error("Validation failed. Kindly check the required fields.");
      }
      return;
    }
    if (user?.role === "demo") {
      toast.error("Demo accounts are not allowed to create users.");
      return;
    }

    const { fullName, email, role } = selectedAccount;
    if (!fullName || !email || !role) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      if (isEdit && actualAdminId) {
        // ---- Update flow ----
        const payload = {
          ...selectedAccount,
          emailPreference: selectedAccount.emailPreference,
          vatnumber: selectedAccount.vatnumber || "",
          employeeNumber: selectedAccount.employeeNumber,
        };

        if (payload.role !== "clientadmin") {
          delete payload.associateAdminLimit;
        }

        await updateAdmin({ adminId: actualAdminId, payload }).unwrap();
        toast.success("User updated successfully");
        navigate("/dashboard/admin-list", { replace: true });
      } else {
        // ---- Create flow ----
        const payload = {
          ...selectedAccount,
          emailPreference: selectedAccount.emailPreference,
          vatnumber: selectedAccount.vatnumber || "",
          employeeNumber: selectedAccount.employeeNumber,
          companyId:
            user?.role === "superadmin" && role === "clientadmin"
              ? null
              : user?.companyId || user?._id,
          createdBy: user?._id,
        };

        if (googleConnected) {
          const calendar = JSON.parse(
            localStorage.getItem("googleCalendarTokens") || "{}"
          );
          if (calendar?.access_token && calendar?.refresh_token) {
            payload.googleCalendar = calendar;
          }
        }

        if (payload.role !== "clientadmin") delete payload.associateAdminLimit;

        // OTP ONLY if superadmin is creating clientadmin/associateadmin
        const otpRequired =
          (user?.role === "superadmin" && payload.role === "clientadmin") ||
          (user?.role === "clientadmin" && payload.role === "associateadmin");
          if (otpRequired) {
            const res = await initiateUserVerification(payload).unwrap();
            toast.success("OTP sent. Please verify.");
            
            // Pass flag to send Google invite after verification
            let verifyUrl = `/dashboard/admin-list/verify-user?tid=${res.transactionId}&email=${encodeURIComponent(email)}`;
            if (sendCalendarInvite && payload.role === "clientadmin") {
              verifyUrl += "&sendGoogleInvite=true";
            }
            
            navigate(verifyUrl);
          }else {
          const res = await createAdmin(payload).unwrap();
          toast.success("User created successfully");
          if (
            payload.role === "clientadmin" ||
            payload.role === "associateadmin"
          ) {
            navigate("/dashboard/company-accounts/list");
          } else {
            navigate("/dashboard/admin-list");
            window.location.reload();
          }
        }
      }

      // Cleanup
      localStorage.removeItem("googleCalendarTokens");
      localStorage.removeItem("pendingClientAdmin");
    } catch (err) {
      toast.error(err?.data?.message || err?.error);
    }
  };

  // Customers list (same condition)
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { data: corporateCustomersData } = useGetCorporateCustomersQuery(
    undefined,
    {
      skip: selectedAccount?.role?.toLowerCase() !== "customer",
    }
  );

  return (
    <div className="w-full">
      {/* Header with title + back button */}
      <div>
        <OutletBtnHeading
          name={isEdit ? "Edit User Account" : "Add User Account"}
          buttonLabel="← Back to Users List"
          buttonLink="/dashboard/admin-list"
          buttonBg="btn btn-back"
        />
      </div>

      {/* Core Fields */}
      <UserCoreFields
        isEdit={isEdit}
        user={user}
        roleOptions={roleOptions}
        driversList={driversList}
        googleConnected={googleConnected}
        sendCalendarInvite={sendCalendarInvite}
        setSendCalendarInvite={setSendCalendarInvite}
        isSendingEmail={isSendingEmail}
        setIsSendingEmail={setIsSendingEmail}
        selectedAccount={selectedAccount}
        setSelectedAccount={setSelectedAccount}
        corporateCustomersData={corporateCustomersData}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        onPrimaryAction={handleSave}
        errors={errors}
      />

      {/* Permissions */}
      <PermissionsPanel
        selectedRole={selectedAccount?.role}
        selectedPermissions={selectedAccount?.permissions || []}
        setSelectedPermissions={(perms) =>
          setSelectedAccount((p) => ({ ...p, permissions: perms }))
        }
        getAvailablePermissions={getAvailablePermissions}
      />

      {/* Footer button (always last, responsive) */}
      <div className="flex flex-col sm:flex-row justify-end sm:justify-start gap-3 pt-5 border-t border-gray-200 mt-6">
        <button
          className={`btn btn-success w-full sm:w-auto ${isSendingEmail ? "opacity-50 cursor-not-allowed" : ""
            }`}
          disabled={isSendingEmail}
          onClick={async () => {
            if (isSendingEmail) return;
            setIsSendingEmail(true);
            try {
              await handleSave(); // add-mode: initiate OTP & navigate to /verify-user
            } finally {
              setIsSendingEmail(false);
            }
          }}
        >
          {isEdit
            ? isSendingEmail
              ? "Updating..."
              : "Update User"
            : isSendingEmail
              ? selectedAccount.role === "clientadmin" ||
                selectedAccount.role === "associateadmin"
                ? "Sending OTP..."
                : "Creating..."
              : selectedAccount.role === "clientadmin" ||
                selectedAccount.role === "associateadmin"
                ? "Create User & Send OTP"
                : "Create User"}
        </button>
      </div>
    </div>
  );
};

export default NewAdminUser;
