import React from "react";
import Icons from "../../assets/icons";

const NotFound = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(90deg, rgba(158,207,204,1) 0%, rgba(0,212,255,1) 100%)",
      }}
    >
      <div className="flex flex-col items-center text-center space-y-4 max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
          <h3 className="text-5xl">🚧</h3>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 flex gap-3 items-center">
          Page Not Found <Icons.Wrench className="w-7 h-7" />
        </h2>

        <p className="text-sm md:text-lg text-gray-600">
          Oops! The page you're looking for doesn't exist or has been moved.
          <br />
          Our development team is actively working on building this page.
        </p>

        <a
          href="/"
          className="inline-block px-6 mt-4 py-2 text-white rounded-lg font-medium shadow-md hover:opacity-90 transition duration-200"
          style={{
            background:
              "linear-gradient(90deg, rgba(37,37,157,1) 0%, rgba(0,212,255,1) 100%)",
          }}
        >
          Back to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
