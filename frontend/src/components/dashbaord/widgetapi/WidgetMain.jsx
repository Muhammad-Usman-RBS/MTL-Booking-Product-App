import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import WidgetBooking from './WidgetBooking';
import WidgetBookingInformation from './WidgetBookingInformation';
import WidgetPaymentInformation from './WidgetPaymentInformation';
import { useCreateBookingMutation } from '../../../redux/api/bookingApi';

const WidgetMain = () => {
    const navigate = useNavigate();

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

    // Stripe Payment Method
    // ⬇️ Replace your Stripe useEffect with this one
    useEffect(() => {
        const sp = new URLSearchParams(window.location.search);
        const sid = sp.get("session_id");
        if (!sid) return;

        const payloadStr = localStorage.getItem("pendingStripeBookingPayload");
        if (!payloadStr) {
            setError("Missing pending booking data after Stripe payment.");
            return;
        }

        const payload = JSON.parse(payloadStr);
        // Stripe reference attach kar do (helpful for audit)
        payload.stripe = { checkoutSessionId: sid };
        // paymentMethod already "Card, Bank" set kiya tha

        (async () => {
            try {
                // (Optional but recommended): yahan backend par sid verify bhi kara sakte ho
                // e.g. await verifyStripeSession(sid) — agar tumhare paas endpoint ho.

                await createBooking(payload).unwrap();

                // cleanup
                localStorage.removeItem("pendingStripeBookingPayload");

                // URL saaf
                const url = new URL(window.location.href);
                url.searchParams.delete("session_id");
                window.history.replaceState({}, "", url.toString());

                // success step
                localStorage.setItem("isWidgetFormFilled", "true");
                setStep("success");
            } catch (e) {
                setError("Failed to save booking after Stripe payment.");
            }
        })();
    }, [createBooking]);

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
                // fare: formData.pricing.totalPrice / 2 || 0,
                fare: formData.booking?.returnJourneyToggle
                    ? formData.pricing.totalPrice / 2
                    : formData.pricing.totalPrice,
                hourlyOption: isPrimaryHourly ? formData.booking?.hourlyOption : null,
                pickup: formData.booking?.pickup || "",
                dropoff: formData.booking?.dropoff || "",
                date: formData.booking?.date || "",
                hour: formData.booking?.hour || "",
                minute: formData.booking?.minute || "",
            };

            const returnData = formData.booking?.returnBooking;
            const requiredFields = ["pickup", "dropoff", "date", "hour", "minute"];
            const isReturnValid =
                formData.booking?.returnJourneyToggle &&
                returnData &&
                requiredFields.every((field) => {
                    const value = returnData[field] ?? "";
                    return typeof value === "string" ? value.trim() !== "" : value !== null && value !== undefined;
                });

            // Submit Primary Journey as first booking
            const primaryPayload = {
                companyId,
                source: "widget",
                referrer: document.referrer || "Widget",
                vehicle: finalPayload.vehicle,
                passenger: finalPayload.passenger || {},
                voucher: finalPayload.voucher,
                voucherApplied: !!finalPayload.voucher,
                PassengerEmail: finalPayload?.passengerDetails?.email || "",
                mode: formData.booking?.mode || "Transfer",
                returnJourneyToggle: false,
                primaryJourney,
                paymentMethod: finalPayload.paymentMethod,
            };

            // Assign fares
            if (primaryPayload.source === "widget") {
                primaryPayload.journeyFare = primaryJourney.fare || 0;
                primaryPayload.driverFare = primaryJourney.fare || 0;
            }

            await createBooking(primaryPayload).unwrap();

            // Submit Return Journey as second booking — put data in returnJourney
            if (isReturnValid) {
                const returnJourney = {
                    ...returnData,
                    fare: formData.pricing.totalPrice / 2 || 0,
                    hourlyOption: isReturnHourly ? formData.booking?.returnBooking?.hourlyOption : null,
                    pickup: returnData?.pickup || "",
                    dropoff: returnData?.dropoff || "",
                    date: returnData?.date || "",
                    hour: returnData?.hour || "",
                    minute: returnData?.minute || "",
                    notes: returnData?.notes || "",
                };
                const returnPayload = {
                    companyId,
                    source: "widget",
                    referrer: `${document.referrer || "Widget"} (Return)`,
                    vehicle: finalPayload.vehicle,
                    passenger: finalPayload.passenger || {},
                    voucher: finalPayload.voucher,
                    voucherApplied: !!finalPayload.voucher,
                    PassengerEmail: finalPayload?.passengerDetails?.email || "",
                    mode: formData.booking?.mode || "Transfer",
                    returnJourneyToggle: true,

                    // 🔁 Actual return data
                    returnJourney: {
                        ...returnData,
                        vehicle: finalPayload.vehicle,
                        fare: formData.pricing.totalPrice / 2 || 0,
                        hourlyOption: isReturnHourly ? formData.booking?.returnBooking?.hourlyOption : null,
                        pickup: returnData?.pickup || "",
                        dropoff: returnData?.dropoff || "",
                        date: returnData?.date || "",
                        hour: returnData?.hour || "",
                        minute: returnData?.minute || "",
                        notes: returnData?.notes || "",
                    },
                };

                // Assign return fares
                if (returnPayload.source === "widget") {
                    returnPayload.returnJourneyFare = returnPayload.returnJourney.fare || 0;
                    returnPayload.returnDriverFare = returnPayload.returnJourney.fare || 0;
                }

                await createBooking(returnPayload).unwrap();
            }

            // ✅ Success logic
            localStorage.setItem("isWidgetFormFilled", "true"); // <-- ADD THIS
            setStep("success");

            // Success step
            setStep("success");
        } catch (err) {
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
                            returnBooking: returnJourneyToggle
                                ? { ...returnBooking, vehicle: selectedCar }
                                : null,
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
                    onBookNow={({ passengerDetails, voucher, paymentMethod, selectedVehicle }) => {
                        const finalPayload = {
                            companyId,
                            paymentMethod,
                            referrer: window.location.href,
                            fare: formData.pricing.totalPrice,
                            mode: formData.booking?.mode || "Transfer",
                            returnJourneyToggle: formData.booking?.returnJourneyToggle || false,
                            primaryJourney: formData.booking,
                            returnJourney: formData.booking?.returnJourneyToggle
                                ? formData.booking?.returnBooking
                                : undefined,
                            // vehicle: formData.vehicle,
                            vehicle: selectedVehicle,
                            passenger: passengerDetails,
                            PassengerEmail: passengerDetails.email,
                            voucher,
                            voucherApplied: !!voucher,
                        };

                        handleDataChange("vehicle", selectedVehicle);
                        // handleDataChange("payment", { paymentMethod });
                        handleDataChange("payment", {
                            paymentMethod,
                            passengerDetails: passengerDetails,
                        });
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
                        <p className="mt-4 text-[var(--dark-gray)] text-base">
                            Thank you for choosing us. We’ve received your booking and will contact you shortly.
                        </p>

                        <p className="mt-2 text-[var(--dark-gray)] text-base">
                            If you would like to view your portal, please click the button below.
                        </p>

                        <div className="mt-6 flex flex-col sm:flex-row gap-4">
                            <button
                                to="/"
                                className="inline-block px-6 py-3 text-white bg-green-600 hover:bg-green-700 rounded-full font-medium transition"
                            >
                                Return to Home
                            </button>
                            <button
                                onClick={() => {
                                    navigate("/add-customer", {
                                        state: {
                                            email: formData?.payment?.passengerDetails?.email || "",
                                            companyId: companyId,
                                        }
                                    });
                                }}
                                className="inline-block px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-full font-medium transition"
                            >
                                View Your Portal
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WidgetMain;
