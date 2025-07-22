import React from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const AvailableJobs = ({ jobs, onAccept, onReject }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <OutletHeading name={"Available Jobs"} />
      </div>

      {jobs.length > 0 ? (
        <div>
          {jobs.map((job) => (
            <div
              key={job._id}
              className="mb-5 border border-gray-200 rounded-md p-3 sm:p-5"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 p-2 rounded-xl">
                    <Icons.User size={20} className="text-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {job.customerName}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-start space-x-3 w-full">
                  <div className="bg-gray-100 p-1.5 rounded-lg">
                    <Icons.MapPin size={20} className="text-black" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">
                      Pickup
                    </p>
                    <p className="text-slate-600 text-sm">
                      {job.pickupLocation}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 w-full">
                  <div className="bg-gray-100 p-1.5 rounded-lg">
                    <Icons.Navigation size={20} className="text-black" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">
                      Drop-off
                    </p>
                    <p className="text-slate-600 text-sm break-words">
                      {job.dropLocation}
                    </p>
                  </div>
                </div>

                {job.extraGuidance && (
                  <div className="rounded-md p-3">
                    <p className="text-sm font-semibold text-black mb-1">
                      Notes
                    </p>
                    <p className="text-black text-xs">{job.extraGuidance}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-0 sm:flex sm:justify-between sm:items-center mb-4 bg-slate-50 rounded-xl p-3">
                <div className="flex items-center justify-center sm:justify-start space-x-1">
                  <Icons.Clock size={16} className="text-black" />
                  <span className="text-slate-700 text-sm font-medium">
                    {job.estimatedTime}
                  </span>
                </div>
                <div className="flex items-center justify-center sm:justify-start space-x-1">
                  <Icons.Navigation size={16} className="text-black" />
                  <span className="text-slate-700 text-sm font-medium">
                    {job.distance}
                  </span>
                </div>
                <div className="flex items-center justify-center sm:justify-start space-x-1">
                  <span className="text-lg font-bold text-gray-700">
                    £{job.driverFare}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2 justify-end">
                <button
                  onClick={() => onReject(job._id)}
                  className="btn btn-cancel"
                >
                  Reject
                </button>
                <button
                  onClick={() => onAccept(job._id)}
                  className="btn btn-primary"
                >
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <div className="bg-slate-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Icons.MapPin size={28} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            No available jobs
          </h3>
          <p className="text-slate-500 text-sm">
            New ride requests will appear here
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailableJobs;
