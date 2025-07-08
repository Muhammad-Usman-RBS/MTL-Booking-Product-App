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
            const isPrimaryHourly = formData.booking?.mode === "Hourly";
            const isReturnHourly = formData.booking?.returnBooking?.mode === "Hourly";

            const primaryJourney = {
                ...formData.booking,
                fare: finalPayload.fare || 0,
                hourlyOption: isPrimaryHourly ? formData.booking?.hourlyOption : null,
                pickup: formData.booking?.pickup || "",
                dropoff: formData.booking?.dropoff || "",
                date: formData.booking?.date || "",
                hour: formData.booking?.hour || "",
                minute: formData.booking?.minute || "",
            };

            let returnJourney = null;

            const returnData = formData.booking?.returnBooking;

            const requiredFields = ["pickup", "dropoff", "date", "hour", "minute"];
            const isReturnValid =
                formData.booking?.returnJourneyToggle &&
                returnData &&
                requiredFields.every((field) => {
                    const value = returnData[field] ?? "";
                    return typeof value === "string" ? value.trim() !== "" : value !== null && value !== undefined;
                });

            if (isReturnValid) {
                returnJourney = {
                    ...returnData,
                    fare: finalPayload.returnBooking?.fare || 0,
                    hourlyOption: isReturnHourly ? returnData?.hourlyOption : null,
                    pickup: returnData?.pickup || "",
                    dropoff: returnData?.dropoff || "",
                    date: returnData?.date || "",
                    hour: returnData?.hour || "",
                    minute: returnData?.minute || "",
                    notes: `(Return Journey) ${returnData?.notes || ""}`,
                };
            } else {
                console.warn("⚠️ Return journey missing required fields", returnData);
            }

            const payload = {
                companyId,
                source: "widget",
                referrer: document.referrer || "Widget",
                vehicle: formData.vehicle,
                passenger: finalPayload.passengerDetails || {},
                voucher: finalPayload.voucher,
                voucherApplied: !!finalPayload.voucher,
                PassengerEmail: finalPayload?.passengerDetails?.email || "",
                returnJourneyToggle: formData.booking?.returnJourneyToggle ?? false,
                mode: formData.booking?.mode || "Transfer",
                primaryJourney,
                ...(returnJourney ? { returnJourney } : {}),
            };

            console.log("🚀 Final Payload to send:", payload);
            console.log("🛩️ Final formData.booking.returnBooking", formData.booking?.returnBooking);

            await createBooking(payload).unwrap();
            setStep("success");
        } catch (err) {
            console.error("❌ Booking save failed:", err);
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
                        if (data.returnBooking) {
                            handleDataChange('booking', {
                                returnJourneyToggle: true,
                                returnBooking: data.returnBooking,
                            });
                        } else {
                            handleDataChange('booking', data);
                        }
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
                    onNext={({ totalPrice, selectedCar, returnJourneyToggle, returnBooking }) => {
                        handleDataChange('pricing', { totalPrice });
                        handleDataChange('vehicle', selectedCar);

                        handleDataChange('booking', {
                            ...formData.booking,
                            returnJourneyToggle,
                            vehicle: selectedCar,
                            returnBooking: returnJourneyToggle ? returnBooking : null,
                        });

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
                    onBookNow={({ passengerDetails, voucher }) => {
                        const finalPayload = {
                            companyId,
                            referrer: window.location.href,
                            mode: formData.booking?.mode || "Transfer",
                            returnJourneyToggle: formData.booking?.returnJourneyToggle || false,
                            primaryJourney: formData.booking,
                            returnJourney: formData.booking?.returnJourneyToggle
                                ? formData.booking?.returnBooking
                                : undefined,
                            vehicle: formData.vehicle,
                            passenger: passengerDetails,
                            PassengerEmail: passengerDetails.email,
                            voucher,
                            voucherApplied: !!voucher,
                        };

                        handleBookingSubmission(finalPayload);
                    }}
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
