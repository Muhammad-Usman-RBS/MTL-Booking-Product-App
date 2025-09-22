import React from "react";
import { Link } from "react-router-dom";

const OutletBtnHeading = ({
  name,
  buttonLabel,
  buttonLink,
  onButtonClick,
  disabled = false,
  buttonBg = "bg-[var(--primary-color)]",
}) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        {/* Heading */}
        <div className="min-w-0">
          <h2 className="font-bold text-[var(--dark-gray)] text-xl sm:text-xl md:text-2xl lg:text-2xl leading-tight mb-2 sm:mb-0">
            <span className="block truncate">{name}</span>
          </h2>
        </div>

        {/* Optional button */}
        {buttonLabel && (
          buttonLink ? (
            <Link to={buttonLink} className="w-full sm:w-auto">
              <button
                disabled={disabled}
                className={`btn ${buttonBg} text-white px-4 py-2 rounded-md ${
                  disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {buttonLabel}
              </button>
            </Link>
          ) : (
            <button
              onClick={onButtonClick}
              disabled={disabled}
              className={`btn ${buttonBg} text-white px-4 py-2 rounded-md ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {buttonLabel}
            </button>
          )
        )}
      </div>

      <hr className="mb-6 mt-3 border-[var(--light-gray)]" />
    </>
  );
};

export default OutletBtnHeading;
