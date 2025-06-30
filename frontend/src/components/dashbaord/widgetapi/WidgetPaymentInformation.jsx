import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useCreateBookingMutation } from '../../../redux/api/bookingApi';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import SelectOption from '../../../constants/constantscomponents/SelectOption';
import { useGetDiscountsByCompanyIdQuery } from "../../../redux/api/discountApi";

const WidgetPaymentInformation = ({ companyId, fare, onBookNow, vehicle = {}, booking = {} }) => {
    const [passengerDetails, setPassengerDetails] = useState({ name: '', email: '', phone: '' });
    const [formData, setFormData] = useState({
        passenger: '',
        childSeats: '',
        handLuggage: '',
        checkinLuggage: ''
    });

    const { data: discounts = [] } = useGetDiscountsByCompanyIdQuery(companyId);
    const [voucher, setVoucher] = useState('');
    const [discountPercent, setDiscountPercent] = useState(0);
    const [surchargePercent, setSurchargePercent] = useState(0);
    const [journeyDateTime, setJourneyDateTime] = useState(null);

    useEffect(() => {
        if (booking?.date && booking?.hour !== undefined && booking?.minute !== undefined) {
            const dt = new Date(booking.date);
            dt.setHours(Number(booking.hour));
            dt.setMinutes(Number(booking.minute));
            setJourneyDateTime(dt);
        }
    }, [booking]);

    useEffect(() => {
        if (!journeyDateTime || !discounts?.length) return;

        const activeDiscount = discounts.find((d) => {
            const from = new Date(d.fromDate);
            const to = new Date(d.toDate);
            return d.category === "Discount" &&
                journeyDateTime >= from &&
                journeyDateTime <= to &&
                d.status === "Active";
        });

        const activeSurcharge = discounts.find((d) => {
            const from = new Date(d.fromDate);
            const to = new Date(d.toDate);
            return d.category === "Surcharge" &&
                journeyDateTime >= from &&
                journeyDateTime <= to &&
                d.status === "Active";
        });

        setDiscountPercent(activeDiscount?.discountPrice || 0);
        setSurchargePercent(activeSurcharge?.discountPrice || 0);
    }, [journeyDateTime, discounts]);

    const generateOptions = (max = 10) => {
        const result = [{ label: "Select", value: "" }];
        for (let i = 0; i <= max; i++) {
            result.push({ label: `${i}`, value: `${i}` });
        }
        return result;
    };

    const parseIntSafe = (val, fallback = 4) =>
        !isNaN(parseInt(val)) && parseInt(val) >= 0 ? parseInt(val) : fallback;

    const passengerOptions = generateOptions(parseIntSafe(vehicle?.passenger));
    const childSeatOptions = generateOptions(parseIntSafe(vehicle?.childSeat));
    const handLuggageOptions = generateOptions(parseIntSafe(vehicle?.handLuggage));
    const checkinLuggageOptions = generateOptions(parseIntSafe(vehicle?.checkinLuggage));

    useEffect(() => {
        if (vehicle) {
            setFormData({
                passenger: String(vehicle?.passenger || ''),
                childSeats: String(vehicle?.childSeat || ''),
                handLuggage: String(vehicle?.handLuggage || ''),
                checkinLuggage: String(vehicle?.checkinLuggage || '')
            });
        }
    }, [vehicle]);

    const handleSelectChange = (field) => (e) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const calculateFinalFare = () => {
        let updatedFare = fare;

        if (surchargePercent > 0) {
            updatedFare += fare * (surchargePercent / 100);
        }
        if (discountPercent > 0) {
            updatedFare = updatedFare * (1 - discountPercent / 100);
        }

        return parseFloat(updatedFare.toFixed(2));
    };

    const finalFare = calculateFinalFare();

    const handleSubmit = () => {
        if (!passengerDetails.name || !passengerDetails.email || !passengerDetails.phone) {
            toast.error("Please fill all required passenger details.");
            return;
        }

        const payload = {
            passengerDetails,
            fare: finalFare,
            voucher,
            selectedVehicle: {
                ...vehicle,
                passenger: formData.passenger,
                childSeat: formData.childSeats,
                handLuggage: formData.handLuggage,
                checkinLuggage: formData.checkinLuggage
            }
        };

        onBookNow?.(payload);
    };

    return (
        <div className="max-w-xl w-full mx-auto mt-6 px-4 sm:px-0">
            <ToastContainer />

            {/* Passenger Details */}
            <div className="bg-white border border-gray-200 rounded-xl shadow p-6 space-y-6 mb-6">
                <div className="text-2xl font-bold text-gray-800">
                    BASE FARE: {(fare || 0).toFixed(2)} GBP
                </div>
                <h3 className="text-lg font-semibold">Passenger Details:-</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <input
                            type="text"
                            value={passengerDetails.name}
                            onChange={(e) => setPassengerDetails({ ...passengerDetails, name: e.target.value })}
                            className="custom_input"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-1">Email Address</label>
                        <input
                            type="email"
                            value={passengerDetails.email}
                            onChange={(e) => setPassengerDetails({ ...passengerDetails, email: e.target.value })}
                            className="custom_input"
                        />
                    </div>
                    <div className="sm:col-span-4">
                        <label className="block text-sm font-medium mb-1">Contact Number</label>
                        <PhoneInput
                            country={"pk"}
                            value={passengerDetails.phone}
                            onChange={(phone) => setPassengerDetails({ ...passengerDetails, phone })}
                            inputClass="!w-full !text-sm !py-2 !px-3 !pl-14 !border-gray-300 !rounded"
                            dropdownClass="!text-sm"
                            containerClass="!w-full"
                            buttonClass="!ps-2"
                        />
                    </div>
                </div>
            </div>

            {/* Vehicle Info */}
            <div className="bg-white border border-gray-200 rounded-xl shadow p-6 space-y-6 mb-6">
                <h3 className="text-lg font-semibold">Vehicle Detail:-</h3>
                {vehicle?.vehicleName && (
                    <div className="text-sm text-gray-600 font-medium">
                        Selected Vehicle:&nbsp;
                        <span className="text-blue-700 font-semibold">{vehicle.vehicleName}</span>
                    </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    <SelectOption label="Passenger" value={formData.passenger} options={passengerOptions} onChange={handleSelectChange('passenger')} />
                    <SelectOption label="Child Seats" value={formData.childSeats} options={childSeatOptions} onChange={handleSelectChange('childSeats')} />
                    <SelectOption label="Hand Luggage" value={formData.handLuggage} options={handLuggageOptions} onChange={handleSelectChange('handLuggage')} />
                    <SelectOption label="Check-in Luggage" value={formData.checkinLuggage} options={checkinLuggageOptions} onChange={handleSelectChange('checkinLuggage')} />
                </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm mt-6">
                <h2 className="text-lg font-bold mb-2">Payment:-</h2>
                <hr className="mb-4" />
                <div className="text-center mb-4">
                    {booking?.date && (
                        <div className="text-sm text-gray-700 mt-2">
                            Journey Date:&nbsp;
                            <span className="font-semibold text-gray-900">
                                {new Date(booking.date).toLocaleDateString("en-GB", {
                                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                })}
                            </span>
                            &nbsp;at&nbsp;
                            <span className="font-semibold text-gray-900">
                                {String(booking.hour).padStart(2, '0')}:{String(booking.minute).padStart(2, '0')}
                            </span>
                        </div>
                    )}

                    {/* Fare Breakdown */}
                    <div className="text-2xl font-bold text-gray-800 mt-4">
                        {(discountPercent > 0 || surchargePercent > 0) ? (
                            <>
                                <span className="line-through text-red-400 me-2">
                                    {(fare || 0).toFixed(2)} GBP
                                </span>
                                <span className="text-green-600">{finalFare} GBP</span>
                            </>
                        ) : (
                            <>FARE: {(fare || 0).toFixed(2)} GBP</>
                        )}
                    </div>

                    {surchargePercent > 0 && (
                        <p className="text-sm text-red-600">Surcharge Applied: {surchargePercent}%</p>
                    )}
                    {discountPercent > 0 && (
                        <p className="text-sm text-green-600">Discount Applied: {discountPercent}%</p>
                    )}

                    <div className="text-sm mt-2 text-gray-700">Payment gateway:</div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm shadow">
                        Pay Via Debit/Credit Card
                    </button>
                </div>

                {/* Voucher */}
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

                <p className="text-xs text-center text-gray-700 mb-3">
                    By clicking 'BOOK NOW' button you are agreeing to our{' '}
                    <a href="#" className="text-blue-600 underline">Terms And Conditions</a> &{' '}
                    <a href="#" className="text-blue-600 underline">Privacy and Security</a>.
                </p>
                <p className="text-xs text-center text-gray-600 mb-4">
                    Additional charges may be applicable for changes in route, wait time, or address.
                </p>

                <div className="text-center">
                    <button
                        onClick={handleSubmit}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-md text-sm shadow"
                    >
                        BOOK NOW
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WidgetPaymentInformation;
