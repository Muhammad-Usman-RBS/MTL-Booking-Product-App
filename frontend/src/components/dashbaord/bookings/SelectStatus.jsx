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
        <div className="relative inline-block ">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={classNames(
                    "w-fit max-w-[9rem] appearance-none pr-6 pl-2 py-1.5 focus:outline-none rounded-lg text-sm font-medium shadow-sm bg-white text-gray-800"
                )}
            >
                {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                        {status}
                    </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
        </div>
    );
};

export default SelectStatus;
