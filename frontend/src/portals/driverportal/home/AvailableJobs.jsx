import React from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const AvailableJobs = ({ jobs, JobCard }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <OutletHeading name={"Available Jobs"} />
        <div className="bg-black text-white px-3 py-1 rounded-full text-sm font-semibold ">
          {jobs.length} jobs
        </div>
      </div>

      {jobs.length > 0 ? (
        <div>
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} showActions={true} />
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