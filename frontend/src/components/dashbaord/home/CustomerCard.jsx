import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useGetAllBookingsQuery } from '../../../redux/api/bookingApi';
import { useGetAllDriversQuery } from '../../../redux/api/driverApi';
import { statusColors } from '../../../constants/dashboardTabsData/data';

const CustomerCard = () => {
    const user = useSelector((state) => state.auth.user);
    const companyId = user?.companyId;

    const [bookings, setBookings] = useState([]);

    const { data, isLoading, error } = useGetAllBookingsQuery(companyId);
    const { data: driversData } = useGetAllDriversQuery(companyId);

    const allDrivers = driversData?.drivers || [];

    useEffect(() => {
        if (data?.bookings) {
            const userBookings = data.bookings.filter(
                (b) => b?.passenger?.email === user.email
            );
            setBookings(userBookings);
        }
    }, [data, user.email]);

    useEffect(() => {
        if (error) toast.error('Failed to load bookings');
    }, [error]);



    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 p-6">
            {bookings.length === 0 ? (
                <div className="col-span-full text-center text-lg font-medium text-gray-500">
                    No bookings found for this customer.
                </div>
            ) : (
                bookings.map((booking) => (
                    <div
                        key={booking._id}
                        className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-2xl transition-transform duration-300 transform hover:scale-[1.02] flex flex-col justify-between"
                    >
                        <div>
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-lg font-bold text-[var(--dark-gray)]">
                                    Booking ID: {booking.bookingId}
                                </h2>
                                <span
                                    className="px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
                                    style={{
                                        background: statusColors[booking.status]?.bg,
                                        color: statusColors[booking.status]?.text,
                                    }}
                                >
                                    {booking.status}
                                </span>
                            </div>

                            <hr className="mb-5 border-gray-200" />

                            {/* Info Section */}
                            <div className="space-y-4 text-sm text-gray-700">
                                <div className="flex justify-between flex-wrap">
                                    <span><strong>Passenger:</strong> {booking?.passenger?.name || 'N/A'}</span>
                                    <span><strong>Type:</strong> {booking?.returnJourney ? 'Return' : 'Primary'}</span>
                                </div>

                                {booking.primaryJourney ? (
                                    <div className="flex justify-between flex-wrap">
                                        <span><strong>Journey Fare:</strong> {booking.journeyFare ? `${booking.journeyFare} GBP` : 'N/A'}</span>
                                        <span><strong>Driver Fare:</strong> {booking.driverFare ? `${booking.driverFare} GBP` : 'N/A'}</span>
                                    </div>
                                ) : booking.returnJourney ? (
                                    <div className="flex justify-between flex-wrap">
                                        <span><strong>Return Fare:</strong> {booking.returnJourneyFare ? `${booking.returnJourneyFare} GBP` : 'N/A'}</span>
                                        <span><strong>Return Driver Fare:</strong> {booking.returnDriverFare ? `${booking.returnDriverFare} GBP` : 'N/A'}</span>
                                    </div>
                                ) : (
                                    <div className="text-gray-700 font-semibold">No Fare Available</div>
                                )}

                                <div className="flex justify-between flex-wrap">
                                    <span><strong>Vehicle:</strong> {booking?.vehicle?.vehicleName || 'N/A'}</span>
                                    <span><strong>Payment:</strong> {booking?.paymentMethod || 'N/A'}</span>
                                </div>

                                <div className="flex justify-between flex-wrap">
                                    <span><strong>Pick-Up:</strong> {booking?.returnJourney?.pickup || booking?.primaryJourney?.pickup || 'N/A'}</span>
                                    <span className='mt-3'><strong>Drop-Off:</strong> {booking?.returnJourney?.dropoff || booking?.primaryJourney?.dropoff || 'N/A'}</span>
                                </div>

                                {/* Driver Info Section */}
                                <div className="mt-4">
                                    <strong className="block mb-1 text-lg mt-4 font-bold text-[var(--dark-gray)]">Drivers:</strong>
                                    {booking?.drivers?.length > 0 ? (
                                        <div className="space-y-3">
                                            {booking.drivers.map((driverId, index) => {
                                                const driver = allDrivers.find((d) => d._id === driverId);
                                                return (
                                                    <div
                                                        key={index}
                                                        className="bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm"
                                                    >
                                                        <div><strong>Name:</strong> {driver?.DriverData ? `${driver.DriverData.firstName} ${driver.DriverData.surName}` : 'Unnamed Driver'}</div>
                                                        <div><strong>Contact:</strong> {driver?.DriverData?.contact || 'N/A'}</div>
                                                        <div><strong>Car Reg#:</strong> {driver?.VehicleData?.carRegistration || 'N/A'}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <span className="text-gray-500">No driver assigned</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                            {booking.status === "Deleted" ? (
                                <div className="text-red-500 font-semibold text-sm">
                                    This booking has been deleted.
                                </div>
                            ) : (
                                <div></div>
                            )}
                            <div className="text-sm text-gray-500 text-right">
                                <strong>Booking Date:</strong>{' '}
                                {new Date(booking.createdAt).toLocaleString()}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>

    );
};

export default CustomerCard;
