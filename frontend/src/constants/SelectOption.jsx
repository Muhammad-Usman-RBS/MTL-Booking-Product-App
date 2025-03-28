import React, { useState } from "react";
import Icons from "../assets/icons";

const SelectOption = ({ options, label }) => {
  const [selected, setSelected] = useState(options[0]);
  const [isOpen, setIsOpen] = useState(false);

  const handleFocus = () => setIsOpen(true);
  const handleBlur = () => setIsOpen(false);

  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-32 appearance-none px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
        >
          {options.map((option, idx) => (
            <option key={idx} value={option}>
              {option}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
          <Icons.ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default SelectOption;
