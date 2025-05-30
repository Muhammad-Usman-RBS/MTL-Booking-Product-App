import React from "react";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import { termsData } from "../../../constants/dashboardTabsData/data";

const TermsandConditions = () => {
  return (
    <div>
      <OutletHeading name="Terms & Conditions" />

      <div className="space-y-6 mt-4">
        {termsData.map((section, index) => (
          <section key={index}>
            <h3 className="text-sm uppercase text-gray-700 lg:text-md font-semibold mb-1">{section.title}:</h3>
            <p className="text-sm lg:text-md">{section.content}</p>
          </section>
        ))}
      </div>
    </div>
  );
};

export default TermsandConditions;
