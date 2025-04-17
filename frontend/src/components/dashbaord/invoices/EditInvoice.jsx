import React, { useState } from "react";
import { Link } from "react-router-dom";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import SelectOption from "../../../constants/constantscomponents/SelectOption";

const InvoicePage = () => {
  const [selectAll, setSelectAll] = useState(false);
  const [checkedItems, setCheckedItems] = useState({
    item1: false,
    item2: false,
  });

  const [item1Details, setItem1Details] = useState(
    `22122323 - Erin Leahy\nPickup: London Stansted Airport (STN)\n\nDrop off: 32 The Bishops Ave, London N2 0BA, UK`
  );
  const [item2Details, setItem2Details] = useState(
    `22122649 - Peter Griffitl\nPickup: Tring Station Car Park, Station Road, Tring, Tring Station\n\nDrop off: London Coliseum, St Martin`
  );

  const handleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    setCheckedItems({
      item1: newValue,
      item2: newValue,
    });
  };

  const handleCheckboxChange = (item) => {
    const updated = {
      ...checkedItems,
      [item]: !checkedItems[item],
    };
    setCheckedItems(updated);
    setSelectAll(Object.values(updated).every(Boolean));
  };

  return (
    <>
      <OutletHeading name="Edit Invoice" />

      <div className="p-2 md:p-6 max-w-6xl mx-auto bg-gradient-to-b from-gray-50 to-white shadow-md rounded-3xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-xl font-extrabold text-gray-600 pt-3 pb-3">
            Invoice #INV-000001
          </h1>
          <Link to="/dashboard/invoices/list">
            <button className="btn btn-reset">Back to Invoices</button>
          </Link>
        </div>

        <div className="bg-white p-2 md:p-6 rounded-2xl shadow mb-6 border">
          <label className="block font-bold text-gray-700 mb-2 text-lg">
            Bill To
          </label>
          <textarea
            className="custom_input"
            rows={3}
            defaultValue={`Cabhit\nranaw43500@khaxan.com\n+447930844247`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Invoice Date
            </label>
            <input
              type="date"
              className="custom_input"
              defaultValue="2023-01-04"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              className="custom_input"
              defaultValue="2023-01-11"
            />
          </div>
        </div>

        <div className="bg-white p-2 md:p-6 rounded-2xl shadow mb-6 border">
          {/* Top Row: Select All & Global Apply */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3 text-blue-800 font-semibold">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="accent-blue-600"
              />
              <span>Select All</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <SelectOption
                width="w-full md:w-32"
                options={["No Tax", "Tax"]}
              />
              <button className="btn btn-reset w-full sm:w-auto">Apply</button>
            </div>
          </div>

          {/* Each Item Block */}
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row gap-4 items-start md:items-center border-t pt-4 mt-4"
            >
              {/* Checkbox */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={checkedItems[`item${i}`]}
                  onChange={() => handleCheckboxChange(`item${i}`)}
                  className="accent-blue-600"
                />
              </div>

              {/* Textarea */}
              <div className="flex-1 w-full text-sm text-gray-700">
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={i === 1 ? item1Details : item2Details}
                  onChange={(e) =>
                    i === 1
                      ? setItem1Details(e.target.value)
                      : setItem2Details(e.target.value)
                  }
                />
              </div>

              {/* Tax Dropdown */}
              <SelectOption
                width="w-full md:w-32"
                options={["No Tax", "Tax"]}
              />

              {/* Price Input */}
              <div className="w-full md:w-32">
                <input
                  type="text"
                  className="custom_input"
                  defaultValue={i === 1 ? "92.00" : "0.00"}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="text-right mb-6 text-gray-800">
          <p>
            Sub Total: <strong className="text-blue-800">£92.00</strong>
          </p>

          <p className="mt-4 flex justify-end items-center gap-2">
            <span className="text-gray-700">Discount:</span>
            <Icons.IndianRupee size={16} className="text-gray-600" />
            <input
              type="text"
              className="border border-gray-300 rounded-lg p-1 w-24 text-right"
              defaultValue="0.00"
            />
          </p>

          <p className="mt-2 flex justify-end items-center gap-2">
            <span className="text-gray-700">Deposit:</span>
            <Icons.IndianRupee size={16} className="text-gray-600" />
            <input
              type="text"
              className="border border-gray-300 rounded-lg p-1 w-24 text-right"
              defaultValue="0.00"
            />
          </p>

          <p className="mt-4 text-xl font-bold text-blue-800">Total: £92.00</p>
        </div>

        <div className="bg-white p-2 md:p-6 rounded-2xl shadow mb-6 border">
          <label className="block font-bold text-gray-700 mb-2 text-lg">
            Notes
          </label>
          <textarea
            className="custom_input"
            rows={3}
            defaultValue="T&Cs apply. Please call for detail"
          />
        </div>

        <div className="text-right">
          <button className="btn btn-success">Save</button>
        </div>
      </div>
    </>
  );
};

export default InvoicePage;
