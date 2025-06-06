import React from "react";
import IMAGES from "../../../assets/images";

const ViewDriver = () => {
  return (
    <>
      <div className="p-4 space-y-4 text-sm text-gray-800 w-full max-w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-gray-600 mb-1">
              Distance:
            </label>
            <p className="bg-gray-100 px-3 py-1.5 rounded">27.70 miles</p>
          </div>
          <div>
            <label className="block font-semibold text-gray-600 mb-1">
              Fare:
            </label>
            <input type="number" className="custom_input" />
          </div>
        </div>

        <div className="flex space-x-2">
          <button className="btn btn-primary">All Drivers</button>
          <button className="btn btn-reset">Matching Drivers</button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div>
            <input
              type="text"
              placeholder="Search driver"
              className="custom_input"
            />
          </div>
          <label className="flex items-center space-x-2 text-sm">
            <input type="checkbox" className="form-checkbox" />
            <span>Select All</span>
          </label>
        </div>

        <div className="max-h-48 overflow-y-auto pr-1 space-y-3 custom-scroll border border-gray-500 rounded-md">
          {[
            {
              name: "0101 SC",
              image: IMAGES.profileimg,
              car: "Mercedes Benz",
              model: "V Class",
            },
            {
              name: "1 Usman",
              image: IMAGES.profileimg,
              car: "Mercedes",
              model: "S Class",
            },
            {
              name: "10 Aftab Khan",
              image: IMAGES.profileimg,
              car: "Mercedes Benz",
              model: "V Class",
            },
            {
              name: "0101 SC",
              image: IMAGES.profileimg,
              car: "Mercedes Benz",
              model: "V Class",
            },
            {
              name: "1 Usman",
              image: IMAGES.profileimg,
              car: "Mercedes",
              model: "S Class",
            },
            {
              name: "10 Aftab Khan",
              image: IMAGES.profileimg,
              car: "Mercedes Benz",
              model: "V Class",
            },
          ].map((driver, i) => (
            <label
              key={i}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg shadow-sm bg-white hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer"
            >
              <img
                src={driver.image}
                alt={driver.name}
                className="w-10 h-10 rounded-full object-cover border border-gray-300"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-800">{driver.name}</p>
                <p className="text-xs text-gray-500">
                  {driver.car} | {driver.model}
                </p>
              </div>
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-indigo-600"
              />
            </label>
          ))}
        </div>

        <div>
          <label className="block font-semibold text-gray-600 mb-1">
            Driver Notes:
            <span className="italic text-red-500 underline">Empty</span>
          </label>
        </div>
        <hr />
        <div>
          <label className="block font-semibold text-gray-600 mb-2">
            Alerts
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="form-checkbox" />
              <span>Email</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="form-checkbox" />
              <span>Notification</span>
            </label>
          </div>
        </div>

        <div className="pt-4">
          <button className="btn btn-success">Update</button>
        </div>
      </div>
    </>
  );
};

export default ViewDriver;
