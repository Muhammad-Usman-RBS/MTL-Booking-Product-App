import React, { useState } from "react";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const CronJob = () => {
  const [autoAllocChecked, setAutoAllocChecked] = useState(false);
  const [reviewChecked, setReviewChecked] = useState(true);
  const [docExpiryChecked, setDocExpiryChecked] = useState(false);
  const [statementChecked, setStatementChecked] = useState(false);

  return (
    <div>
      <OutletHeading name="Cron Job (Scheduled Tasks)" />
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">
            Cron Command:
          </label>
          <div className="flex items-center mt-1">
            <input
              type="text"
              value="wget -q -O- https://www.megatransfers.com/cron/"
              readOnly
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <button className="text-green-600 text-sm mt-2">
            Run Cron Manually
          </button>
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700">
            Cron Style:
          </label>
          <input
            type="text"
            value="*/1 * * * *"
            readOnly
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm mt-1"
          />
        </div>

        {/* Auto Allocation */}
        <div className="mb-4 border rounded overflow-hidden">
          <div className="bg-gray-700 text-white px-4 py-2 flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={autoAllocChecked}
              onChange={() => setAutoAllocChecked(!autoAllocChecked)}
            />
            Auto Allocation
          </div>
          {autoAllocChecked && (
            <div className="p-4 space-y-4">
              <div className="flex space-x-2">
                <SelectOption
                  options={["0 hours", "1 hour", "2 hours"]}
                  value="0 hours"
                />
                <SelectOption
                  options={["before pickup time", "after pickup time"]}
                  value="before pickup time"
                />
              </div>
              <div className="flex space-x-4">
                <label>
                  <input type="checkbox" className="mr-1" /> SMS
                </label>
                <label>
                  <input type="checkbox" defaultChecked className="mr-1" />
                  bookingRestrictionData Email
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="mb-4 border rounded overflow-hidden">
          <div className="bg-gray-700 text-white px-4 py-2 flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={reviewChecked}
              onChange={() => setReviewChecked(!reviewChecked)}
            />
            Reviews
          </div>
          {reviewChecked && (
            <div className="p-4 space-y-4">
              <div className="flex space-x-2">
                <SelectOption
                  options={["1 hours", "2 hours"]}
                  value="1 hours"
                />
                <p className="text-sm text-gray-700 mt-2">
                  after pickup time &amp; "Completed" status
                </p>
              </div>
              <div className="flex space-x-4">
                <label>
                  <input type="checkbox" className="mr-1" /> SMS
                </label>
                <label>
                  <input type="checkbox" defaultChecked className="mr-1" />
                  bookingRestrictionData Email
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Driver documents expiration */}
        <div className="mb-4 border rounded overflow-hidden">
          <div className="bg-gray-700 text-white px-4 py-2 flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={docExpiryChecked}
              onChange={() => setDocExpiryChecked(!docExpiryChecked)}
            />
            Driver documents expiration
          </div>
          {docExpiryChecked && (
            <div className="p-4 space-y-4">
              <div className="flex space-x-2 items-center">
                <p className="text-sm text-gray-700">Daily:</p>
                <SelectOption
                  options={["16:00 - 17:00", "17:00 - 18:00"]}
                  value="16:00 - 17:00"
                />
              </div>
              <div className="flex space-x-4">
                <label>
                  <input type="checkbox" className="mr-1" /> SMS
                </label>
                <label>
                  <input type="checkbox" className="mr-1" /> Email
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Driver Statement */}
        <div className="mb-6 border rounded overflow-hidden">
          <div className="bg-gray-700 text-white px-4 py-2 flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={statementChecked}
              onChange={() => setStatementChecked(!statementChecked)}
            />
            Driver statement
          </div>
          {statementChecked && (
            <div className="p-4 space-y-4">
              <div className="flex space-x-2">
                <SelectOption options={["Weekly", "Monthly"]} value="Weekly" />
                <SelectOption options={["Monday", "Tuesday"]} value="Monday" />
                <SelectOption
                  options={["01:00 - 02:00", "02:00 - 03:00"]}
                  value="01:00 - 02:00"
                />
              </div>
              <div className="flex space-x-4">
                <label>
                  <input type="checkbox" className="mr-1" /> SMS
                </label>
                <label>
                  <input type="checkbox" className="mr-1" /> Email
                </label>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => alert("Cron job settings updated")}
          className="btn btn-reset"
        >
          UPDATE
        </button>
      </div>
    </div>
  );
};

export default CronJob;
