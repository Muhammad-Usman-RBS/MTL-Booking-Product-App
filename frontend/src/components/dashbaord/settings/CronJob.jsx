import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import {
  useGetCronJobQuery,
  useUpdateCronJobByCompanyMutation,
  useToggleCronJobFeatureMutation
} from "../../../redux/api/cronJobsApi";

const CronJob = () => {
  // Get user and company info from your auth state
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const companyId = user?.companyId || ''; // Adjust according to your user structure
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

  // Local state for form data
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

  // Define time options arrays for better organization
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

  // Load data from API when component mounts or data changes
  useEffect(() => {
    if (cronJobData?.cronJob) {
      setFormData({
        autoAllocation: cronJobData.cronJob.autoAllocation,
        reviews: cronJobData.cronJob.reviews,
        driverDocumentsExpiration: cronJobData.cronJob.driverDocumentsExpiration,
        driverStatement: cronJobData.cronJob.driverStatement
      });
    }
  }, [cronJobData]);

  // Handle toggle for main feature switches
  const handleFeatureToggle = async (feature) => {
    const newEnabledState = !formData[feature].enabled;
    
    try {
      await toggleFeature({
        companyId,
        feature,
        enabled: newEnabledState,
        updatedBy: userId
      }).unwrap();

      // Update local state
      setFormData(prev => ({
        ...prev,
        [feature]: {
          ...prev[feature],
          enabled: newEnabledState
        }
      }));

      toast.success(`${feature} ${newEnabledState ? 'enabled' : 'disabled'} successfully!`);
    } catch (error) {
      toast.error(`Failed to toggle ${feature}: ${error?.data?.message || 'Unknown error'}`);
    }
  };

  // Handle form field changes - FIXED to handle dropdown values properly
  const handleFieldChange = (section, field, value, subField = null) => {
    // Ensure we're working with plain values, not HTML elements
    let cleanValue = value;
    if (value && typeof value === 'object' && value.target) {
      // If it's an event object, extract the value
      cleanValue = value.target.value;
    } else if (value && typeof value === 'object' && value.value) {
      // If it's an option object with a value property
      cleanValue = value.value;
    }

    console.log('Field change:', { section, field, value: cleanValue, subField }); // Debug log

    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: subField ? {
          ...prev[section][field],
          [subField]: cleanValue
        } : cleanValue
      }
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!companyId || !userId) {
      toast.error("Missing company or user information");
      return;
    }

    try {
      // Create a clean copy of formData without any circular references
      const cleanFormData = {
        autoAllocation: {
          enabled: formData.autoAllocation.enabled,
          timing: {
            hours: formData.autoAllocation.timing.hours,
            period: formData.autoAllocation.timing.period
          },
          notifications: {
            sms: formData.autoAllocation.notifications.sms,
            email: formData.autoAllocation.notifications.email
          }
        },
        reviews: {
          enabled: formData.reviews.enabled,
          timing: {
            hours: formData.reviews.timing.hours
          },
          notifications: {
            sms: formData.reviews.notifications.sms,
            email: formData.reviews.notifications.email
          }
        },
        driverDocumentsExpiration: {
          enabled: formData.driverDocumentsExpiration.enabled,
          timing: {
            dailyTime: formData.driverDocumentsExpiration.timing.dailyTime
          },
          notifications: {
            sms: formData.driverDocumentsExpiration.notifications.sms,
            email: formData.driverDocumentsExpiration.notifications.email
          }
        },
        driverStatement: {
          enabled: formData.driverStatement.enabled,
          timing: {
            frequency: formData.driverStatement.timing.frequency,
            day: formData.driverStatement.timing.day,
            time: formData.driverStatement.timing.time
          },
          notifications: {
            sms: formData.driverStatement.notifications.sms,
            email: formData.driverStatement.notifications.email
          }
        }
      };

      console.log('Submitting clean form data:', cleanFormData); // Debug log

      await updateCronJobByCompany({
        companyId,
        ...cleanFormData,
        updatedBy: userId
      }).unwrap();

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
      // Extract the actual string value from whatever is passed
      let value = selectedValue;
      if (typeof selectedValue === 'object') {
        if (selectedValue.target) {
          value = selectedValue.target.value;
        } else if (selectedValue.value) {
          value = selectedValue.value;
        } else {
          // Try to convert object to string
          value = String(selectedValue);
        }
      }
      
      console.log(`Select change for ${section}.${field}${subField ? `.${subField}` : ''}:`, value);
      handleFieldChange(section, field, value, subField);
    };
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
                checked={formData.autoAllocation.enabled}
                onChange={() => handleFeatureToggle('autoAllocation')}
                disabled={isToggling}
              />
              Auto Allocation
            </div>
            {formData.autoAllocation.enabled && (
              <div className="p-4 space-y-4">
                <div className="flex flex-col gap-3">
                  <SelectOption
                    options={timeOptions.autoAllocationHours}
                    value={formData.autoAllocation.timing.hours}
                    onChange={handleSelectChange('autoAllocation', 'timing', 'hours')}
                  />
                  <SelectOption
                    options={["before pickup time", "after pickup time"]}
                    value={formData.autoAllocation.timing.period}
                    onChange={handleSelectChange('autoAllocation', 'timing', 'period')}
                  />
                </div>
                <div className="flex gap-2">
                  <label className="text-sm flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={formData.autoAllocation.notifications.sms}
                      onChange={(e) => handleFieldChange('autoAllocation', 'notifications', e.target.checked, 'sms')}
                    /> 
                    SMS
                  </label>
                  <label className="text-sm flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={formData.autoAllocation.notifications.email}
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
                checked={formData.reviews.enabled}
                onChange={() => handleFeatureToggle('reviews')}
                disabled={isToggling}
              />
              Reviews
            </div>
            {formData.reviews.enabled && (
              <div className="p-4 space-y-4">
                <div className="flex flex-col gap-3">
                  <SelectOption
                    options={timeOptions.reviewHours}
                    value={formData.reviews.timing.hours}
                    onChange={handleSelectChange('reviews', 'timing', 'hours')}
                  />
                </div>
                <div className="flex gap-2">
                  <label className="text-sm flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={formData.reviews.notifications.sms}
                      onChange={(e) => handleFieldChange('reviews', 'notifications', e.target.checked, 'sms')}
                    /> 
                    SMS
                  </label>
                  <label className="text-sm flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={formData.reviews.notifications.email}
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
                checked={formData.driverDocumentsExpiration.enabled}
                onChange={() => handleFeatureToggle('driverDocumentsExpiration')}
                disabled={isToggling}
              />
              Driver Documents Expiration
            </div>
            {formData.driverDocumentsExpiration.enabled && (
              <div className="p-4 space-y-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-700 font-medium">Daily:</p>
                    <SelectOption
                      options={timeOptions.dailyTimes}
                      value={formData.driverDocumentsExpiration.timing.dailyTime}
                      onChange={handleSelectChange('driverDocumentsExpiration', 'timing', 'dailyTime')}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <label className="text-sm flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={formData.driverDocumentsExpiration.notifications.sms}
                      onChange={(e) => handleFieldChange('driverDocumentsExpiration', 'notifications', e.target.checked, 'sms')}
                    /> 
                    SMS
                  </label>
                  <label className="text-sm flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={formData.driverDocumentsExpiration.notifications.email}
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
                checked={formData.driverStatement.enabled}
                onChange={() => handleFeatureToggle('driverStatement')}
                disabled={isToggling}
              />
              Driver Statement
            </div>
            {formData.driverStatement.enabled && (
              <div className="p-4 space-y-4">
                <div className="flex flex-col gap-3">
                  <SelectOption 
                    options={timeOptions.frequencies} 
                    value={formData.driverStatement.timing.frequency}
                    onChange={handleSelectChange('driverStatement', 'timing', 'frequency')}
                  />
                  <SelectOption 
                    options={timeOptions.weekDays} 
                    value={formData.driverStatement.timing.day}
                    onChange={handleSelectChange('driverStatement', 'timing', 'day')}
                  />
                  <SelectOption
                    options={timeOptions.statementTimes}
                    value={formData.driverStatement.timing.time}
                    onChange={handleSelectChange('driverStatement', 'timing', 'time')}
                  />
                </div>
                <div className="flex gap-2">
                  <label className="text-sm flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={formData.driverStatement.notifications.sms}
                      onChange={(e) => handleFieldChange('driverStatement', 'notifications', e.target.checked, 'sms')}
                    /> 
                    SMS
                  </label>
                  <label className="text-sm flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={formData.driverStatement.notifications.email}
                      onChange={(e) => handleFieldChange('driverStatement', 'notifications', e.target.checked, 'email')}
                    /> 
                    Email
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={handleSubmit}
            className="btn btn-reset px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={isUpdating || isToggling}
          >
            {isUpdating ? 'UPDATING...' : 'UPDATE'}
          </button>
        </div>
    </div>
  );
};

export default CronJob;