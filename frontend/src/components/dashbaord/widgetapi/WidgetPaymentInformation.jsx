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
import OutletHeading from '../../../constants/constantscomponents/OutletHeading';
import ArrowButton from '../../../constants/constantscomponents/ArrowButton';
import { useGetBookingSettingQuery } from "../../../redux/api/bookingSettingsApi";

const WidgetPaymentInformation = ({ companyId, fare, onBookNow, vehicle = {}, booking = {} }) => {
    const [passengerDetails, setPassengerDetails] = useState({ name: '', email: '', phone: '' });
    const [formData, setFormData] = useState({
        passenger: '',
        childSeat: '',
        handLuggage: '',
        checkinLuggage: '',
        paymentMethod: ''
    });

    const [fetchVoucher] = useLazyGetVoucherByCodeQuery();
    const { data: discounts = [] } = useGetDiscountsByCompanyIdQuery(companyId);
    const { data: generalPricing } = useGetGeneralPricingPublicQuery(companyId);
    const { data: bookingSettingData } = useGetBookingSettingQuery();
    const currencySetting = bookingSettingData?.setting?.currency?.[0] || {};
    const currencySymbol = currencySetting?.symbol || "£";
    const currencyCode = currencySetting?.value || "GBP";

    const [voucher, setVoucher] = useState('');
    const [companyDiscountPercent, setCompanyDiscountPercent] = useState(0);
    const [voucherDiscountPercent, setVoucherDiscountPercent] = useState(0);
    const [journeyDateTime, setJourneyDateTime] = useState(null);

    const generateOptions = (max = 10) => {
        const result = [];
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
        if (!vehicle) return;

        const updatedFormData = {
            passenger: vehicle?.passenger ? String(vehicle.passenger) : '',
            childSeat: '',
            handLuggage: vehicle?.handLuggage ? String(vehicle.handLuggage) : '',
            checkinLuggage: vehicle?.checkinLuggage ? String(vehicle.checkinLuggage) : ''
        };

        // Prevent infinite loop: only update if something actually changed
        if (JSON.stringify(formData) !== JSON.stringify(updatedFormData)) {
            setFormData(updatedFormData);
        }
    }, [vehicle]);

    const handleSelectChange = (field) => (e) => {
        const newValue = e.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: newValue
        }));
    };

    const calculateFinalFare = () => {
        if (!generalPricing) return fare;

        const totalDiscount = companyDiscountPercent + voucherDiscountPercent;
        let updatedFare = fare;

        const selectedChildSeat = parseInt(formData.childSeat || '0');
        const isValidSelection = !isNaN(selectedChildSeat) && selectedChildSeat > 0;
        const unitPrice = parseFloat(generalPricing?.childSeatPrice || 0);

        if (isValidSelection) {
            updatedFare += selectedChildSeat * unitPrice;
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
            paymentMethod: formData.paymentMethod,
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
        <>
            <div className="mx-auto max-w-5xl mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white shadow-lg rounded-xl p-6 sm:p-8">
                    {/* Passenger Details */}
                    <div className="col-span-6">
                        <div className="bg-white border border-gray-200 rounded-xl shadow p-6 space-y-6 mb-6">
                            <OutletHeading name="Passenger Details:-" />
                            <div>
                                <label className="block text-sm font-medium mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={passengerDetails.name}
                                    onChange={(e) => setPassengerDetails({ ...passengerDetails, name: e.target.value })}
                                    className="custom_input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={passengerDetails.email}
                                    onChange={(e) => setPassengerDetails({ ...passengerDetails, email: e.target.value })}
                                    className="custom_input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Contact Number</label>
                                <PhoneInput
                                    country={"pk"}
                                    value={passengerDetails.phone}
                                    onChange={(phone) => setPassengerDetails({ ...passengerDetails, phone })}
                                    inputClass="!w-full !text-sm !py-2 !px-3 !pl-14 !border-[var(--light-gray)] !rounded"
                                    dropdownClass="!text-sm"
                                    containerClass="!w-full"
                                    buttonClass="!ps-2"
                                />
                            </div>
                        </div>

                        {/* Payment Section */}
                        <div className="bg-white border border-[var(--light-gray)] rounded-xl p-6 shadow-sm mt-6">
                            <OutletHeading name="Payment:-" />
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
                                    {((companyDiscountPercent + voucherDiscountPercent) > 0 || parseInt(formData.childSeat || '0') > 0) ? (
                                        <>
                                            <span className="line-through text-red-400 me-2">
                                                {/* {(fare || 0).toFixed(2)} GBP */}
                                                {currencySymbol}{Number(fare || 0).toFixed(2)}
                                            </span>
                                            <span className="text-green-600">
                                                {/* {finalFare} GBP */}
                                                {currencySymbol}{Number(finalFare).toFixed(2)}
                                            </span>
                                        </>
                                    ) : (
                                        // <>FARE: {finalFare} GBP</>4
                                        <>FARE: {currencySymbol}{Number(finalFare).toFixed(2)}</>
                                    )}
                                </div>

                                {(companyDiscountPercent + voucherDiscountPercent > 0) && (
                                    <p className="text-sm text-green-600 font-semibold">
                                        Discount Applied: {companyDiscountPercent + voucherDiscountPercent}% &nbsp;
                                        <span className="text-xs font-normal text-[var(--dark-gray)]">
                                            ({companyDiscountPercent > 0 && `Company: ${companyDiscountPercent}%`}
                                            {companyDiscountPercent > 0 && voucherDiscountPercent > 0 && ' + '}
                                            {voucherDiscountPercent > 0 && `Voucher: ${voucherDiscountPercent}%`})
                                        </span>
                                    </p>
                                )}

                                <SelectOption
                                    label="Payment Method"
                                    value={formData.paymentMethod}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))
                                    }
                                    options={[
                                        { label: "Select", value: "" },
                                        { label: "Payment Link", value: "Payment Link" },
                                        { label: "Card, Bank", value: "Card, Bank" },
                                        { label: "Cash", value: "Cash" },
                                        { label: "Invoice", value: "Invoice" },
                                        { label: "Paypal", value: "Paypal" },
                                    ]}
                                />
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
                                        className="btn btn-cancel"
                                    >
                                        Apply
                                    </button>
                                </div>
                                <p className="text-xs mt-2 text-[var(--dark-gray)]">Click "Apply" to update the voucher</p>
                            </div>
                            <ArrowButton label="Book Now" onClick={handleSubmit} mainColor="#20a220" />
                        </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="col-span-6">
                        <div className="bg-white border border-gray-200 rounded-xl shadow p-6 mb-6">
                            <OutletHeading name="Vehicle Detail:-" />

                            {vehicle?.vehicleName && (
                                <div className="text-sm text-[var(--dark-gray)] font-medium">
                                    Selected Vehicle:&nbsp;
                                    <span className="text-blue-700 font-semibold">{vehicle.vehicleName}</span>
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                                <SelectOption label="Passenger" value={formData.passenger} options={passengerOptions} onChange={handleSelectChange('passenger')} />
                                <SelectOption label="Child Seats" value={formData.childSeat} options={childSeatOptions} onChange={handleSelectChange('childSeat')} />
                                <SelectOption label="Hand Luggage" value={formData.handLuggage} options={handLuggageOptions} onChange={handleSelectChange('handLuggage')} />
                                <SelectOption label="Check-in Luggage" value={formData.checkinLuggage} options={checkinLuggageOptions} onChange={handleSelectChange('checkinLuggage')} />
                            </div>
                        </div>

                        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-sm">
                            <h4 className="text-sm font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                                <Icons.AlertCircle className="w-5 h-5 text-yellow-600" />
                                Important Notice
                            </h4>

                            <p className="text-sm text-yellow-900 mb-3 leading-relaxed">
                                For your child's safety, please remember to add a child seat when booking.
                            </p>

                            <div className="bg-yellow-100 border border-yellow-200 rounded-md p-3 text-center mb-3">
                                <p className="text-xs text-gray-700">
                                    By clicking <strong>‘BOOK NOW’</strong>, you agree to our{' '}
                                    <a href="#" className="text-blue-600 underline hover:text-blue-800">Terms and Conditions</a> and{' '}
                                    <a href="#" className="text-blue-600 underline hover:text-blue-800">Privacy Policy</a>.
                                </p>
                            </div>

                            <p className="text-xs text-[var(--dark-gray)] text-center italic">
                                Note: Additional charges may apply for waiting time, address changes, or extended routes.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default WidgetPaymentInformation;
