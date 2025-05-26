import React from "react";
import WidgetBooking from "./WidgetBooking"
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import { useSelector } from "react-redux";

const WidgetAPI = () => {
    const user = useSelector((state) => state.auth.user);
    const companyId = user?.companyId || "";

    const iframeCode = `<iframe id="widgetFrame" src="http://localhost:5173/widget-form?company=${companyId}" width="100%" style="border: none;"></iframe>`;

    return (
        <div>
            <div className="mb-6">
                <OutletHeading name="🔌 Widget / API Integration" />
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
        </div>
    );
};

export default WidgetAPI;