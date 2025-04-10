import React from "react";

const OutletHeading = ({ name }) => {
  return (
    <>
      <h2 className="text-2xl font-bold text-gray-600 mb-2">{name}</h2>
      <hr className="mb-6 border-gray-300" />
    </>
  );
};

export default OutletHeading;
