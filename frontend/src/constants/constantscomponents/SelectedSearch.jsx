import React, { useState } from "react";

const SelectedSearch = ({
  selected,
  setSelected,
  statusList,
  placeholder,
  showCount = true,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const safeSelected = Array.isArray(selected) ? selected : [];

  const toggleCheckbox = (label) => {
    if (safeSelected.includes(label)) {
      setSelected(safeSelected.filter((item) => item !== label));
    } else {
      setSelected([...safeSelected, label]);
    }
  };

  const filteredStatuses = statusList.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative inline-block text-left w-full">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="border px-3 py-1 rounded bg-white cursor-pointer border-gray-300 w-full text-left"
      >
        {selected.length === 0
          ? placeholder || "Select"
          : `${selected.length} Selected`}
      </button>

      {dropdownOpen && (
        <div className="absolute z-10 mt-2 bg-white border rounded border-gray-300 shadow-md max-h-72 overflow-y-auto w-full">
          <div className="p-2 border-b border-gray-300">
            <input
              type="text"
              placeholder="Search"
              className="w-full px-2 py-1 border rounded text-sm border-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="p-2 space-y-1 text-sm">
            {filteredStatuses.map((item, idx) => {
              const value = item.value || item.label;

              return (
                <label
                  key={idx}
                  className="flex items-center justify-between hover:bg-gray-100 p-1 rounded cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={safeSelected.includes(value)}
                      onChange={() => toggleCheckbox(value)}
                    />

                    <span>{item.label}</span>
                  </div>
                  {showCount && (
                    <span className="text-gray-500 text-xs">
                      ({item.count || 0})
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectedSearch;
