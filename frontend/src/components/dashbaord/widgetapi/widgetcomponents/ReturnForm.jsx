// import React from 'react';
// import OutletHeading from "../../../../constants/constantscomponents/OutletHeading";

// const ReturnForm = ({
//     formData = {},
//     returnFormData = {},
//     handleChange = () => { },
//     dropOffs = [],
// }) => {
//     return (
//         <>
//             <OutletHeading name="Return Journey Details" />
//             <div className='space-y-3'>
//                 <div className="relative">
//                     <label className="text-sm font-medium text-gray-400 mb-1 block">Pickup Location</label>
//                     <input
//                         type="text"
//                         name="pickup"
//                         value={formData.pickup}
//                         placeholder="Pickup Location"
//                         className="custom_input bg-gray-300"
//                         disabled
//                     />
//                 </div>

//                 {formData.pickup &&
//                     formData.pickup.toLowerCase().includes("airport") && (
//                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//                             <input
//                                 name="arrivefrom"
//                                 placeholder="Arriving From"
//                                 value={returnFormData.arrivefrom}
//                                 onChange={handleChange}
//                                 className="custom_input"
//                             />
//                             <input
//                                 name="pickmeAfter"
//                                 placeholder="Pick Me After"
//                                 value={returnFormData.pickmeAfter}
//                                 onChange={handleChange}
//                                 className="custom_input"
//                             />
//                             <input
//                                 name="flightNumber"
//                                 placeholder="Flight No."
//                                 value={returnFormData.flightNumber}
//                                 onChange={handleChange}
//                                 className="custom_input"
//                             />
//                         </div>
//                     )}

//                 {formData.pickup &&
//                     !formData.pickup.toLowerCase().includes("airport") && (
//                         <div className="grid grid-cols-1 gap-3">
//                             <input
//                                 name="pickupDoorNumber"
//                                 placeholder="Pickup Door No."
//                                 value={returnFormData.pickupDoorNumber || ""}
//                                 onChange={handleChange}
//                                 className="custom_input"
//                             />
//                         </div>
//                     )}

//                 {dropOffs.map((val, idx) => (
//                     <div key={idx} className="relative space-y-2">
//                         <label className="text-sm text-[var(--dark-gray)]">Drop Off {idx + 1}</label>
//                         <input
//                             type="text"
//                             value={val}
//                             placeholder={`Drop Off ${idx + 1}`}
//                             className="custom_input bg-gray-300"
//                             disabled
//                         />
//                     </div>
//                 ))}

//                 {dropOffs.some(loc => loc && loc.toLowerCase().includes("airport")) && (
//                     <div className="grid grid-cols-1 gap-3 mt-3">
//                         <input
//                             name="terminal"
//                             placeholder="Terminal No."
//                             value={returnFormData.terminal || ''}
//                             onChange={handleChange}
//                             className="custom_input"
//                         />
//                     </div>
//                 )}

//                 {dropOffs.some(loc => loc && !loc.toLowerCase().includes("airport")) && (
//                     <div className="grid grid-cols-1 gap-3 mt-3">
//                         <input
//                             name="dropoffDoorNumber"
//                             placeholder="Drop Off Door No."
//                             value={returnFormData.dropoffDoorNumber || ""}
//                             onChange={handleChange}
//                             className="custom_input"
//                         />
//                     </div>
//                 )}

//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//                     <input
//                         type="date"
//                         name="date"
//                         value={returnFormData.date}
//                         onChange={handleChange}
//                         className="custom_input"

//                     />
//                     <select
//                         name="hour"
//                         value={returnFormData.hour}
//                         onChange={handleChange}
//                         className="custom_input"
//                     >
//                         <option value="">HH</option>
//                         {[...Array(24).keys()].map((h) => (
//                             <option key={h} value={h}>
//                                 {h.toString().padStart(2, "0")}
//                             </option>
//                         ))}
//                     </select>
//                     <select
//                         name="minute"
//                         value={returnFormData.minute}
//                         onChange={handleChange}
//                         className="custom_input"
//                     >
//                         <option value="">MM</option>
//                         {[...Array(60).keys()].map((m) => (
//                             <option key={m} value={m}>
//                                 {m.toString().padStart(2, "0")}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 <textarea
//                     name="notes"
//                     placeholder="Notes"
//                     className="custom_input"
//                     value={returnFormData.notes}
//                     onChange={handleChange}
//                     rows={2}
//                 />

//             </div>
//         </>
//     )
// }

// export default ReturnForm











import React from 'react';
import { toast } from 'react-toastify';
import { useGetBookingSettingQuery } from "../../../../redux/api/bookingSettingsApi";
import OutletHeading from "../../../../constants/constantscomponents/OutletHeading";

const ReturnForm = ({
  formData = {},
  returnFormData = {},
  handleChange = () => {},
  dropOffs = [],
}) => {
  // booking settings (same as PrimaryForm)
  const { data: bookingSettingData, isFetching: isSettingLoading } =
    useGetBookingSettingQuery();

  // Advance booking validation (same behavior as PrimaryForm)
  const validateAdvanceBooking = (selectedDate, selectedHour, selectedMinute) => {
    const advance = bookingSettingData?.setting?.advanceBookingMin;
    if (!advance) return true;

    const { value, unit } = advance;
    if (!selectedDate || selectedHour === '' || selectedMinute === '') return true;

    const now = new Date();
    const bookingDateTime = new Date(
      `${selectedDate}T${selectedHour.toString().padStart(2, '0')}:${selectedMinute
        .toString()
        .padStart(2, '0')}:00`
    );

    let advanceTimeMs = 0;
    switch ((unit || '').toLowerCase()) {
      case 'hours':
      case 'hour':
        advanceTimeMs = value * 60 * 60 * 1000;
        break;
      case 'minutes':
      case 'minute':
        advanceTimeMs = value * 60 * 1000;
        break;
      case 'days':
      case 'day':
        advanceTimeMs = value * 24 * 60 * 60 * 1000;
        break;
      default:
        console.warn('Unknown time unit:', unit);
        return true;
    }

    const minBookingTime = new Date(now.getTime() + advanceTimeMs);

    if (bookingDateTime < minBookingTime) {
      const singular = (unit || '').toLowerCase().replace(/s$/, '');
      const timeText = value === 1 ? singular : singular + 's';
      toast.error(`Booking must be made at least ${value} ${timeText} in advance!`);
      return false;
    }

    return true;
  };

  // Ensure we validate against RETURN form state (bug fix)
  const handleChangeWithValidation = (e) => {
    const { name, value } = e.target;

    // Update parent state first
    handleChange(e);

    // If return date/time changed, validate using returnFormData (not formData)
    if (name === 'date' || name === 'hour' || name === 'minute') {
      // Let parent state settle
      setTimeout(() => {
        const updatedFormData = { ...returnFormData, [name]: value }; // <-- FIX
        validateAdvanceBooking(
          updatedFormData.date,
          updatedFormData.hour,
          updatedFormData.minute
        );
      }, 0);
    }
  };

  return (
    <>
      <OutletHeading name="Return Journey Details" />

      <div className="space-y-3">
        {/* Pickup (mirrors PrimaryForm read-only) */}
        <div className="relative">
          <label className="text-sm font-medium text-gray-400 mb-1 block">
            Pickup Location
          </label>
          <input
            type="text"
            name="pickup"
            value={formData.pickup}
            placeholder="Pickup Location"
            className="custom_input bg-gray-300"
            disabled
          />
        </div>

        {formData.pickup && formData.pickup.toLowerCase().includes("airport") && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              name="arrivefrom"
              placeholder="Arriving From"
              value={returnFormData.arrivefrom || ""}
              onChange={handleChange}
              className="custom_input"
            />
            <input
              name="pickmeAfter"
              placeholder="Pick Me After"
              value={returnFormData.pickmeAfter || ""}
              onChange={handleChange}
              className="custom_input"
            />
            <input
              name="flightNumber"
              placeholder="Flight No."
              value={returnFormData.flightNumber || ""}
              onChange={handleChange}
              className="custom_input"
            />
          </div>
        )}

        {formData.pickup && !formData.pickup.toLowerCase().includes("airport") && (
          <div className="grid grid-cols-1 gap-3">
            <input
              name="pickupDoorNumber"
              placeholder="Pickup Door No."
              value={returnFormData.pickupDoorNumber || ""}
              onChange={handleChange}
              className="custom_input"
            />
          </div>
        )}

        {dropOffs.map((val, idx) => (
          <div key={idx} className="relative space-y-2">
            <label className="text-sm text-[var(--dark-gray)]">Drop Off {idx + 1}</label>
            <input
              type="text"
              value={val}
              placeholder={`Drop Off ${idx + 1}`}
              className="custom_input bg-gray-300"
              disabled
            />
          </div>
        ))}

        {dropOffs.some((loc) => loc && loc.toLowerCase().includes("airport")) && (
          <div className="grid grid-cols-1 gap-3 mt-3">
            <input
              name="terminal"
              placeholder="Terminal No."
              value={returnFormData.terminal || ""}
              onChange={handleChange}
              className="custom_input"
            />
          </div>
        )}

        {dropOffs.some((loc) => loc && !loc.toLowerCase().includes("airport")) && (
          <div className="grid grid-cols-1 gap-3 mt-3">
            <input
              name="dropoffDoorNumber"
              placeholder="Drop Off Door No."
              value={returnFormData.dropoffDoorNumber || ""}
              onChange={handleChange}
              className="custom_input"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="date"
            name="date"
            value={returnFormData.date || ""}
            onChange={handleChangeWithValidation}
            className="custom_input"
            disabled={isSettingLoading}
          />
          <select
            name="hour"
            value={returnFormData.hour ?? ""}
            onChange={handleChangeWithValidation}
            className="custom_input"
            disabled={isSettingLoading}
          >
            <option value="">HH</option>
            {[...Array(24).keys()].map((h) => (
              <option key={h} value={h}>
                {h.toString().padStart(2, "0")}
              </option>
            ))}
          </select>
          <select
            name="minute"
            value={returnFormData.minute ?? ""}
            onChange={handleChangeWithValidation}
            className="custom_input"
            disabled={isSettingLoading}
          >
            <option value="">MM</option>
            {[...Array(60).keys()].map((m) => (
              <option key={m} value={m}>
                {m.toString().padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>

        <textarea
          name="notes"
          placeholder="Notes"
          className="custom_input"
          value={returnFormData.notes || ""}
          onChange={handleChange}
          rows={2}
        />
      </div>
    </>
  );
};

export default ReturnForm;
