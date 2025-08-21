import React, { useEffect, useRef, useState } from "react";

const SelectedSearch = ({
  selected,
  setSelected,
  statusList,
  placeholder,
  showCount = true,
}) => {
  const dropdownRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [])
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
    <div ref={dropdownRef}  className="relative inline-block text-left w-full">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="border px-3 py-1 rounded bg-white cursor-pointer border-[var(--light-gray)] w-full text-left"
      >
        {selected.length === 0
          ? placeholder || "Select"
          : `${selected.length} Selected`}
      </button>

      {dropdownOpen && (
        <div className="absolute z-10 mt-2 bg-white border rounded border-[var(--light-gray)] shadow-md max-h-72 overflow-y-auto w-full">
          <div className="p-2 border-b border-[var(--light-gray)]">
            <input
              type="text"
              placeholder="Search"
              className="custom_input"
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
