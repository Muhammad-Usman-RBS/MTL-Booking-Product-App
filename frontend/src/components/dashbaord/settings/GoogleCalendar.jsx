import React, { useState } from "react";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import SelectOption from "../../../constants/constantscomponents/SelectOption";

const GoogleCalendar = () => {
  const [calendarEnabled, setCalendarEnabled] = useState("No");
  const [calendarId, setCalendarId] = useState("");
  const [calendarJSON, setCalendarJSON] = useState("");

  const handleUpdate = () => {
    console.log("Google Calendar settings updated");
  };

  return (
    <div>
      <OutletHeading name="Google Calendar" />

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Google Calendar
        </label>
        <SelectOption label="Type" width="full" options={["Yes", "No"]} />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Google Calendar ID
        </label>
        <input
          type="text"
          value={calendarId}
          onChange={(e) => setCalendarId(e.target.value)}
          className="w-full border border-[var(--light-gray)] rounded px-3 py-2"
          placeholder="Enter Google Calendar ID"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Google Calendar JSON
        </label>
        <textarea
          rows={10}
          value={calendarJSON}
          onChange={(e) => setCalendarJSON(e.target.value)}
          className="w-full border border-[var(--light-gray)] rounded px-3 py-2 font-mono text-sm"
          placeholder="Paste Google Calendar service account JSON here"
        />
      </div>

      <button onClick={handleUpdate} className="btn btn-reset">
        UPDATE
      </button>
    </div>
  );
};

export default GoogleCalendar;
