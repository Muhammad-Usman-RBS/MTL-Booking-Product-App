import React, { useEffect, useState } from 'react';
import WidgetBooking from './WidgetBooking';
import WidgetBookingInformation from './WidgetBookingInformation';
import WidgetPaymentInformation from './WidgetPaymentInformation'; // ✅ Import

const WidgetMain = () => {
    const [step, setStep] = useState('form'); // form → vehicle → payment
    const [companyId, setCompanyId] = useState('');

    // ✅ Get company ID from URL query param
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const cid = params.get("company");
        if (cid) {
            setCompanyId(cid);
            localStorage.setItem("widgetCompanyId", cid); // Optional backup
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6">
            {step === 'form' && (
                <WidgetBooking
                    onSubmitSuccess={() => setStep('vehicle')}
                    companyId={companyId}
                />
            )}

            {step === 'vehicle' && (
                <WidgetBookingInformation
                    companyId={companyId}
                    onNext={() => setStep('payment')} // ✅ Pass to go next
                />
            )}

            {step === 'payment' && (
                <WidgetPaymentInformation
                    companyId={companyId}
                />
            )}
        </div>
    );
};

export default WidgetMain;
