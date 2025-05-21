import React, { useEffect, useState } from 'react';
import WidgetBooking from './WidgetBooking';
import WidgetBookingInformation from './WidgetBookingInformation';

const WidgetMain = () => {
    const [step, setStep] = useState('form'); // 'form' or 'vehicle'
    const [companyId, setCompanyId] = useState('');

    // Get company ID from query params once
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
            {step === 'form' ? (
                <WidgetBooking
                    onSubmitSuccess={() => setStep('vehicle')}
                    companyId={companyId}
                />
            ) : (
                <WidgetBookingInformation companyId={companyId} />
            )}
        </div>
    );
};

export default WidgetMain;
