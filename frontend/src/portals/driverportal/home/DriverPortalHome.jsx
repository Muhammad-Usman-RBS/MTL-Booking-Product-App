import React, { useState } from "react";
import Icons from "../../../assets/icons";
import AvailableJobs from "./AvailableJobs";
import DriverScheduledJobs from "./DriverScheduledJobs";
import { mockJobs } from "../../../constants/dashboardTabsData/data";
import { Link } from "react-router-dom";

const DriverPortalHome = () => {
  const [activeSection, setActiveSection] = useState("Available");
  const [jobs, setJobs] = useState(mockJobs);

  const availableJobs = jobs.filter((job) => job.status === "available");
  const scheduledJobs = jobs.filter((job) => job.status === "scheduled");

  const handleAccept = (jobId) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId ? { ...job, status: "scheduled" } : job
      )
    );
  };

  const handleReject = (jobId) => {
    setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
  };

  const JobCard = ({ job, showActions = true }) => {
    const cardContent = (
      <div className="mb-5 border border-gray-200 rounded-md p-5 ">
        <div className="flex justify-between items-start mb-4 ">
          <div className="flex items-center space-x-3 ">
            <div className="bg-gray-100 p-2 rounded-xl">
              <Icons.User size={20} className="text-black" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">
                {job.customerName}
              </h3>
              <div className="flex items-center space-x-1 mt-1">
                <Icons.Star size={14} className="text-black fill-current" />
                <span className="text-slate-600 text-sm font-medium">
                  {job.customerRating}
                </span>
              </div>
            </div>
          </div>
          {!showActions && (
            <span className="text-black bg-gray-100 text-xs font-medium px-3 py-1 rounded-full ">
              Accepted
            </span>
          )}
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-start space-x-3">
            <div className="bg-gray-100 p-1.5 rounded-lg">
              <Icons.MapPin size={16} className="text-black" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">
                Pickup
              </p>
              <p className="text-slate-600 text-sm">{job.pickupLocation}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-gray-100 p-1.5 rounded-lg">
              <Icons.Navigation size={16} className="text-black" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">
                Drop-off
              </p>
              <p className="text-slate-600 text-sm">{job.dropLocation}</p>
            </div>
          </div>

          {job.extraGuidance && (
            <div className=" border  rounded-md p-3">
              <p className="text-sm font-semibold text-black mb-1">
                Special Instructions
              </p>
              <p className="text-black text-xs">{job.extraGuidance}</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-4 bg-slate-50 rounded-xl p-3">
          <div className="flex items-center space-x-1">
            <Icons.Clock size={16} className="text-black" />
            <span className="text-slate-700 text-sm font-medium">
              {job.estimatedTime}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Icons.Navigation size={16} className="text-black" />
            <span className="text-slate-700 text-sm font-medium">
              {job.distance}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Icons.DollarSign size={18} className="text-gray-700" />
            <span className="text-lg font-bold text-gray-700">
              ${job.driverFare}
            </span>
          </div>
        </div>

        {showActions && (
          <div className="flex space-x-3">
            <button
              onClick={() => handleAccept(job.id)}
              className="btn btn-success"
            >
              <span>Accept</span>
            </button>
            <button
              onClick={() => handleReject(job.id)}
              className="btn btn-cancel"
            >
              <span>Decline</span>
            </button>
          </div>
        )}
      </div>
    );

    return showActions ? (
      cardContent
    ) : (
      <Link to={`/dashboard/drivers/jobs/${job.id}`}>{cardContent}</Link>
    );
  };

  return (
    <div>
      <div className="flex space-x-3 mb-8">
        <button
          onClick={() => setActiveSection("Available")}
          className={`${activeSection === "Available"
            ? "btn btn-reset"
            : "btn btn-primary"
            }`}
        >
          <span>Available Jobs</span>
          {availableJobs.length > 0 && (
            <span className="bg-white ml-2 text-black bg-opacity-20 text-xs px-2 py-1 rounded-full font-medium">
              {availableJobs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection("Scheduled")}
          className={`${activeSection === "Scheduled"
            ? "btn btn-reset"
            : "btn btn-primary"
            }`}
        >
          <span>Scheduled</span>
          {scheduledJobs.length > 0 && (
            <span className="ml-2 bg-white text-black bg-opacity-20 text-xs px-2 py-1 rounded-full font-medium">
              {scheduledJobs.length}
            </span>
          )}
        </button>
      </div>

      <div className="h-[600px]  overflow-y-auto">
        <div
          className={`${activeSection === "Available" ? "block" : "hidden"}`}
        >
          <AvailableJobs
            jobs={availableJobs}
            onAccept={handleAccept}
            onReject={handleReject}
            JobCard={JobCard}
          />
        </div>

        <div
          className={`${activeSection === "Scheduled" ? "block" : "hidden"}`}
        >
          <DriverScheduledJobs jobs={scheduledJobs} JobCard={JobCard} />
        </div>
      </div>
    </div>
  );
};

export default DriverPortalHome;