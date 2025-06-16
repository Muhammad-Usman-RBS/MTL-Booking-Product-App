import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useCreateBookingMutation } from '../../../redux/api/bookingApi';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import SelectOption from '../../../constants/constantscomponents/SelectOption';

const WidgetPaymentInformation = ({ companyId, fare = 454.76, onBookNow }) => {
    const [passengerDetails, setPassengerDetails] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const [formData, setFormData] = useState({
        passenger: '',
        childSeats: '',
        handLuggage: '',
        checkinLuggage: ''
    });

    const [voucher, setVoucher] = useState('');

    const handleSelectChange = (field) => (e) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const handleSubmit = () => {
        // Add your submission logic here
        toast.success("Booking submitted successfully!");
    };

    const selectOptions = [
        { label: "Select", value: "" },
        { label: "Option 1", value: "option1" },
        { label: "Option 2", value: "option2" }
    ];

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

            {/* Vehicle Information */}
            <div className="bg-white border border-gray-200 rounded-xl shadow p-6 space-y-6 mb-6">
                <h3 className="text-lg font-semibold">Vehicle Detail:-</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    <SelectOption
                        label="Passenger"
                        options={selectOptions}
                        value={formData.passenger}
                        onChange={handleSelectChange('passenger')}
                    />

                    <SelectOption
                        label="Child Seats"
                        options={selectOptions}
                        value={formData.childSeats}
                        onChange={handleSelectChange('childSeats')}
                    />

                    <SelectOption
                        label="Hand Luggage"
                        options={selectOptions}
                        value={formData.handLuggage}
                        onChange={handleSelectChange('handLuggage')}
                    />

                    <SelectOption
                        label="Check-in Luggage"
                        options={selectOptions}
                        value={formData.checkinLuggage}
                        onChange={handleSelectChange('checkinLuggage')}
                    />
                </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm mt-6">
                <h2 className="text-lg font-bold mb-2">Payment:-</h2>
                <hr className="mb-4" />

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

                <p className="text-xs text-center text-gray-700 mb-3">
                    By clicking 'BOOK NOW' button you are agreeing to our{' '}
                    <a href="#" className="text-blue-600 underline">Terms And Conditions</a> &{' '}
                    <a href="#" className="text-blue-600 underline">Privacy and Security</a>.
                </p>
                <p className="text-xs text-center text-gray-600 mb-4">
                    Additional charges may be applicable for any changes in route, waiting time, additional stops, address changes or vehicle changes.
                </p>

                <div className="text-center">
                    <button
                        onClick={onBookNow}
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
