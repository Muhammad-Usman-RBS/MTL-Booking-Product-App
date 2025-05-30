import React from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const TermsandConditions = () => {
  return (
    <div >
      
            <OutletHeading name="Terms & Conditions" />
  

          <div>
            <div className="space-y-6">
              <section>
                <h3 className="text-md lg:text-xl font-semibold mb-3">
                  1. Acceptance of Terms
                </h3>
                <p className="text-sm lg:text-md">
                  By accessing and using our service, you accept and agree to be
                  bound by the terms and provision of this agreement.
                </p>
              </section>

              <section>
                <h3 className="text-md lg:text-xl font-semibold mb-3">
                  2. Use License
                </h3>
                <p className="text-sm lg:text-md">
                  Permission is granted to temporarily use our service for
                  personal, non-commercial transitory viewing only. This is the
                  grant of a license, not a transfer of title.
                </p>
              </section>

              <section>
                <h3 className="text-md lg:text-xl font-semibold mb-3">
                  3. Privacy Policy
                </h3>
                <p className="text-sm lg:text-md">
                  Your privacy is important to us. Our Privacy Policy explains
                  how we collect, use, and protect your information when you use
                  our service.
                </p>
              </section>

              <section>
                <h3 className="text-md lg:text-xl font-semibold mb-3">
                  4. User Responsibilities
                </h3>
                <p className="text-sm lg:text-md">
                  You are responsible for maintaining the confidentiality of
                  your account and password and for restricting access to your
                  computer.
                </p>
              </section>

              <section>
                <h3 className="text-md lg:text-xl font-semibold mb-3">
                  5. Limitation of Liability
                </h3>
                <p className="text-sm lg:text-md">
                  In no event shall our company be liable for any damages
                  arising out of the use or inability to use our service.
                </p>
              </section>
            </div>
          </div>
        </div>
 
  );
};

export default TermsandConditions;
