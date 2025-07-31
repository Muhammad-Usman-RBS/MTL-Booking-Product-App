import React, { useState, useEffect } from "react";
import {
    Calendar,
    Clock,
    MapPin,
    DollarSign,
    Users,
    Filter,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { useSelector } from "react-redux";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading"
import { useGetAllBookingsQuery } from "../../../redux/api/bookingApi";

const statusColors = {
    "New": {
        bg: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)", // Indigo-Violet
        border: "#6366F1",
        text: "#ffffff"
    },
    "Accepted": {
        bg: "linear-gradient(135deg, #14B8A6 0%, #2DD4BF 100%)", // Teal
        border: "#14B8A6",
        text: "#ffffff"
    },
    "On Route": {
        bg: "linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)", // Yellow-Gold
        border: "#F59E0B",
        text: "#1F2937"
    },
    "At Location": {
        bg: "linear-gradient(135deg, #3B82F6 0%, #93C5FD 100%)", // Light Blue
        border: "#3B82F6",
        text: "#ffffff"
    },
    "Ride Started": {
        bg: "linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)", // Sky Blue
        border: "#0EA5E9",
        text: "#ffffff"
    },
    "Late Cancel": {
        bg: "linear-gradient(135deg, #DC2626 0%, #F87171 100%)", // Bright Red
        border: "#DC2626",
        text: "#ffffff"
    },
    "No Show": {
        bg: "linear-gradient(135deg, #9333EA 0%, #C084FC 100%)", // Deep Purple
        border: "#9333EA",
        text: "#ffffff"
    },
    "Completed": {
        bg: "linear-gradient(135deg, #22C55E 0%, #86EFAC 100%)", // Bright Green
        border: "#22C55E",
        text: "#ffffff"
    },
    "Cancel": {
        bg: "linear-gradient(135deg, #6B7280 0%, #D1D5DB 100%)", // Soft Gray
        border: "#6B7280",
        text: "#ffffff"
    }
};

const BookingCalendar = () => {
    const user = useSelector((state) => state.auth.user);
    const { data: bookingsData, isLoading, error } = useGetAllBookingsQuery(user?.companyId);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [hoveredEvent, setHoveredEvent] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [processedBookings, setProcessedBookings] = useState([]);

    useEffect(() => {
        if (bookingsData?.bookings) {
            const processed = bookingsData.bookings.flatMap((booking) => {
                const entries = [];

                if (booking.primaryJourney?.date) {
                    const fare = booking.journeyFare ?? booking.primaryJourney?.fare ?? 0;
                    entries.push({
                        id: booking._id,
                        date: new Date(booking.primaryJourney.date).toISOString().split("T")[0],
                        time: `${String(booking.primaryJourney.hour).padStart(2, "0")}:${String(booking.primaryJourney.minute).padStart(2, "0")}`,
                        pickup: booking.primaryJourney.pickup || "N/A",
                        dropoff: booking.primaryJourney.dropoff || "N/A",
                        fare: booking.journeyFare,
                        status: booking.status || "New",
                        passenger: booking.passenger.name,
                        vehicle: booking.vehicleType || "N/A",
                        bookingId: booking.bookingId,
                        journeyType: "Primary"
                    });
                }

                if (booking.returnJourneyToggle && booking.returnJourney?.date) {
                    const fare = booking.returnJourneyFare ?? booking.returnJourney?.fare ?? 0;
                    entries.push({
                        id: `${booking._id}_return`,
                        date: new Date(booking.returnJourney.date).toISOString().split("T")[0],
                        time: `${String(booking.returnJourney.hour).padStart(2, "0")}:${String(booking.returnJourney.minute).padStart(2, "0")}`,
                        pickup: booking.returnJourney.pickup || "N/A",
                        dropoff: booking.returnJourney.dropoff || "N/A",
                        fare: booking.returnJourneyFare,
                        status: booking.status || "New",
                        passenger: booking.passenger.name,
                        vehicle: booking.vehicleType || "N/A",
                        bookingId: booking.bookingId,
                        journeyType: "Return"
                    });
                }

                return entries;
            });

            setProcessedBookings(processed);
        }
    }, [bookingsData]);


    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
        for (let i = 1; i <= lastDay.getDate(); i++) days.push(i);

        return days;
    };

    const getBookingsForDate = (day) => {
        if (!day) return [];
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return processedBookings.filter(booking => booking.date === dateStr);
    };

    const filteredBookings = selectedStatus === "All"
        ? processedBookings
        : processedBookings.filter(booking => booking.status === selectedStatus);

    const navigateMonth = (offset) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset));
    };

    const handleMouseMove = (e) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const totalRevenue = filteredBookings.reduce((sum, booking) => sum + booking.fare, 0);
    const completedTrips = filteredBookings.filter(b => b.status === "Completed").length;

    return (
        <>
            <OutletHeading name="Booking Calendar" />
            <div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">

                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full md:w-auto px-4 py-2 rounded-lg border border-[var(--light-gray)] bg-white shadow-sm focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="All">All Status</option>
                            {Object.keys(statusColors).map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4  xl:grid-cols-9  space-x-1">
                        {Object.entries(statusColors).map(([status, colors]) => (
                            <div key={status} className="flex items-center space-x-2">
                                <div
                                    className="w-4 h-4 rounded-full  border-2 shadow-sm"
                                    style={{ background: colors.bg, borderColor: colors.border }}
                                />
                                <span className="text-sm   font-medium text-gray-700">{status}</span>
                            </div>
                        ))}
                    </div>
                </div>





                {/* Legend */}


                {/* Main Calendar */}
                <section className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-x-auto">
                    {isLoading ? (
                        <div className="py-20 flex justify-center items-center gap-4">
                            <div className="animate-spin h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full" />
                            <p className="text-gray-600">Loading bookings...</p>
                        </div>
                    ) : error ? (
                        <div className="py-20 text-center text-red-500">
                            <h3 className="text-lg font-semibold">Error loading bookings</h3>
                            <p>{error.message || "Unexpected error occurred."}</p>
                        </div>
                    ) : (
                        <div className="p-4 sm:p-6">
                            {/* Calendar Header */}
                            <div className="flex justify-between items-center mb-6">
                                <button
                                    onClick={() => navigateMonth(-1)}
                                    className="p-2 rounded-lg bg-gradient-to-r from-orange-400 to-red-500 text-white hover:scale-105"
                                >
                                    <ChevronLeft />
                                </button>
                                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </h2>
                                <button
                                    onClick={() => navigateMonth(1)}
                                    className="p-2 rounded-lg bg-gradient-to-r from-orange-400 to-red-500 text-white hover:scale-105"
                                >
                                    <ChevronRight />
                                </button>
                            </div>
                            {/* Weekdays */}
                            <div className="grid grid-cols-7 gap-1 mb-2 text-xs sm:text-sm">
                                {dayNames.map((day) => (
                                    <div key={day} className="text-center font-semibold p-2 rounded-lg bg-gradient-to-r from-orange-400 to-red-500 text-white">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Dates Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {getDaysInMonth(currentDate).map((day, index) => {
                                    const dayBookings = getBookingsForDate(day);
                                    const displayedBookings =
                                        selectedStatus === "All"
                                            ? dayBookings
                                            : dayBookings.filter((b) => b.status === selectedStatus);

                                    return (
                                        <div
                                            key={index}
                                            className={`min-h-32 p-2 border rounded-lg ${day ? "bg-white hover:bg-gray-50 cursor-pointer" : "bg-gray-50"} ${displayedBookings.length > 0 ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-200" : ""
                                                }`}
                                            onClick={() => day && setHoveredEvent(null)}
                                        >
                                            {day && (
                                                <>
                                                    <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">{day}</div>
                                                    <div className="space-y-1">
                                                        {displayedBookings.slice(0, 3).map((booking) => (
                                                            <div
                                                                key={booking.id}
                                                                className="text-xs p-2 rounded-md shadow-sm cursor-pointer hover:scale-105 transition truncate"
                                                                style={{
                                                                    background: statusColors[booking.status]?.bg,
                                                                    color: statusColors[booking.status]?.text,
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    setHoveredEvent(booking);
                                                                    handleMouseMove(e);
                                                                }}
                                                                onMouseLeave={() => setHoveredEvent(null)}
                                                            >
                                                                <div className="flex items-center space-x-1 mb-1 truncate">
                                                                    <Clock className="h-4 w-4" />
                                                                    <span className="text-sm">{booking.time}</span>
                                                                    {booking.journeyType === "Return" && (
                                                                        <span className="text-sm bg-red-300 text-black px-1 rounded">Return</span>
                                                                    )}
                                                                    {booking.journeyType === "Primary" && (
                                                                        <span className="text-sm bg-red-300 text-black px-1 rounded">Primary</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center space-x-1 truncate">
                                                                    <MapPin className="h-4 w-4" />
                                                                    <span className="truncate">{booking.pickup}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {displayedBookings.length > 3 && (
                                                            <div className="text-xs text-center text-gray-500">
                                                                +{displayedBookings.length - 3} more
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </section>

                {/* Tooltip */}
                {hoveredEvent && (
                    <div
                        className="fixed z-50 pointer-events-none"
                        style={{ top: mousePosition.y + 10, left: mousePosition.x + 10 }}
                    >
                        <div className="bg-white shadow-lg border p-4 rounded-lg max-w-xs sm:max-w-sm text-xs space-y-1">
                            <div className="flex justify-between items-center">
                                <span
                                    className="font-bold px-2 py-1 rounded"
                                    style={{
                                        background: statusColors[hoveredEvent.status]?.bg,
                                        color: statusColors[hoveredEvent.status]?.text,
                                    }}
                                >
                                    {hoveredEvent.status}
                                </span>
                                <span className="text-gray-500">{hoveredEvent.time}</span>
                            </div>
                            <p><strong>Pickup:</strong> {hoveredEvent.pickup}</p>
                            <p><strong>Dropoff:</strong> {hoveredEvent.dropoff}</p>
                            <p><strong>Passenger:</strong> {hoveredEvent.passenger}</p>
                            <p><strong>Booking ID:</strong> {hoveredEvent.bookingId}</p>
                            <p><strong>Journey:</strong> {hoveredEvent.journeyType}</p>
                            <p className="font-bold text-green-600">£{hoveredEvent.fare.toFixed(2)}</p>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
                    <StatCard
                        label="Total Bookings"
                        value={filteredBookings.length}
                        icon={<Users className="h-6 w-6 text-white" />}
                        color="from-blue-500 to-purple-600"
                    />
                    <StatCard
                        label="Total Revenue"
                        value={`£${totalRevenue.toFixed(2)}`}
                        icon={<DollarSign className="h-6 w-6 text-white" />}
                        color="from-green-500 to-teal-600"
                    />
                    <StatCard
                        label="Completed Trips"
                        value={completedTrips}
                        icon={<Calendar className="h-6 w-6 text-white" />}
                        color="from-orange-500 to-red-600"
                    />
                </section>
            </div>
        </>
    );
};

const StatCard = ({ label, value, icon, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg border">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-600">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`p-3 rounded-lg bg-gradient-to-r ${color}`}>
                {icon}
            </div>
        </div>
    </div>
);

export default BookingCalendar;
