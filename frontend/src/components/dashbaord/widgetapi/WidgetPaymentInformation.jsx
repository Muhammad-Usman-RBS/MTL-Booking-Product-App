import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useCreateBookingMutation } from '../../../redux/api/bookingApi';
import Icons from '../../../assets/icons';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import SelectOption from '../../../constants/constantscomponents/SelectOption';
import { useGetDiscountsByCompanyIdQuery } from "../../../redux/api/discountApi";
import { useLazyGetVoucherByCodeQuery } from "../../../redux/api/vouchersApi";
import { useGetGeneralPricingPublicQuery } from '../../../redux/api/generalPricingApi';

const WidgetPaymentInformation = ({ companyId, fare, onBookNow, vehicle = {}, booking = {} }) => {
    const [passengerDetails, setPassengerDetails] = useState({ name: '', email: '', phone: '' });
    const [formData, setFormData] = useState({
        passenger: '',
        childSeat: '',
        handLuggage: '',
        checkinLuggage: ''
    });

    const [fetchVoucher] = useLazyGetVoucherByCodeQuery();
    const { data: discounts = [] } = useGetDiscountsByCompanyIdQuery(companyId);
    const { data: generalPricing } = useGetGeneralPricingPublicQuery(companyId);

    const [voucher, setVoucher] = useState('');
    const [companyDiscountPercent, setCompanyDiscountPercent] = useState(0);
    const [voucherDiscountPercent, setVoucherDiscountPercent] = useState(0);
    const [journeyDateTime, setJourneyDateTime] = useState(null);


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
            const from = new Date(d.fromDate).getTime();
            const to = new Date(d.toDate).getTime();
            const journey = journeyDateTime?.getTime();

            return d.category === "Discount" &&
                journey >= from &&
                journey <= to &&
                d.status === "Active";
        });

        setCompanyDiscountPercent(activeDiscount?.discountPrice || 0);
    }, [journeyDateTime, discounts]);

    useEffect(() => {
        if (vehicle) {
            setFormData({
                passenger: vehicle?.passenger ? String(vehicle.passenger) : '',
                childSeats: '', // Keep empty as user needs to select
                handLuggage: vehicle?.handLuggage ? String(vehicle.handLuggage) : '',
                checkinLuggage: vehicle?.checkinLuggage ? String(vehicle.checkinLuggage) : ''
            });
        }
    }, [vehicle]);



    const handleSelectChange = (field) => (e) => {
        const newValue = e.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: newValue
        }));

        // Debug log to check if value is being set
        console.log(`${field} changed to:`, newValue);
    };

    const calculateFinalFare = () => {
        if (!generalPricing) return fare;

        const totalDiscount = companyDiscountPercent + voucherDiscountPercent;
        let updatedFare = fare;

        const selectedChildSeats = parseInt(formData.childSeats || '0');
        const isValidSelection = !isNaN(selectedChildSeats) && selectedChildSeats > 0;
        const unitPrice = parseFloat(generalPricing?.childSeatPrice || 0);

        if (isValidSelection) {
            updatedFare += selectedChildSeats * unitPrice;
        }

        if (totalDiscount > 0) {
            updatedFare = updatedFare * (1 - totalDiscount / 100);
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
            voucherApplied: !!voucherDiscountPercent,
            selectedVehicle: {
                ...vehicle,
               passenger: Number(formData.passenger) || 0,
  childSeat: Number(formData.childSeat) || 0,
  handLuggage: Number(formData.handLuggage) || 0,
  checkinLuggage: Number(formData.checkinLuggage) || 0
            }
        };

        onBookNow?.(payload);
    };

    const handleVoucherApply = async () => {
        if (!voucher) {
            toast.error("Please enter a voucher code.");
            return;
        }

        try {
            const res = await fetchVoucher(voucher).unwrap();

            if (!res || !res.voucher) {
                toast.error("Invalid voucher code.");
                setVoucherDiscountPercent(0);
                return;
            }

            if (res.status !== "Active") {
                toast.error("This voucher is not active.");
                setVoucherDiscountPercent(0);
                return;
            }

            const validityDate = new Date(res.validity);
            if (!journeyDateTime || journeyDateTime > validityDate) {
                toast.error("Voucher is not valid for your journey date.");
                setVoucherDiscountPercent(0);
                return;
            }

            setVoucherDiscountPercent(res.discountValue || 0);
            toast.success(`Voucher applied: ${res.discountValue}% off.`);
        } catch (err) {
            const errorMessage =
                err?.data?.message || err?.error || err?.message || "Failed to apply voucher";
            toast.error(errorMessage);
            setVoucherDiscountPercent(0);
        }

    };

    const maxAppliedDiscount = Math.max(companyDiscountPercent, voucherDiscountPercent);

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
                    <SelectOption label="Child Seats" value={formData.childSeat} options={childSeatOptions} onChange={handleSelectChange('childSeat')} />
                    <SelectOption label="Hand Luggage" value={formData.handLuggage} options={handLuggageOptions} onChange={handleSelectChange('handLuggage')} />
                    <SelectOption label="Check-in Luggage" value={formData.checkinLuggage} options={checkinLuggageOptions} onChange={handleSelectChange('checkinLuggage')} />
                </div>
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center gap-2">
                    <Icons.AlertCircle className="w-4 h-4 text-yellow-600" />
                    Please Note
                </h4>
                <p className="text-sm text-yellow-900">
                    Child seats must be added for safety reasons.
                </p>
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

                    <div className="text-2xl font-bold text-gray-800 mt-4">
                        {((companyDiscountPercent + voucherDiscountPercent) > 0 || parseInt(formData.childSeats || '0') > 0) ? (
                            <>
                                <span className="line-through text-red-400 me-2">
                                    {(fare || 0).toFixed(2)} GBP
                                </span>
                                <span className="text-green-600">{finalFare} GBP</span>
                            </>
                        ) : (
                            <>FARE: {finalFare} GBP</>
                        )}
                    </div>

                    {(companyDiscountPercent + voucherDiscountPercent > 0) && (
                        <p className="text-sm text-green-600 font-semibold">
                            Discount Applied: {companyDiscountPercent + voucherDiscountPercent}% &nbsp;
                            <span className="text-xs font-normal text-gray-600">
                                ({companyDiscountPercent > 0 && `Company: ${companyDiscountPercent}%`}
                                {companyDiscountPercent > 0 && voucherDiscountPercent > 0 && ' + '}
                                {voucherDiscountPercent > 0 && `Voucher: ${voucherDiscountPercent}%`})
                            </span>
                        </p>
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
                        <button
                            onClick={handleVoucherApply}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                        >
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
