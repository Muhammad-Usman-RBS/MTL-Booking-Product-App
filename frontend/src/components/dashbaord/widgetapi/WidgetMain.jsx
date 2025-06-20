import React, { useEffect, useState } from 'react';
import WidgetBooking from './WidgetBooking';
import WidgetBookingInformation from './WidgetBookingInformation';
import WidgetPaymentInformation from './WidgetPaymentInformation';

const WidgetMain = () => {
    const [step, setStep] = useState('form');
    const [companyId, setCompanyId] = useState('');
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        booking: {},
        vehicle: {},
        payment: {},
        pricing: {}
    });

    const handleStepChange = (targetStep) => {
        setStep(targetStep);
    };

    const handleDataChange = (section, data) => {
        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section], ...data }
        }));
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6">
            {/* Dynamic Rendering */}
            {step === 'form' && (
                <WidgetBooking
                    companyId={companyId}
                    data={formData.booking}
                  onSubmitSuccess={(data) => {
  handleDataChange('booking', data);
  handleDataChange('pricing', {
    dropOffPrice: data.dropOffPrice || 0
  });
  handleStepChange('vehicle');
}}
                    onChange={(data) => handleDataChange('booking', data)}
                    onCheckedPriceFound={(matchedPrice) => {
                        handleDataChange('pricing', matchedPrice);
                    }}
                />
            )}

            {step === 'vehicle' && (
                <WidgetBookingInformation
                    companyId={companyId}
                    totalPrice={formData.pricing.totalPrice}  // Pass total price here
                    postcodePrice={formData.pricing.postcodePrice}  // Pass postcode price here
                    dropOffPrice={formData.pricing.dropOffPrice}  // Pass drop-off price here
                    onNext={() => handleStepChange('payment')}
                />
            )}

            {/* Other steps */}
        </div>
    );
};

export default WidgetMain;
