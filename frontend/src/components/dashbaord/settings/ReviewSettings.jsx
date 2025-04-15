import React, { useState } from "react";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import { toast } from "react-toastify";

const ReviewSettings = () => {
  const [subject, setSubject] = useState("Share your experience - !ORDER_NO!");
  const [template, setTemplate] = useState(`Dear !PASSENGER_NAME!,

Thank you for choosing Mega Transfers Limited for your journey !ORDER_NO! on !PICKUP_DATE_TIME!.

We hope the journey was to your satisfaction and we appreciate your suggestions to improve our service. 

Would you like to share your experience with us via following link:

https://g.page/r/CUFVH1EVOz6iEAI/review

We consider all positive and negative feedbacks, it helps us to continuously improve our standards.

If you have any questions or you would like to share any suggestions please email us on Bookings@megatransfers.co.uk. 

We are looking forward to seeing you again.

Thank you 

Team Mega Transfers`);

  const handleUpdate = () => {
    toast.success("Review Settings Updated!");
  };

  return (
    <div>
      <OutletHeading name="Review Settings" />

      <div>
        {/* Review Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Review subject
          </label>
          <input
            type="text"
            className="custom_input w-full mt-1"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* Review Template */}
        <div>
          <label className="block text-sm font-medium mt-5 text-gray-700 mb-1">
            Review template
          </label>
          <textarea
            rows="15"
            className="custom_input w-full"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          />
        </div>

        {/* Update Button */}
        <button className="btn btn-edit mt-4" onClick={handleUpdate}>
          Update
        </button>
      </div>
    </div>
  );
};

export default ReviewSettings;
