import React from "react";
import { ChevronDown } from "lucide-react";
import classNames from "classnames";

const STATUS_OPTIONS = [
    "Accepted",
    "On Route",
    "At Location",
    "Ride Started",
    "Late Cancel",
    "No Show",
    "Completed",
    "Cancel",
];

const SelectStatus = ({ value, onChange }) => {
    return (
        <div className="relative inline-block w-48">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={classNames(
                    "w-full appearance-none px-3 py-1.5 pr-8 rounded-lg text-sm font-medium shadow-sm",
                    "",
                    "bg-white text-gray-800"
                )}
            >
                {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                        {status}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
    );
};

export default SelectStatus;
