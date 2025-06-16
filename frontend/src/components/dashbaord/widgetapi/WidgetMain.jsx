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

    useEffect(() => {
        resetForm();

        // ✅ Extract companyId from iframe URL query param
        const params = new URLSearchParams(window.location.search);
        const cid = params.get("company");

        if (!cid) {
            console.error("Missing companyId in URL parameters.");
            setError("Missing companyId. Please embed iframe with ?company=xxxxx");
            return;
        }

        setCompanyId(cid);
    }, []);

    const resetForm = () => {
        setFormData({
            booking: {},
            vehicle: {},
            payment: {},
            pricing: {}
        });
        setStep('form');
    };

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
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-600 font-semibold">
                {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6">
            {/* Navigation Tabs */}
            <div className="flex justify-center mb-8">
                <div className="inline-flex bg-white rounded-lg shadow-md p-1">
                    {['form', 'vehicle', 'payment'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleStepChange(tab)}
                            className={`px-6 py-2 rounded-lg transition-all text-sm font-medium 
                            ${step === tab ? 'bg-amber-500 text-white shadow' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Dynamic Rendering */}
            {step === 'form' && (
                <WidgetBooking
                    companyId={companyId}
                    data={formData.booking}
                    onSubmitSuccess={(data) => {
                        handleDataChange('booking', data);
                        handleStepChange('vehicle');
                    }}
                    onChange={(data) => handleDataChange('booking', data)}
                    onCheckedPriceFound={(matchedPrice) => {
                        console.log("Matched Price Found:", matchedPrice);
                        handleDataChange('pricing', matchedPrice);
                    }}
                />
            )}

            {step === 'vehicle' && (
                <WidgetBookingInformation
                    companyId={companyId}
                    bookingData={formData.booking}
                    vehicleData={formData.vehicle}
                    pricingData={formData.pricing}
                    onNext={(data) => {
                        handleDataChange('vehicle', data);
                        handleStepChange('payment');
                    }}
                    onBack={() => handleStepChange('form')}
                    onChange={(data) => handleDataChange('vehicle', data)}
                />
            )}

            {step === 'payment' && (
                <WidgetPaymentInformation
                    companyId={companyId}
                    data={formData.payment}
                    pricingData={formData.pricing}
                    onBack={() => handleStepChange('vehicle')}
                    onChange={(data) => handleDataChange('payment', data)}
                />
            )}
        </div>
    );
};

export default WidgetMain;
