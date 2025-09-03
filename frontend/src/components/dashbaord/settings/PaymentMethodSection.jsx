import React from "react";
import Icons from "../../../assets/icons";

const PaymentMethodSection = ({
    name,
    checked,
    setChecked,
    isLive,
    toggleLive,
    fields,
    onFieldChange,
}) => {
    
    const handleCopy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            // You can add a toast notification here
            console.log("Copied to clipboard:", text);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleFieldChange = (fieldLabel, value) => {
        if (onFieldChange) {
            onFieldChange(fieldLabel, value);
        }
    };

    return (
        <div className="border border-[var(--light-gray)] rounded-t-lg overflow-hidden">
            <div className="bg-theme text-theme px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => setChecked(!checked)}
                            className="w-3 h-3 accent-white mt-2 bg-white border-2 border-[var(--light-gray)] rounded cursor-pointer transform transition-transform hover:scale-110"
                        />
                    </div>
                    <span className="font-thin lg:text-md text-sm break-words leading-tight">
                        {name}
                    </span>

                    <button
                        className={`relative inline-flex lg:h-4 lg:w-9 w-8 h-4 items-center rounded-full transition-all duration-300 transform hover:scale-105 ${
                            isLive ? "bg-blue-500" : "bg-gray-200"
                        }`}
                        onClick={toggleLive}
                    >
                        <span
                            className={`inline-block h-3 w-3 transform rounded-full transition-all duration-300 ${
                                isLive ? "translate-x-5 bg-white" : "translate-x-1 bg-gray-400"
                            }`}
                        ></span>
                    </button>
                    <span className="text-sm font-medium">Live mode</span>
                </div>
            </div>

            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {fields.map(
                        (
                            { label, value = "", widthClass = "w-full", copyable = false },
                            idx
                        ) => (
                            <div key={idx}>
                                <div className="flex rounded-t-md justify-between items-center text-sm font-semibold text-[var(--dark-gray)] bg-gray-300 px-3 py-2 border-b border-[var(--light-gray)]">
                                    <span>{label}</span>
                                    {copyable && (
                                        <button 
                                            className="flex items-center cursor-pointer text-sm gap-1 hover:text-blue-600 transition-colors"
                                            onClick={() => handleCopy(value)}
                                        >
                                            <Icons.Copy className="h-4 w-4" />
                                            Copy
                                        </button>
                                    )}
                                </div>

                                <div className="relative">
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => handleFieldChange(label, e.target.value)}
                                        className="w-full px-3 text-sm py-2 text-gray-800 bg-white border border-[var(--light-gray)] focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder={`Enter ${label.toLowerCase()}`}
                                    />
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentMethodSection;