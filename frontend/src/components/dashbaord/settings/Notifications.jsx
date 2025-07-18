import React, { useState } from "react";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const Notifications = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState("Yes");
  const [serverKey, setServerKey] = useState("");
  const [firebaseConfig, setFirebaseConfig] = useState("");

  const handleSubmit = () => {
    // Add your update logic here
    console.log("Updated Notification Settings");
  };

  return (
    <div>
      <OutletHeading name="Notifications Settings" />
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enable Notifications
        </label>
        <select
          className="w-full border border-[var(--light-gray)] rounded px-3 py-2"
          value={notificationsEnabled}
          onChange={(e) => setNotificationsEnabled(e.target.value)}
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>

      <div className="border rounded p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Firebase</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Server Key
          </label>
          <input
            type="text"
            value={serverKey}
            onChange={(e) => setServerKey(e.target.value)}
            className="w-full border border-[var(--light-gray)] rounded px-3 py-2"
            placeholder="Enter Server Key"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Config
          </label>
          <textarea
            value={firebaseConfig}
            onChange={(e) => setFirebaseConfig(e.target.value)}
            rows={8}
            className="w-full border border-[var(--light-gray)] rounded px-3 py-2 font-mono text-sm"
          />
        </div>
      </div>

      <button onClick={handleSubmit} className="btn btn-reset">
        UPDATE
      </button>
    </div>
  );
};

export default Notifications;
