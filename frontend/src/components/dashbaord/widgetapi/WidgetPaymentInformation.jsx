import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useCreateBookingMutation } from '../../../redux/api/bookingApi';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const WidgetPaymentInformation = ({ companyId, fare = 454.76, onBookNow }) => {
    const [voucher, setVoucher] = useState('');

    const [createBooking] = useCreateBookingMutation();
    const [bookingForm, setBookingForm] = useState(null);
    const [vehicle, setVehicle] = useState(null);
    const [passengerDetails, setPassengerDetails] = useState({
        name: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        const storedForm = localStorage.getItem("bookingForm");
        const storedVehicle = localStorage.getItem("selectedVehicle");

        if (!storedForm || !storedVehicle) {
            toast.error("Booking form or vehicle data is missing.");
            return;
        }

        setBookingForm(JSON.parse(storedForm));
        setVehicle(JSON.parse(storedVehicle));
    }, []);

    const handleSubmit = async () => {
        if (!bookingForm || !vehicle) {
            toast.error("Incomplete booking data.");
            return;
        }

        if (!passengerDetails.name || !passengerDetails.email || !passengerDetails.phone) {
            toast.error("Please fill in all passenger details.");
            return;
        }

        const dynamicFields = {};
        Object.keys(bookingForm).forEach((key) => {
            if (key.startsWith("dropoffDoorNumber") || key.startsWith("dropoff_terminal_")) {
                dynamicFields[key] = bookingForm[key];
            }
        });

        const payload = {
            mode: bookingForm.mode || "Transfer",
            returnJourney: false,
            companyId,
            referrer: document.referrer,
            vehicle: {
                vehicleName: vehicle.vehicleName,
                passenger: vehicle.passengers || 0,
                childSeat: vehicle.childSeat || 0,
                handLuggage: vehicle.smallLuggage || 0,
                checkinLuggage: vehicle.largeLuggage || 0,
            },
            passenger: {
                name: passengerDetails.name,
                email: passengerDetails.email,
                phone: passengerDetails.phone,
            },
            journey1: {
                pickup: bookingForm.pickup,
                dropoff: bookingForm.dropoff,
                additionalDropoff1: bookingForm.additionalDropoff1 || null,
                additionalDropoff2: bookingForm.additionalDropoff2 || null,
                pickupDoorNumber: bookingForm.pickupDoorNumber || null,
                arrivefrom: bookingForm.arrivefrom || null,
                flightNumber: bookingForm.flightNumber || null,
                pickmeAfter: bookingForm.pickmeAfter || null,
                notes: bookingForm.notes || null,
                internalNotes: bookingForm.internalNotes || null,
                date: bookingForm.date,
                hour: parseInt(bookingForm.hour),
                minute: parseInt(bookingForm.minute),
                hourlyOption: bookingForm.hourlyOption || null,
                distanceText: bookingForm.distanceText || null,
                durationText: bookingForm.durationText || null,
                ...dynamicFields
            }
        };

        try {
            await createBooking(payload).unwrap();
            toast.success("Booking submitted successfully!");
            localStorage.removeItem("bookingForm");
            localStorage.removeItem("selectedVehicle");
        } catch (err) {
            console.error(err);
            toast.error("Booking failed. Please try again.");
        }
    };

    return (
        <div className="max-w-xl w-full mx-auto mt-6 px-4 sm:px-0">
            <ToastContainer />

            {/* Passenger Details */}
            <div className="bg-white border border-gray-200 rounded-xl shadow p-6 space-y-6 mb-6">
                <h3 className="text-lg font-semibold">Passenger Details:-</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Full Name */}
                    <div className="sm:col-span-2 lg:col-span-2">
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <input
                            type="text"
                            value={passengerDetails.name}
                            onChange={(e) =>
                                setPassengerDetails({ ...passengerDetails, name: e.target.value })
                            }
                            className="custom_input"
                        />
                    </div>

                    {/* Email */}
                    <div className="sm:col-span-2 lg:col-span-2">
                        <label className="block text-sm font-medium mb-1">Email Address</label>
                        <input
                            type="email"
                            value={passengerDetails.email}
                            onChange={(e) =>
                                setPassengerDetails({ ...passengerDetails, email: e.target.value })
                            }
                            className="custom_input"
                        />
                    </div>

                    {/* Phone */}
                    <div className="sm:col-span-4">
                        <label className="block text-sm font-medium mb-1">Contact Number</label>
                        <PhoneInput
                            country={"pk"}
                            value={passengerDetails.phone}
                            onChange={(phone) =>
                                setPassengerDetails({ ...passengerDetails, phone })
                            }
                            inputClass="!w-full !text-sm !py-2 !px-3 !pl-14 !border-gray-300 !rounded !focus:outline-none !focus:ring-2 !focus:ring-blue-500"
                            dropdownClass="!text-sm"
                            containerClass="!w-full"
                            buttonClass="!ps-2"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm mt-6">
                <h2 className="text-lg font-bold mb-2">Payment:-</h2>
                <hr className="mb-4" />

                {/* FARE Display */}
                <div className="text-center mb-4">
                    <div className="text-2xl font-bold text-gray-800">
                        FARE: {fare.toFixed(2)} GBP
                    </div>
                    <div className="text-sm mt-1 mb-2 text-gray-700">Payment gateway:</div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm shadow">
                        Pay Via Debit/Credit Card
                    </button>
                </div>

                {/* Voucher Section */}
                <div className="bg-blue-100 rounded-md p-4 mb-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={voucher}
                            onChange={(e) => setVoucher(e.target.value)}
                            placeholder="Voucher Code"
                            className="flex-grow px-3 py-2 rounded border text-sm"
                        />
                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm">
                            Apply
                        </button>
                    </div>
                    <p className="text-xs mt-2 text-gray-600">Click "Apply" to update the voucher</p>
                </div>

                {/* Terms Note */}
                <p className="text-xs text-center text-gray-700 mb-3">
                    By clicking 'BOOK NOW' button you are agreeing to our{' '}
                    <a href="#" className="text-blue-600 underline">Terms And Conditions</a> &{' '}
                    <a href="#" className="text-blue-600 underline">Privacy and Security</a>.
                </p>
                <p className="text-xs text-center text-gray-600 mb-4">
                    Additional charges may be applicable for any changes in route, waiting time, additional stops, address changes or vehicle changes.
                </p>

                {/* Book Now Button */}
                <div className="text-center">
                    <button
                        onClick={onBookNow}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-md text-sm shadow"
                    >
                        BOOK NOW
                    </button>
                </div>
            </div>

            {/* Submit Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow p-6 space-y-6">
                <h3 className="text-lg font-semibold">Confirm & Submit</h3>
                <button
                    onClick={handleSubmit}
                    className="bg-green-600 text-white px-6 py-2 rounded-md shadow hover:bg-green-700"
                >
                    Submit Booking
                </button>
            </div>
        </div>
    );
};

export default WidgetPaymentInformation;
