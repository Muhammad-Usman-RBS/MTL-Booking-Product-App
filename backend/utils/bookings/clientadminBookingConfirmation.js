export const clientadminBookingConfirmation = ({
    booking,
    company = {},
    clientAdmin = {},
} = {}) => {
    if (!booking) {
        throw new Error("clientadminBookingConfirmation: booking is required");
    }

    const timeHour =
        booking?.primaryJourney?.hour ??
        booking?.returnJourney?.hour ??
        "--";

    const timeMinute = String(
        booking?.primaryJourney?.minute ??
        booking?.returnJourney?.minute ??
        0
    ).padStart(2, "0");

    const date =
        booking?.primaryJourney?.date ||
        booking?.returnJourney?.date ||
        "-";

    const data = {
        Booking: {
            id: booking.bookingId,
            status: booking.status,
            source: booking.source,
            mode: booking.mode,
            referrer: booking.referrer,
            date,
            time: `${timeHour}:${timeMinute}`,
            createdAt: booking.createdAt || null,
            returnJourneyToggle: !!booking.returnJourneyToggle,
        },
        Company: {
            name: company?.companyName || company?.tradingName || "",
            email: company?.email || "",
            phone: company?.contact || "",
            website: company?.website || "",
            address: company?.address || "",
        },
        ClientAdmin: {
            name: clientAdmin?.name || "",
            email: clientAdmin?.email || "",
            phone: clientAdmin?.contact || clientAdmin?.phone || "",
        },
        Passenger: {
            name: booking?.passenger?.name || "Guest",
            email: booking?.passenger?.email || "-",
            phone: booking?.passenger?.phone || "-",
        },
        Vehicle: {
            name: booking?.vehicle?.vehicleName || "Standard",
            passengers: booking?.vehicle?.passenger || 0,
            childSeat: booking?.vehicle?.childSeat || 0,
            handLuggage: booking?.vehicle?.handLuggage || 0,
            checkinLuggage: booking?.vehicle?.checkinLuggage || 0,
        },
        PrimaryJourney: booking?.primaryJourney || null,
        ReturnJourney: booking?.returnJourneyToggle ? booking?.returnJourney || null : null,
        Payment: {
            method: booking.paymentMethod,
            gateway: booking.paymentGateway || "-",
            cardPaymentReference: booking.cardPaymentReference || "-",
            totals: {
                journeyFare: Number(booking.journeyFare || 0).toFixed(2),
                returnJourneyFare: Number(booking.returnJourneyFare || 0).toFixed(2),
                driverFare: Number(booking.driverFare || 0).toFixed(2),
                returnDriverFare: Number(booking.returnDriverFare || 0).toFixed(2),
            },
            voucher: {
                applied:
                    !!booking.primaryJourney?.voucherApplied ||
                    !!booking.returnJourney?.voucherApplied ||
                    false,
                code:
                    booking.primaryJourney?.voucher ||
                    booking.returnJourney?.voucher ||
                    "-",
            },
        },
        Notes: {
            primary: booking.primaryJourney?.notes || "",
            return: booking.returnJourney?.notes || "",
            internalPrimary: booking.primaryJourney?.internalNotes || "",
            internalReturn: booking.returnJourney?.internalNotes || "",
        },
    };

    const subject = `New Booking Received #${booking.bookingId}`;
    const title = "New Booking Received";
    const subtitle = `Booking #${booking.bookingId} — ${date} at ${timeHour}:${timeMinute}`;

    return { subject, title, subtitle, data };
};