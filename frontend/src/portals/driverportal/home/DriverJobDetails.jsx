import React from "react";
import { useParams } from "react-router-dom";
import { mockJobs } from "../../../constants/dashboardTabsData/data";
import Icons from "../../../assets/icons";

const JobDetails = () => {
  const { id } = useParams();
  const job = mockJobs.find((job) => job.id === Number(id));
  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Job not found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white ">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Icons.User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {job.customerName}
              </h1>
              <div className="flex items-center space-x-1">
                <Icons.Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">
                  {job.customerRating} rating
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">
              ${job.driverShare}
            </div>
            <div className="text-sm text-gray-500">Your earnings</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Route Section - Sleek Design */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="relative">
            {/* Pickup */}
            <div className="flex items-start space-x-4 mb-8">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>
              </div>
              <div className="flex-1 pt-1">
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                  Pickup
                </div>
                <div className="text-lg font-medium text-gray-900">
                  {job.pickupLocation}
                </div>
              </div>
            </div>

            {/* Drop-off */}
            <div className="flex items-start space-x-4">
              <div className="w-4 h-4 bg-gray-900 rounded-full"></div>
              <div className="flex-1 pt-1">
                <div className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-1">
                  Drop-off
                </div>
                <div className="text-lg font-medium text-gray-900">
                  {job.dropLocation}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Clean Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Icons.Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {job.estimatedTime}
                </div>
                <div className="text-sm text-gray-500">Duration</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Icons.MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {job.distance}
                </div>
                <div className="text-sm text-gray-500">Distance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Breakdown - Subtle Design */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Total Payment</span>
              <span className="text-lg font-semibold text-gray-900">
                ${job.totalPayment}
              </span>
            </div>
            <div className="border-t border-gray-100"></div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-900 font-medium">Your Share</span>
              <span className="text-xl font-bold text-blue-600">
                ${job.driverShare}
              </span>
            </div>
          </div>
        </div>

        {/* Special Instructions - Minimal Alert */}
        {job.extraGuidance && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <Icons.AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900 mb-1">
                  Special Instructions
                </div>
                <div className="text-gray-700">{job.extraGuidance}</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons - Modern Design */}
        <div className="space-y-3 pt-4 flex items-center justify-center space-x-2">
          <button className=" px-4 cursor-pointer bg-gray-900 text-white py-2 rounded-md font-semibold text-md hover:bg-gray-800 transition-all duration-200 transform hover:scale-[1.02]">
            {job.status === "available" ? "Accept This Job" : "View Job Status"}
          </button>

          <button className="px-4 cursor-pointer bg-white border-2 -mt-3 border-gray-200 text-gray-900 py-2 rounded-md font-semibold text-md hover:border-blue-600 hover:text-blue-600 transition-all duration-200">
            <Icons.Phone className="inline h-5 w-5 mr-2" />
            Contact Customer
          </button>
        </div>
      </div>
    </>
  );
};

export default JobDetails;
