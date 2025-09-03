import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import PaymentMethodSection from "./PaymentMethodSection";
import {
  useGetAllPaymentOptionsQuery,
  useCreateOrUpdatePaymentOptionMutation,
} from "../../../redux/api/paymentOptionsApi";
import { useSelector } from "react-redux";

const PaymentOptions = () => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;

  // API hooks
  const {
    data: paymentOptionsData,
    isLoading,
    error,
    refetch,
  } = useGetAllPaymentOptionsQuery(companyId);

  const [createOrUpdatePaymentOption, { isLoading: isUpdating }] =
    useCreateOrUpdatePaymentOptionMutation();

  // State for each payment method
  const [paymentStates, setPaymentStates] = useState({
    cash: { checked: false, isLive: false, settings: {} },
    paypal: { checked: false, isLive: false, settings: {} },
    stripe: { checked: false, isLive: false, settings: {} },
    invoice: { checked: false, isLive: false, settings: {} },
    paymentLink: { checked: false, isLive: false, settings: {} },
  });

  // Load payment options from API
  useEffect(() => {
    if (paymentOptionsData?.paymentOptions) {
      const newStates = { ...paymentStates };

      paymentOptionsData.paymentOptions.forEach((option) => {
        if (newStates[option.paymentMethod]) {
          newStates[option.paymentMethod] = {
            checked: option.isEnabled,
            isLive: option.isLive,
            settings: option.settings || {},
            id: option._id,
            title: option.title,
          };
        }
      });

      setPaymentStates(newStates);
    }
  }, [paymentOptionsData]);

  // Update payment method state
  const updatePaymentState = (method, updates) => {
    setPaymentStates(prev => ({
      ...prev,
      [method]: { ...prev[method], ...updates }
    }));
  };

  // Handle save/update
  const handleUpdateSettings = async () => {
    try {
      const promises = Object.entries(paymentStates).map(([method, state]) => {
        const paymentData = {
          companyId,
          paymentMethod: method,
          isEnabled: state.checked,
          isLive: state.isLive,
          title: state.title || getDefaultTitle(method),
          settings: state.settings,
        };

        return createOrUpdatePaymentOption(paymentData);
      });

      await Promise.all(promises);
      toast.success("Payment options updated successfully!");
      refetch();
    } catch (error) {
      console.error("Error updating payment options:", error);
      toast.error("Failed to update payment options");
    }
  };

  // Get default title for payment method
  const getDefaultTitle = (method) => {
    const titles = {
      cash: "Cash",
      paypal: "Pay Via PayPal",
      stripe: "Pay Via Debit/Credit Card",
      invoice: "Pay Via Invoice",
      paymentLink: "Pay Via Payment Link",
    };
    return titles[method] || method.charAt(0).toUpperCase() + method.slice(1);
  };

  // Get fields configuration for each payment method
  const getFieldsConfig = (method, settings = {}) => {
    const configs = {
      cash: [{ label: "Title", value: getDefaultTitle(method) }],

      paypal: [
        { label: "Title", value: getDefaultTitle(method) },
        { label: "Client ID", value: settings.clientId || "" },
        { label: "Client Secret", value: settings.clientSecret || "" },
      ],

      stripe: [
        { label: "Title", value: getDefaultTitle(method) },
        { label: "Publishable Key", value: settings.publishableKey || "" },
        { label: "Secret Key", value: settings.secretKey || "" },
        {
          label: "Webhook Endpoint URL",
          value: settings.webhookEndpointUrl || "https://yourdomain.com/api/stripe/webhook",
          copyable: true,
        },
        {
          label: "Webhook Events",
          value: settings.webhookEvents || "checkout.session.completed, payment_intent.succeeded",
          copyable: true,
        },
        { label: "Webhook Signing Secret", value: settings.webhookSigningSecret || "" },
      ],

      invoice: [
        { label: "Title", value: getDefaultTitle(method) },
        { label: "Invoice Prefix", value: settings.invoicePrefix || "INV-" },
        { label: "Invoice Email Template", value: settings.invoiceEmailTemplate || "" },
        { label: "Due Days", value: settings.dueDays || "30" },
        { label: "Late Fee Percentage", value: settings.lateFeePercentage || "5" },
        {
          label: "Auto Reminder Days",
          value: settings.autoReminderDays || "7, 14, 21",
          copyable: true,
        },
      ],

      paymentLink: [
        { label: "Title", value: getDefaultTitle(method) },
        { label: "Link Expiry Hours", value: settings.linkExpiryHours || "24" },
        { label: "Success Redirect URL", value: settings.successRedirectUrl || "" },
        { label: "Failure Redirect URL", value: settings.failureRedirectUrl || "" },
        {
          label: "Payment Link Template",
          value: settings.paymentLinkTemplate || "https://yourdomain.com/pay/{linkId}",
          copyable: true,
        },
        { label: "SMS Template", value: settings.smsTemplate || "" },
      ],
    };

    return configs[method] || [{ label: "Title", value: getDefaultTitle(method) }];
  };

  if (isLoading) return <div className="p-8">Loading payment options...</div>;
  if (error) return <div className="p-8 text-red-600">Error loading payment options</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full space-y-8">
        <OutletHeading name="Payment Options" />

        <div className="space-y-6">
          {Object.entries(paymentStates).map(([method, state]) => (
            <PaymentMethodSection
              key={method}
              name={method.charAt(0).toUpperCase() + method.slice(1)}
              checked={state.checked}
              setChecked={(checked) => updatePaymentState(method, { checked })}
              isLive={state.isLive}
              toggleLive={() => updatePaymentState(method, { isLive: !state.isLive })}
              fields={getFieldsConfig(method, state.settings)}
              onFieldChange={(fieldLabel, value) => {
                const newSettings = { ...state.settings };
                // Convert field label to settings key (you may need to adjust this mapping)
                const settingsKey = fieldLabel.toLowerCase().replace(/\s+/g, '');
                newSettings[settingsKey] = value;
                updatePaymentState(method, { settings: newSettings });
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-center pt-8">
          <button
            onClick={handleUpdateSettings}
            disabled={isUpdating}
            className={`btn btn-edit ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isUpdating ? "Updating..." : "Update Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptions;