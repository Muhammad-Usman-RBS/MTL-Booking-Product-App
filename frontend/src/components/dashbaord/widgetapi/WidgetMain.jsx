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
                hourlyOption: formData.booking?.hourlyOption || null,
                passenger: finalPayload.passengerDetails || {},
                voucher: finalPayload.voucher,
                voucherApplied: !!finalPayload.voucher,
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
                <div className="flex items-center justify-center min-h-screen bg-green-50">
                    <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full border border-green-200">
                        <div className="mb-6">
                            <svg
                                className="mx-auto h-16 w-16 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4.5 12.75l6 6 9-13.5"
                                />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-extrabold text-green-700">Booking Confirmed!</h2>
                        <p className="mt-4 text-gray-600 text-base">
                            Thank you for choosing us. We’ve received your booking and will contact you shortly.
                        </p>
                        <div className="mt-6">
                            <a
                                href="/"
                                className="inline-block px-6 py-3 text-white bg-green-600 hover:bg-green-700 rounded-full font-medium transition"
                            >
                                Return to Home
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WidgetMain;
