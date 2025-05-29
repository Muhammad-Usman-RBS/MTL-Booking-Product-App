import React, { useState } from "react";
import Icons from "../../../assets/icons";
import AvailableJobs from "./AvailableJobs";
import ScheduledJobs from "./DriverScheduledJobs";
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-4 hover:shadow-md transition-all duration-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-2 rounded-xl">
              <Icons.User size={20} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">
                {job.customerName}
              </h3>
              <div className="flex items-center space-x-1 mt-1">
                <Icons.Star size={14} className="text-amber-400 fill-current" />
                <span className="text-slate-600 text-sm font-medium">
                  {job.customerRating}
                </span>
              </div>
            </div>
          </div>
          {!showActions && (
            <span className="bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full border border-emerald-200">
              Accepted
            </span>
          )}
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-start space-x-3">
            <div className="bg-emerald-100 p-1.5 rounded-lg">
              <Icons.MapPin size={16} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">
                Pickup
              </p>
              <p className="text-slate-600 text-sm">{job.pickupLocation}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-rose-100 p-1.5 rounded-lg">
              <Icons.Navigation size={16} className="text-rose-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">
                Drop-off
              </p>
              <p className="text-slate-600 text-sm">{job.dropLocation}</p>
            </div>
          </div>

          {job.extraGuidance && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-amber-800 mb-1">
                Special Instructions
              </p>
              <p className="text-amber-700 text-sm">{job.extraGuidance}</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-4 bg-slate-50 rounded-xl p-3">
          <div className="flex items-center space-x-1">
            <Icons.Clock size={16} className="text-slate-500" />
            <span className="text-slate-700 text-sm font-medium">
              {job.estimatedTime}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Icons.Navigation size={16} className="text-slate-500" />
            <span className="text-slate-700 text-sm font-medium">
              {job.distance}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Icons.DollarSign size={18} className="text-emerald-600" />
            <span className="text-lg font-bold text-emerald-600">
              ${job.driverFare}
            </span>
          </div>
        </div>

        {showActions && (
          <div className="flex space-x-3">
            <button
              onClick={() => handleAccept(job.id)}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2.5 px-4 rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
            >
              <Icons.Check size={16} />
              <span>Accept</span>
            </button>
            <button
              onClick={() => handleReject(job.id)}
              className="flex-1 bg-gradient-to-r from-slate-500 to-slate-600 text-white py-2.5 px-4 rounded-xl font-medium hover:from-slate-600 hover:to-slate-700 transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
            >
              <Icons.X size={16} />
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
    <div className="max-w-3xl mx-auto px-4">
      <div className="flex space-x-3 mb-8">
        <button
          onClick={() => setActiveSection("Available")}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
            activeSection === "Available"
              ? "bg-black text-white shadow-md"
              : "bg-white text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 shadow-sm border border-slate-200"
          }`}
        >
          <Icons.MapPin size={18} />
          <span>Available Jobs</span>
          {availableJobs.length > 0 && (
            <span className="bg-white text-black bg-opacity-20 text-xs px-2 py-1 rounded-full font-medium">
              {availableJobs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection("Scheduled")}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
            activeSection === "Scheduled"
              ? "bg-black text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-indigo-50 shadow-sm border border-slate-200"
          }`}
        >
          <Icons.Calendar size={18} />
          <span>Scheduled</span>
          {scheduledJobs.length > 0 && (
            <span className="bg-white text-black bg-opacity-20 text-xs px-2 py-1 rounded-full font-medium">
              {scheduledJobs.length}
            </span>
          )}
        </button>
      </div>

      <div>
        {activeSection === "Available" && (
          <AvailableJobs
            jobs={availableJobs}
            onAccept={handleAccept}
            onReject={handleReject}
            JobCard={JobCard}
          />
        )}
        {activeSection === "Scheduled" && (
          <ScheduledJobs jobs={scheduledJobs} JobCard={JobCard} />
        )}
      </div>
    </div>
  );
};

export default DriverPortalHome;
