import React from "react";

import Icons from "../../../assets/icons";

const AvailableJobs = ({ jobs, onAccept, onReject }) => {
  return (
    <div className="w-full">
      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Icons.User size={22} />
                  </div>
                  <h3 className="font-semibold whitespace-nowrap text-[var(--dark-gray)] text-lg">
                    {job.customerName}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Pickup Location */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100  rounded-lg flex items-center justify-center mt-0.5">
                    <Icons.MapPin size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Pickup Location
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {job.pickupLocation}
                    </p>
                  </div>
                </div>

                {/* Drop-off Location */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100  rounded-lg flex items-center justify-center mt-0.5">
                    <Icons.Navigation size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Drop-off Location
                    </p>
                    <p className="text-sm text-gray-900 font-medium break-words">
                      {job.dropLocation}
                    </p>
                  </div>
                </div>

                {/* Extra Guidance */}
                {job.extraGuidance && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mt-0.5">
                      <Icons.FileText size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Notes
                      </p>
                      <p className="text-sm text-gray-900">
                        {job.extraGuidance}
                      </p>
                    </div>
                  </div>
                )}

                {/* Job Details */}
                <div className="bg-gray-100 rounded-lg py-4 px-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Time */}
                  <div className="grid grid-rows-2 lg:items-start  lg:text-left text-center">
                    <div className="flex items-center lg:justify-start justify-center gap-1">
                      <Icons.Clock size={14} className="text-gray-500" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Time
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {job.estimatedTime}
                    </p>
                  </div>

                  {/* Distance */}
                  <div className="grid grid-rows-2 items-center text-center ">
                    <div className="flex items-center justify-center gap-1">
                      <Icons.Navigation size={14} />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Distance
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {job.distance}
                    </p>
                  </div>

                  {/* Fare */}
                  <div className="grid grid-rows-2 sm:items-end items-center lg:text-end text-center">
                    <div className="flex items-center sm:justify-end justify-center gap-1">
                      <Icons.DollarSign size={14} />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Fare
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      £{job.driverFare}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6">
                <div className="flex gap-3">
                  <button
                    onClick={() => onReject(job._id)}
                    className="btn btn-cancel"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => onAccept(job._id)}
                    className="btn btn-success"
                  >
                    Accept
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icons.MapPin size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Available Jobs
          </h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            New booking assignments will appear here when admin assigns them to
            you.
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailableJobs;
