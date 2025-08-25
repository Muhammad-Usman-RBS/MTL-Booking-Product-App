import React from "react";
import Icons from "../../../../assets/icons";

const JourneySummaryCard = ({
    formData,
    returnFormData,
    showReturnBooking,
    matchedSurcharge,
    durationText,
    distanceText,
    currencySymbol = '£',
    currencyCode = 'GBP',
}) => {
    /* ---------- helpers ---------- */
    const renderArrivalTime = () => {
        if (!formData?.hour || !formData?.minute || !durationText) return "-";
        const dep = new Date();
        dep.setHours(+formData.hour);
        dep.setMinutes(+formData.minute);

        // parse "2 hours 30 mins" etc.
        const parts = durationText.split(" ");
        for (let i = 0; i < parts.length; i += 2) {
            const val = parseInt(parts[i], 10);
            const unit = parts[i + 1];
            dep.setMinutes(
                dep.getMinutes() + (unit.startsWith("hour") ? val * 60 : val)
            );
        }
        return dep.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    };

    /* ---------- ui ---------- */
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-md p-6 w-full">
            {/* date + time */}
            <div className="text-center mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                    {formData?.date
                        ? new Date(formData.date).toLocaleDateString("en-UK", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric"
                        })
                        : "Date not selected"}
                </h3>

                <div className="text-xl font-semibold text-gray-900">
                    {formData?.hour && formData?.minute
                        ? `${String(formData.hour).padStart(2, "0")}:${String(
                            formData.minute
                        ).padStart(2, "0")} ${formData.hour < 12 ? "AM" : "PM"}`
                        : "Time not set"}
                    {/* <span className="text-sm text-gray-500">&nbsp;(GMT+1)</span> */}
                    <span className="text-sm text-gray-500">&nbsp;({currencyCode})</span>
                </div>


            </div>

            {/* outbound journey row */}
            <JourneyRow
                pickup={formData?.pickup}
                doorNumber={formData?.doorNumber}
                dropList={[
                    formData?.dropoff,
                    formData?.additionalDropoff1,
                    formData?.additionalDropoff2
                ]}
                arrivefrom={formData?.arrivefrom}
            />

            {/* return journey row (optional) */}
            {showReturnBooking && (
                <JourneyRow
                    isReturn
                    pickup={returnFormData?.pickup}
                    doorNumber={returnFormData?.pickupDoorNumber}
                    dropList={[
                        returnFormData?.dropoff,
                        returnFormData?.additionalDropoff1,
                        returnFormData?.additionalDropoff2
                    ]}
                    arrivefrom={returnFormData?.arrivefrom}
                />
            )}

            {/* distance / duration strip */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 mt-4 text-sm text-[var(--dark-gray)] px-2">
                {durationText && (
                    <span>
                        Estimated arrival at&nbsp;
                        <strong className="text-gray-800">{renderArrivalTime()}</strong>
                        &nbsp;(GMT+1)
                    </span>
                )}
                <div className="flex gap-3 items-center">
                    {distanceText && (
                        <IconStat icon={Icons.MapPin} label={distanceText} />
                    )}
                    {durationText && (
                        <IconStat icon={Icons.Clock} label={durationText} />
                    )}
                </div>
            </div>
        </div>
    );
};

/* ------------ tiny helpers below -------------- */

const JourneyRow = ({
    isReturn = false,
    pickup,
    doorNumber,
    dropList,
    arrivefrom
}) => (
    <div
        className={`flex flex-col md:flex-row items-center justify-between gap-6 mt-4 px-5 py-4 bg-white border-2 border-dashed border-gray-400 rounded-xl shadow-sm`}
    >
        {/* Pickup section */}
        <div className="flex items-center gap-3 w-full md:w-auto min-w-[220px]">
            <Icons.PlaneTakeoff className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
                <p className="font-semibold text-sm text-red-800">
                    {pickup || "Pickup Location"}
                </p>
                <p className="text-xs text-gray-500">
                    {doorNumber ? `Door No. ${doorNumber}` : "All Terminals"}
                </p>
            </div>
        </div>

        {/* Arrow separator */}
        <div className="text-[var(--light-gray)] text-3xl hidden md:block select-none">→</div>

        {/* Dropoff section */}
        <div className="flex flex-col items-end gap-3 w-full md:w-auto min-w-[220px] justify-end text-right">
            {dropList.filter(Boolean).map((loc, idx, arr) => (
                <div key={idx} className="flex items-center justify-end gap-3">
                    <div>
                        <p className="font-semibold text-sm text-green-800">{loc}</p>
                        {idx === arr.length - 1 && (
                            <p className="text-xs text-gray-400 italic">
                                {arrivefrom
                                    ? `From: ${arrivefrom}`
                                    : isReturn
                                        ? "Return Destination"
                                        : "Destination"}
                            </p>
                        )}
                    </div>
                    <Icons.PlaneLanding className="w-6 h-6 text-green-500 flex-shrink-0" />
                </div>
            ))}
        </div>
    </div>
);

const IconStat = ({ icon: Icon, label }) => (
    <div className="flex items-center gap-1">
        <Icon className="w-4 h-4 text-blue-500" />
        <span>{label}</span>
    </div>
);

export default JourneySummaryCard;
