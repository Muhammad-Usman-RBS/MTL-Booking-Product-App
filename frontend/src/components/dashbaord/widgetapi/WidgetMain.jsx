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
            const baseBookingPayload = {
                companyId,
                referrer: document.referrer || "Widget",
                mode: formData.booking?.mode || "Transfer",
                vehicle: finalPayload.selectedVehicle,
                passenger: finalPayload.passenger,
                voucher: finalPayload.voucher || null,
                voucherApplied: !!finalPayload.voucher,
                source: "widget",
                PassengerEmail: finalPayload.passenger?.email || "",
                ClientAdminEmail: formData.booking?.adminEmail || ""
            };

            const returnJourneyEnabled = formData.booking?.returnJourneyToggle === true;

            // ✅ 1. Create Primary Booking
            const primaryBooking = await createBooking({
                ...baseBookingPayload,
                returnJourneyToggle: returnJourneyEnabled,
                primaryJourney: {
                    pickup: formData.booking.pickup,
                    dropoff: formData.booking.dropoff,
                    additionalDropoff1: formData.booking.additionalDropoff1 || '',
                    additionalDropoff2: formData.booking.additionalDropoff2 || '',
                    pickupDoorNumber: formData.booking.pickupDoorNumber || '',
                    terminal: formData.booking.terminal || '',
                    arrivefrom: formData.booking.arrivefrom || '',
                    flightNumber: formData.booking.flightNumber || '',
                    pickmeAfter: formData.booking.pickmeAfter || '',
                    notes: formData.booking.notes || '',
                    internalNotes: formData.booking.internalNotes || '',
                    date: formData.booking.date,
                    hour: parseInt(formData.booking.hour),
                    minute: parseInt(formData.booking.minute),
                    fare: finalPayload.fare,
                    hourlyOption: formData.booking?.hourlyOption || null,
                    distanceText: formData.booking.distanceText || '',
                    durationText: formData.booking.durationText || '',
                    dropoffDoorNumber0: formData.booking.dropoffDoorNumber0 || '',
                    dropoff_terminal_0: formData.booking.dropoff_terminal_0 || ''
                }
            }).unwrap();

            console.log("✅ Primary booking saved:", primaryBooking);

            // ✅ 2. Conditionally create return booking
            if (returnJourneyEnabled) {
                const returnBooking = await createBooking({
                    ...baseBookingPayload,
                    returnJourneyToggle: true,
                    returnJourney: {
                        pickup: finalPayload.returnPickup || formData.booking.dropoff,
                        dropoff: finalPayload.returnDropoff || formData.booking.pickup,
                        additionalDropoff1: finalPayload.returnAdditionalDropoff1 || '',
                        additionalDropoff2: finalPayload.returnAdditionalDropoff2 || '',
                        pickupDoorNumber: finalPayload.returnPickupDoorNumber || '',
                        dropoffDoorNumber0: finalPayload.returnDropoffDoorNumber || '',
                        dropoff_terminal_0: finalPayload.returnDropoffTerminal || '',
                        arrivefrom: finalPayload.returnArriveFrom || '',
                        flightNumber: finalPayload.returnFlightNumber || '',
                        pickmeAfter: finalPayload.returnPickmeAfter || '',
                        notes: formData.booking.notes || '',
                        internalNotes: formData.booking.internalNotes || '',
                        date: new Date(finalPayload.returnDate),
                        hour: parseInt(finalPayload.returnHour),
                        minute: parseInt(finalPayload.returnMinute),
                        fare: finalPayload.fare,
                        hourlyOption: formData.booking?.hourlyOption || null,
                        distanceText: finalPayload.returnDistanceText || '',
                        durationText: finalPayload.returnDurationText || ''
                    }
                }).unwrap();

                console.log("✅ Return booking saved:", returnBooking);
            }

            setStep("success");
        } catch (err) {
            console.error("❌ Booking failed:", err);
            setError("Failed to complete your booking. Please try again.");
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
                    onNext={({ totalPrice, selectedCar, returnJourneyToggle }) => {
                        handleDataChange('pricing', { totalPrice });
                        handleDataChange('vehicle', selectedCar);
                        handleStepChange('payment');
                        handleDataChange('booking', {
                            ...formData.booking,
                            returnJourneyToggle: returnJourneyToggle || false
                        });
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
