import React from "react";
import WidgetBooking from "./WidgetBooking"

const WidgetAPI = () => {
  const iframeCode = `<iframe src="https://www.megatransfers.com/booking-form.php" class="iframe-responsive" style="width:100%;min-height:550px" title="Book Now"></iframe>`;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-600 mb-2">
          🔌 Widget / API Integration
        </h2>
        <p className="text-gray-600 mt-1 text-sm sm:text-base ps-2">
          Use the following iframe code to embed your booking form on any
          website.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow p-5 mb-10">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          iFrame Widget:
        </label>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto text-gray-800">
          <code>{iframeCode}</code>
        </pre>
      </div>
      <WidgetBooking />
    </div>
  );
};

export default WidgetAPI;
