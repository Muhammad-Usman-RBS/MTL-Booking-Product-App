
import React from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const DriverScheduledJobs = ({ jobs, JobCard }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <OutletHeading name={"Scheduled Jobs"} />
        <div className="bg-black text-white px-3 py-1 rounded-full text-sm font-semibold ">
          {jobs.length} jobs
        </div>
      </div>

      {jobs.length > 0 ? (
        <div>
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} showActions={false} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="bg-slate-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Icons.Calendar size={28} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            No scheduled jobs
          </h3>
          <p className="text-slate-500 text-sm">
            Accepted rides will appear here
          </p>
        </div>
      )}
    </div>
  );
};

export default DriverScheduledJobs;
