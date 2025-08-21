import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import {
  useGetCronJobQuery,
  useUpdateCronJobByCompanyMutation,
  useToggleCronJobFeatureMutation
} from "../../../redux/api/cronJobsApi";
import DocumentExpiryTester from "./DocumentExpiryTester";

const CronJob = () => {
  // Get user and company info from your auth state
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const companyId = user?.companyId || '';
  const userId = user?._id || '';

  // RTK Query hooks
  const {
    data: cronJobData,
    isLoading,
    isError,
    refetch
  } = useGetCronJobQuery(companyId, {
    skip: !companyId
  });

  const [updateCronJobByCompany, { isLoading: isUpdating }] = useUpdateCronJobByCompanyMutation();
  const [toggleFeature, { isLoading: isToggling }] = useToggleCronJobFeatureMutation();

  // Local state for form data with proper default structure
  const [formData, setFormData] = useState({
    autoAllocation: {
      enabled: false,
      timing: {
        hours: "0 hours",
        period: "before pickup time"
      },
      notifications: {
        sms: false,
        email: true
      }
    },
    reviews: {
      enabled: true,
      timing: {
        hours: "1 hours"
      },
      notifications: {
        sms: false,
        email: true
      }
    },
    driverDocumentsExpiration: {
      enabled: false,
      timing: {
        dailyTime: "16:00 - 17:00"
      },
      notifications: {
        sms: false,
        email: false
      }
    },
    driverStatement: {
      enabled: false,
      timing: {
        frequency: "Weekly",
        day: "Monday",
        time: "01:00 - 02:00"
      },
      notifications: {
        sms: false,
        email: false
      }
    }
  });

  const timeOptions = {
    autoAllocationHours: [
      "0 hours",
      "1 hour",
      "2 hours",
      "3 hours",
      "4 hours",
      "5 hours",
      "6 hours",
      "12 hours",
      "24 hours"
    ],
    reviewHours: [
      "30 minutes",
      "1 hours",
      "2 hours",
      "3 hours",
      "4 hours",
      "6 hours",
      "12 hours",
      "24 hours"
    ],
    dailyTimes: [
      "00:00 - 01:00",
      "01:00 - 02:00",
      "02:00 - 03:00",
      "03:00 - 04:00",
      "04:00 - 05:00",
      "05:00 - 06:00",
      "06:00 - 07:00",
      "07:00 - 08:00",
      "08:00 - 09:00",
      "09:00 - 10:00",
      "10:00 - 11:00",
      "11:00 - 12:00",
      "12:00 - 13:00",
      "13:00 - 14:00",
      "14:00 - 15:00",
      "15:00 - 16:00",
      "16:00 - 17:00",
      "17:00 - 18:00",
      "18:00 - 19:00",
      "19:00 - 20:00",
      "20:00 - 21:00",
      "21:00 - 22:00",
      "22:00 - 23:00",
      "23:00 - 24:00"
    ],
    statementTimes: [
      "00:00 - 01:00",
      "01:00 - 02:00",
      "02:00 - 03:00",
      "03:00 - 04:00",
      "04:00 - 05:00",
      "05:00 - 06:00",
      "23:00 - 24:00"
    ],
    weekDays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ],
    frequencies: [
      "Daily",
      "Weekly",
      "Bi-weekly",
      "Monthly",
      "Quarterly"
    ]
  };

  // Helper function to ensure proper nested object structure
  const ensureNestedStructure = (data) => {
    const defaultStructure = {
      autoAllocation: {
        enabled: false,
        timing: { hours: "0 hours", period: "before pickup time" },
        notifications: { sms: false, email: true }
      },
      reviews: {
        enabled: true,
        timing: { hours: "1 hours" },
        notifications: { sms: false, email: true }
      },
      driverDocumentsExpiration: {
        enabled: false,
        timing: { dailyTime: "16:00 - 17:00" },
        notifications: { sms: false, email: false }
      },
      driverStatement: {
        enabled: false,
        timing: { frequency: "Weekly", day: "Monday", time: "01:00 - 02:00" },
        notifications: { sms: false, email: false }
      }
    };

    const result = { ...defaultStructure };

    // Merge with existing data while preserving structure
    Object.keys(result).forEach(section => {
      if (data[section]) {
        result[section] = {
          ...result[section],
          ...data[section],
          timing: {
            ...result[section].timing,
            ...(data[section].timing || {})
          },
          notifications: {
            ...result[section].notifications,
            ...(data[section].notifications || {})
          }
        };
      }
    });

    return result;
  };

  // Load data from API when component mounts or data changes
  useEffect(() => {
    if (cronJobData?.cronJob) {
      console.log('Loading cron job data:', cronJobData.cronJob);
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
        updatedBy: userId
      }).unwrap();

      // Update local state with response data
      if (response?.cronJob) {
        const structuredData = ensureNestedStructure(response.cronJob);
        setFormData(structuredData);
      } else {
        // Fallback: update local state directly
        setFormData(prev => ({
          ...prev,
          [feature]: {
            ...prev[feature],
            enabled: newEnabledState
          }
        }));
      }

      toast.success(`${feature} ${newEnabledState ? 'enabled' : 'disabled'} successfully!`);
    } catch (error) {
      console.error(`Failed to toggle ${feature}:`, error);
      toast.error(`Failed to toggle ${feature}: ${error?.data?.message || 'Unknown error'}`);
    }
  };

  // Handle form field changes with better error handling
  const handleFieldChange = (section, field, value, subField = null) => {
    // Extract clean value from various input types
    let cleanValue = value;
    if (value && typeof value === 'object') {
      if (value.target !== undefined) {
        // HTML input event
        cleanValue = value.target.type === 'checkbox' ? value.target.checked : value.target.value;
      } else if (value.value !== undefined) {
        // Select option object
        cleanValue = value.value;
      }
    }

    console.log('Field change:', { section, field, value: cleanValue, subField });

    setFormData(prev => {
      const newData = { ...prev };

      // Ensure section exists
      if (!newData[section]) {
        newData[section] = {};
      }

      if (subField) {
        // Ensure nested field exists
        if (!newData[section][field]) {
          newData[section][field] = {};
        }
        newData[section][field] = {
          ...newData[section][field],
          [subField]: cleanValue
        };
      } else {
        newData[section][field] = cleanValue;
      }

      return newData;
    });
  };

  // Handle form submission with better validation
  const handleSubmit = async () => {
    if (!companyId || !userId) {
      toast.error("Missing company or user information");
      return;
    }

    try {
      console.log('Submitting form data:', formData);

      // Ensure all required nested structures exist
      const cleanFormData = ensureNestedStructure(formData);

      const response = await updateCronJobByCompany({
        companyId,
        ...cleanFormData,
        updatedBy: userId
      }).unwrap();

      console.log('Update response:', response);

      if (response?.cronJob) {
        const structuredData = ensureNestedStructure(response.cronJob);
        setFormData(structuredData);
      }

      toast.success("Cron job settings updated successfully!");
      refetch(); // Refresh data
    } catch (error) {
      console.error('Update error:', error);
      toast.error(`Failed to update settings: ${error?.data?.message || 'Unknown error'}`);
    }
  };

  // Helper function to handle select changes safely
  const handleSelectChange = (section, field, subField = null) => {
    return (selectedValue) => {
      console.log(`Select change for ${section}.${field}${subField ? `.${subField}` : ''}:`, selectedValue);
      handleFieldChange(section, field, selectedValue, subField);
    };
  };

  // Helper function to safely get nested values
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : '';
    }, obj);
  };

  if (!companyId) {
    return (
      <div>
        <OutletHeading name="Cron Job (Scheduled Tasks)" />
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
          <p className="text-red-500">Error: Company information not found. Please log in again.</p>
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
                onChange={() => handleFeatureToggle('autoAllocation')}
                disabled={isToggling}
              />
              Auto Allocation
            </div>
            {formData.autoAllocation?.enabled && (
              <div className="p-4 space-y-4">
                <div className="flex flex-col gap-3">
                  <SelectOption
                    options={timeOptions.autoAllocationHours}
                    value={getNestedValue(formData, 'autoAllocation.timing.hours') || "0 hours"}
                    onChange={handleSelectChange('autoAllocation', 'timing', 'hours')}
                  />
                  <SelectOption
                    options={["before pickup time", "after pickup time"]}
                    value={getNestedValue(formData, 'autoAllocation.timing.period') || "before pickup time"}
                    onChange={handleSelectChange('autoAllocation', 'timing', 'period')}
                  />
                </div>
                <div className="flex gap-2">
                  <label className="text-sm flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={getNestedValue(formData, 'autoAllocation.notifications.sms') || false}
                      onChange={(e) => handleFieldChange('autoAllocation', 'notifications', e.target.checked, 'sms')}
                    />
                    SMS
                  </label>
                  <label className="text-sm flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={getNestedValue(formData, 'autoAllocation.notifications.email') || false}
                      onChange={(e) => handleFieldChange('autoAllocation', 'notifications', e.target.checked, 'email')}
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
                onChange={() => handleFeatureToggle('reviews')}
                disabled={isToggling}
              />
              Reviews
            </div>
            {formData.reviews?.enabled && (
              <div className="p-4 space-y-4">
                <div className="flex flex-col gap-3">
                  <SelectOption
                    options={timeOptions.reviewHours}
                    value={getNestedValue(formData, 'reviews.timing.hours') || "1 hours"}
                    onChange={handleSelectChange('reviews', 'timing', 'hours')}
                  />
                </div>
                <div className="flex gap-2">
                  <label className="text-sm flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={getNestedValue(formData, 'reviews.notifications.sms') || false}
                      onChange={(e) => handleFieldChange('reviews', 'notifications', e.target.checked, 'sms')}
                    />
                    SMS
                  </label>
                  <label className="text-sm flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={getNestedValue(formData, 'reviews.notifications.email') || false}
                      onChange={(e) => handleFieldChange('reviews', 'notifications', e.target.checked, 'email')}
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
                onChange={() => handleFeatureToggle('driverDocumentsExpiration')}
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
                      value={getNestedValue(formData, 'driverDocumentsExpiration.timing.dailyTime') || "16:00 - 17:00"}
                      onChange={handleSelectChange('driverDocumentsExpiration', 'timing', 'dailyTime')}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <label className="text-sm flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={getNestedValue(formData, 'driverDocumentsExpiration.notifications.sms') || false}
                      onChange={(e) => handleFieldChange('driverDocumentsExpiration', 'notifications', e.target.checked, 'sms')}
                    />
                    SMS
                  </label>
                  <label className="text-sm flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={getNestedValue(formData, 'driverDocumentsExpiration.notifications.email') || false}
                      onChange={(e) => handleFieldChange('driverDocumentsExpiration', 'notifications', e.target.checked, 'email')}
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
                onChange={() => handleFeatureToggle('driverStatement')}
                disabled={isToggling}
              />
              Driver Statement
            </div>
            {formData.driverStatement?.enabled && (
              <div className="p-4 space-y-4">
                <div className="flex flex-col gap-3">
                  <SelectOption
                    options={timeOptions.frequencies}
                    value={getNestedValue(formData, 'driverStatement.timing.frequency') || "Weekly"}
                    onChange={handleSelectChange('driverStatement', 'timing', 'frequency')}
                  />
                  <SelectOption
                    options={timeOptions.weekDays}
                    value={getNestedValue(formData, 'driverStatement.timing.day') || "Monday"}
                    onChange={handleSelectChange('driverStatement', 'timing', 'day')}
                  />
                  <SelectOption
                    options={timeOptions.statementTimes}
                    value={getNestedValue(formData, 'driverStatement.timing.time') || "01:00 - 02:00"}
                    onChange={handleSelectChange('driverStatement', 'timing', 'time')}
                  />
                </div>
                <div className="flex gap-2">
                  <label className="text-sm flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={getNestedValue(formData, 'driverStatement.notifications.sms') || false}
                      onChange={(e) => handleFieldChange('driverStatement', 'notifications', e.target.checked, 'sms')}
                    />
                    SMS
                  </label>
                  <label className="text-sm flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={getNestedValue(formData, 'driverStatement.notifications.email') || false}
                      onChange={(e) => handleFieldChange('driverStatement', 'notifications', e.target.checked, 'email')}
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
            {isUpdating ? 'UPDATING...' : 'UPDATE'}
          </button>
        </div>
        <DocumentExpiryTester />
      </div>
    </div>
  );
};

export default CronJob;