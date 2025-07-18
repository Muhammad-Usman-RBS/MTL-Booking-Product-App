import React from "react";

const OutletHeading = ({ name }) => {
  return (
    <>
      <h2 className="text-2xl font-bold text-[var(--dark-gray)] mb-2">{name}</h2>
      <hr className="mb-6 border-[var(--light-gray)]" />
    </>
  );``
};

export default OutletHeading;
