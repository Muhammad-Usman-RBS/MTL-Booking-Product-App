import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { timeOptions } from "../../../constants/dashboardTabsData/data";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import { useGetCronJobQuery, useUpdateCronJobByCompanyMutation, useToggleCronJobFeatureMutation, useRunDriverDocsNowMutation} from "../../../redux/api/cronJobsApi";
import { useLoading } from "../../common/LoadingProvider";
import { useSelector } from "react-redux";

// ---- helpers ----
function isWithinTimeWindow(timeRange) {
  if (!timeRange || typeof timeRange !== "string") return false;
  const [start, end] = timeRange.split(/–|-/).map((t) => t.trim());
  if (!start || !end) return false;

  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if ([sh, sm, eh, em].some(isNaN)) return false;

  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const st = sh * 60 + sm;
  const en = eh * 60 + em;

  return en > st ? cur >= st && cur < en : cur >= st || cur < en; // midnight cross safe
}

const CronJob = () => {
  const {showLoading, hideLoading} = useLoading()
  // Get user and company info from your auth state
  const user = useSelector((state)=> state?.auth?.user)
  const companyId = user?.companyId || "";
  const userId = user?._id || "";

  // RTK Query hooks
  const {
    data: cronJobData,
    isLoading,
    isError,
    refetch,
  } = useGetCronJobQuery(companyId, { skip: !companyId });

  const [updateCronJobByCompany, { isLoading: isUpdating }] =
    useUpdateCronJobByCompanyMutation();
  const [toggleFeature, { isLoading: isToggling }] =
    useToggleCronJobFeatureMutation();

  // auto-run mutation
  const [runNow, { isLoading: isAutoRunning }] = useRunDriverDocsNowMutation();

  // Local state for form data with proper default structure
  const [formData, setFormData] = useState({
    autoAllocation: {
      enabled: false,
      timing: { hours: "0 hours", period: "before pickup time" },
      notifications: { sms: false, email: true },
    },
    reviews: {
      enabled: true,
      timing: { hours: "1 hours" },
      notifications: { sms: false, email: true },
    },
    driverDocumentsExpiration: {
      enabled: false,
      timing: { dailyTime: "16:00 - 17:00" },
      notifications: { sms: false, email: false },
    },
    driverStatement: {
      enabled: false,
      timing: { frequency: "Weekly", day: "Monday", time: "01:00 - 02:00" },
      notifications: { sms: false, email: false },
    },
  });
  useEffect(()=> {
       if(isLoading) {
         showLoading()
       } else {
         hideLoading()
       }
     },[isLoading])
  // Helper function to ensure proper nested object structure
  const ensureNestedStructure = (data) => {
    const defaultStructure = {
      autoAllocation: {
        enabled: false,
        timing: { hours: "0 hours", period: "before pickup time" },
        notifications: { sms: false, email: true },
      },
      reviews: {
        enabled: true,
        timing: { hours: "1 hours" },
        notifications: { sms: false, email: true },
      },
      driverDocumentsExpiration: {
        enabled: false,
        timing: { dailyTime: "16:00 - 17:00" },
        notifications: { sms: false, email: false },
      },
      driverStatement: {
        enabled: false,
        timing: {
          frequency: "Weekly",
          day: "Monday",
          time: "01:00 - 02:00",
        },
        notifications: { sms: false, email: false },
      },
    };

    const result = { ...defaultStructure };
    Object.keys(result).forEach((section) => {
      if (data[section]) {
        result[section] = {
          ...result[section],
          ...data[section],
          timing: {
            ...result[section].timing,
            ...(data[section].timing || {}),
          },
          notifications: {
            ...result[section].notifications,
            ...(data[section].notifications || {}),
          },
        };
      }
    });
    return result;
  };

  // Load data from API when component mounts or data changes
  useEffect(() => {
    if (cronJobData?.cronJob) {
      const structuredData = ensureNestedStructure(cronJobData.cronJob);
      setFormData(structuredData);
    }
  }, [cronJobData]);

  // Handle toggle for main feature switches
  const handleFeatureToggle = async (feature) => {
    const newEnabledState = !formData[feature]?.enabled;
    try {
      const response = await toggleFeature({
        companyId,
        feature,
        enabled: newEnabledState,
        updatedBy: userId,
      }).unwrap();

      if (response?.cronJob) {
        const structuredData = ensureNestedStructure(response.cronJob);
        setFormData(structuredData);
      } else {
        setFormData((prev) => ({
          ...prev,
          [feature]: {
            ...prev[feature],
            enabled: newEnabledState,
          },
        }));
      }
      toast.success(
        `${feature} ${newEnabledState ? "enabled" : "disabled"} successfully!`
      );
    } catch (error) {
      toast.error(
        `Failed to toggle ${feature}: ${error?.data?.message || "Unknown error"}`
      );
    }
  };

  // Handle form field changes
  const handleFieldChange = (section, field, value, subField = null) => {
    let cleanValue = value;
    if (value && typeof value === "object") {
      if (value.target !== undefined) {
        cleanValue =
          value.target.type === "checkbox"
            ? value.target.checked
            : value.target.value;
      } else if (value.value !== undefined) {
        cleanValue = value.value;
      }
    }

    setFormData((prev) => {
      const newData = { ...prev };
      if (!newData[section]) newData[section] = {};

      if (subField) {
        if (!newData[section][field]) newData[section][field] = {};
        newData[section][field] = {
          ...newData[section][field],
          [subField]: cleanValue,
        };
      } else {
        newData[section][field] = cleanValue;
      }
      return newData;
    });
  };

  // Submit settings
  const handleSubmit = async () => {
    if (!companyId || !userId) {
      toast.error("Missing company or user information");
      return;
    }
    try {
      const cleanFormData = ensureNestedStructure(formData);
      const response = await updateCronJobByCompany({
        companyId,
        ...cleanFormData,
        updatedBy: userId,
      }).unwrap();

      if (response?.cronJob) {
        const structuredData = ensureNestedStructure(response.cronJob);
        setFormData(structuredData);
      }
      toast.success("Cron job settings updated successfully!");
      refetch();
    } catch (error) {
      toast.error(
        `Failed to update settings: ${error?.data?.message || "Unknown error"}`
      );
    }
  };

  // Select handler factory
  const handleSelectChange = (section, field, subField = null) => {
    return (selectedValue) => {
      handleFieldChange(section, field, selectedValue, subField);
    };
  };

  // Safe getter
  const getNestedValue = (obj, path) =>
    path.split(".").reduce(
      (current, key) =>
        current && current[key] !== undefined ? current[key] : "",
      obj
    );

  // -------------- AUTO RUN (no button needed) --------------
  const autoRunDoneRef = useRef(false); // to avoid spamming in same window

  useEffect(() => {
    if (!companyId) return;

    const tick = async () => {
      const enabled = !!formData?.driverDocumentsExpiration?.enabled;
      const dailyTime =
        formData?.driverDocumentsExpiration?.timing?.dailyTime || "";

      // If feature disabled, reset flag & exit
      if (!enabled) {
        autoRunDoneRef.value = false;
        return;
      }

      const inWindow = isWithinTimeWindow(dailyTime);

      // if inside window & not yet run -> run once
      if (inWindow && !autoRunDoneRef.current && !isAutoRunning) {
        const toastId = toast.loading("Running driver docs expiry job…");
        try {
          const res = await runNow({ companyId, sendEmails: true }).unwrap();
          toast.update(toastId, {
            render: `Emails sent: ${res.emailsSent || 0} • Candidates: ${
              res.totalCandidates || 0
            }`,
            type: "success",
            isLoading: false,
            autoClose: 4000,
          });
        } catch (err) {
          toast.update(toastId, {
            render:
              "Auto run failed: " +
              (err?.data?.message || err?.message || "Unknown"),
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        } finally {
          autoRunDoneRef.current = true; // mark done for this window
        }
      }

      // if outside window -> reset so next window triggers again
      if (!inWindow) {
        autoRunDoneRef.current = false;
      }
    };

    // first immediate check
    tick();
    // check every minute
    const id = setInterval(tick, 60 * 1000);
    return () => clearInterval(id);
  }, [
    companyId,
    formData?.driverDocumentsExpiration?.enabled,
    formData?.driverDocumentsExpiration?.timing?.dailyTime,
    isAutoRunning,
    runNow,
  ]);
  // ---------------------------------------------------------

  if (!companyId) {
    return (
      <div>
        <OutletHeading name="Cron Job (Scheduled Tasks)" />
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
          <p className="text-red-500">
            Error: Company information not found. Please log in again.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <OutletHeading name="Cron Job (Scheduled Tasks)" />
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
          <p>Loading cron job settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <OutletHeading name="Cron Job (Scheduled Tasks)" />
      <div className="mt-10">
        {/* First Row - Auto Allocation & Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Auto Allocation Card */}
          <div className="border rounded overflow-hidden">
            <div className="bg-gray-700 text-white px-4 py-2 flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={formData.autoAllocation?.enabled || false}
                onChange={() => handleFeatureToggle("autoAllocation")}
                disabled={isToggling}
              />
              Auto Allocation
            </div>
            {formData.autoAllocation?.enabled && (
              <div className="p-4 space-y-4">
                <div className="flex flex-col gap-3">
                  <SelectOption
                    options={timeOptions.autoAllocationHours}
                    value={
                      getNestedValue(formData, "autoAllocation.timing.hours") ||
                      "0 hours"
                    }
                    onChange={handleSelectChange(
                      "autoAllocation",
                      "timing",
                      "hours"
                    )}
                  />
                  <SelectOption
                    options={["before pickup time"]}
                    value={
                      getNestedValue(
                        formData,
                        "autoAllocation.timing.period"
                      ) || "before pickup time"
                    }
                    onChange={handleSelectChange(
                      "autoAllocation",
                      "timing",
                      "period"
                    )}
                  />
                </div>
                <div className="flex gap-2">
                  <label className="text-sm flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={
                        getNestedValue(
                          formData,
                          "autoAllocation.notifications.sms"
                        ) || false
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          "autoAllocation",
                          "notifications",
                          e.target.checked,
                          "sms"
                        )
                      }
                    />
                    SMS
                  </label>
                  <label className="text-sm flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={
                        getNestedValue(
                          formData,
                          "autoAllocation.notifications.email"
                        ) || false
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          "autoAllocation",
                          "notifications",
                          e.target.checked,
                          "email"
                        )
                      }
                    />
                    Email
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Reviews Card */}
          <div className="border rounded overflow-hidden">
            <div className="bg-gray-700 text-white px-4 py-2 flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={formData.reviews?.enabled || false}
                onChange={() => handleFeatureToggle("reviews")}
                disabled={isToggling}
              />
              Reviews
            </div>
            {formData.reviews?.enabled && (
              <div className="p-4 space-y-4">
                <div className="flex flex-col gap-3">
                  <SelectOption
                    options={timeOptions.reviewHours}
                    value={
                      getNestedValue(formData, "reviews.timing.hours") ||
                      "1 hours"
                    }
                    onChange={handleSelectChange("reviews", "timing", "hours")}
                  />
                </div>
                <div className="flex gap-2">
                  <label className="text-sm flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={
                        getNestedValue(
                          formData,
                          "reviews.notifications.sms"
                        ) || false
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          "reviews",
                          "notifications",
                          e.target.checked,
                          "sms"
                        )
                      }
                    />
                    SMS
                  </label>
                  <label className="text-sm flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={
                        getNestedValue(
                          formData,
                          "reviews.notifications.email"
                        ) || false
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          "reviews",
                          "notifications",
                          e.target.checked,
                          "email"
                        )
                      }
                    />
                    Email
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Second Row - Driver Documents Expiration & Driver Statement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Driver Documents Expiration Card */}
          <div className="border rounded overflow-hidden">
            <div className="bg-gray-700 text-white px-4 py-2 flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={formData.driverDocumentsExpiration?.enabled || false}
                onChange={() => handleFeatureToggle("driverDocumentsExpiration")}
                disabled={isToggling}
              />
              Driver Documents Expiration
            </div>
            {formData.driverDocumentsExpiration?.enabled && (
              <div className="p-4 space-y-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-700 font-medium">Daily:</p>
                    <SelectOption
                      options={timeOptions.dailyTimes}
                      value={
                        getNestedValue(
                          formData,
                          "driverDocumentsExpiration.timing.dailyTime"
                        ) || "16:00 - 17:00"
                      }
                      onChange={handleSelectChange(
                        "driverDocumentsExpiration",
                        "timing",
                        "dailyTime"
                      )}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <label className="text-sm flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={
                        getNestedValue(
                          formData,
                          "driverDocumentsExpiration.notifications.sms"
                        ) || false
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          "driverDocumentsExpiration",
                          "notifications",
                          e.target.checked,
                          "sms"
                        )
                      }
                    />
                    SMS
                  </label>
                  <label className="text-sm flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={
                        getNestedValue(
                          formData,
                          "driverDocumentsExpiration.notifications.email"
                        ) || false
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          "driverDocumentsExpiration",
                          "notifications",
                          e.target.checked,
                          "email"
                        )
                      }
                    />
                    Email
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Driver Statement Card */}
          <div className="border rounded overflow-hidden">
            <div className="bg-gray-700 text-white px-4 py-2 flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={formData.driverStatement?.enabled || false}
                onChange={() => handleFeatureToggle("driverStatement")}
                disabled={isToggling}
              />
              Driver Statement
            </div>
            {formData.driverStatement?.enabled && (
              <div className="p-4 space-y-4">
                <div className="flex flex-col gap-3">
                  <SelectOption
                    options={timeOptions.frequencies}
                    value={
                      getNestedValue(
                        formData,
                        "driverStatement.timing.frequency"
                      ) || "Weekly"
                    }
                    onChange={handleSelectChange(
                      "driverStatement",
                      "timing",
                      "frequency"
                    )}
                  />
                  <SelectOption
                    options={timeOptions.weekDays}
                    value={
                      getNestedValue(formData, "driverStatement.timing.day") ||
                      "Monday"
                    }
                    onChange={handleSelectChange(
                      "driverStatement",
                      "timing",
                      "day"
                    )}
                  />
                  <SelectOption
                    options={timeOptions.dailyTimes}
                    value={
                      getNestedValue(formData, "driverStatement.timing.time") ||
                      "01:00 - 02:00"
                    }
                    onChange={handleSelectChange(
                      "driverStatement",
                      "timing",
                      "time"
                    )}
                  />
                </div>
                <div className="flex gap-2">
                  <label className="text-sm flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={
                        getNestedValue(
                          formData,
                          "driverStatement.notifications.sms"
                        ) || false
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          "driverStatement",
                          "notifications",
                          e.target.checked,
                          "sms"
                        )
                      }
                    />
                    SMS
                  </label>
                  <label className="text-sm flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={
                        getNestedValue(
                          formData,
                          "driverStatement.notifications.email"
                        ) || false
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          "driverStatement",
                          "notifications",
                          e.target.checked,
                          "email"
                        )
                      }
                    />
                    Email
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <button
            onClick={handleSubmit}
            className="btn btn-reset px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={isUpdating || isToggling}
          >
            {isUpdating ? "UPDATING..." : "UPDATE"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CronJob;
