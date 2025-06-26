import React, { useEffect, useState } from 'react';
import WidgetBooking from './WidgetBooking';
import WidgetBookingInformation from './WidgetBookingInformation';
import WidgetPaymentInformation from './WidgetPaymentInformation';
import { useCreateBookingMutation } from '../../../redux/api/bookingApi';

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

    const [createBooking] = useCreateBookingMutation();

    const handleStepChange = (targetStep) => {
        setStep(targetStep);
    };

    const handleDataChange = (section, data) => {
        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section], ...data }
        }));
    };

    const handleBookingSubmission = async (finalPayload) => {
        try {
            const result = await createBooking({
                returnJourneyToggle: false,
                companyId,
                mode: formData.booking?.mode || "Transfer",
                referrer: document.referrer || "Widget",
                vehicle: finalPayload.selectedVehicle,
                fare: finalPayload.fare || 0,
                hourlyOption: formData.booking?.hourlyOption || null,
                passenger: finalPayload.passengerDetails || {},
                primaryJourney: {
                    ...formData.booking,
                    fare: finalPayload.fare || 0,
                    hourlyOption: formData.booking?.hourlyOption || null,
                },
                PassengerEmail: finalPayload?.passengerDetails?.email || "",
            }).unwrap();

            console.log("Booking saved to MongoDB:", result);
            setStep("success");
        } catch (err) {
            console.error("Booking save failed:", err);
            setError("Failed to save booking. Please try again.");
        }
    };

    useEffect(() => {
        const queryParam = new URLSearchParams(window.location.search);
        const company = queryParam.get("company");
        if (company) setCompanyId(company);
    }, []);

    if (error) {
        return <div className="text-center text-red-600">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6">
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
                    totalPrice={formData.pricing.totalPrice}
                    postcodePrice={formData.pricing.postcodePrice}
                    dropOffPrice={formData.pricing.dropOffPrice}
                    onNext={({ totalPrice, selectedCar }) => {
                        handleDataChange('pricing', { totalPrice });
                        handleDataChange('vehicle', selectedCar);
                        handleStepChange('payment');
                    }}
                />
            )}

            {step === 'payment' && (
                <WidgetPaymentInformation
                    companyId={companyId}
                    fare={formData.pricing.totalPrice}
                    vehicle={formData.vehicle}
                    booking={formData.booking}
                    onBookNow={handleBookingSubmission}
                />
            )}

            {step === 'success' && (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-green-600">Booking Successful!</h2>
                    <p className="mt-4 text-gray-600">Thank you for booking with us.</p>
                </div>
            )}
        </div>
    );
};

export default WidgetMain;
