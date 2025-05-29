import React, { useState } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const TermsandConditions = () => {
  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white backdrop-blur-lg rounded-3xl p-6 md:p-8 ">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gray-100 rounded-2xl">
              <Icons.FileText className="w-8 h-8 text-black" />
            </div>
            <div>
              <OutletHeading name={"Terms & Conditions"} />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 text-center hover:bg-gray-100 transition-all duration-300">
              <div className="w-12 h-12 bg-gray-200 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Icons.Shield className="w-6 h-6 text-black" />
              </div>
              <h3 className="font-semibold text-black mb-2">Privacy First</h3>
              <p className="text-black text-sm">
                Your data is protected and secure
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center hover:bg-gray-100 transition-all duration-300">
              <div className="w-12 h-12 bg-gray-200 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Icons.Clock className="w-6 h-6 text-black" />
              </div>
              <h3 className="font-semibold text-black mb-2">24/7 Support</h3>
              <p className="text-black text-sm">Always here to help you</p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center hover:bg-gray-100 transition-all duration-300">
              <div className="w-12 h-12 bg-gray-200 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Icons.CheckCircle className="w-6 h-6 text-black" />
              </div>
              <h3 className="font-semibold text-black mb-2">Fair Terms</h3>
              <p className="text-black text-sm">Transparent and honest</p>
            </div>
          </div>

          <div className="bg-white text-left rounded-2xl pl-4 pr-2 pt-6 pb-6 mb-8 w-full md:max-w-6xl md:mx-auto">
            <div className="space-y-6 text-black">
              <section>
                <h3 className="lg:text-xl text-md font-semibold text-black mb-3">
                  1. Acceptance of Terms
                </h3>
                <p className="lg:text-md text-sm ">
                  By accessing and using our service, you accept and agree to be
                  bound by the terms and provision of this agreement.
                </p>
              </section>

              <section>
                <h3 className="lg:text-xl text-md font-semibold text-black mb-3">
                  2. Use License
                </h3>
                <p className="lg:text-md text-sm ">
                  Permission is granted to temporarily use our service for
                  personal, non-commercial transitory viewing only. This is the
                  grant of a license, not a transfer of title.
                </p>
              </section>

              <section>
                <h3 className="lg:text-xl text-md  font-semibold text-black mb-3">
                  3. Privacy Policy
                </h3>
                <p className="lg:text-md text-sm ">
                  Your privacy is important to us. Our Privacy Policy explains
                  how we collect, use, and protect your information when you use
                  our service.
                </p>
              </section>

              <section>
                <h3 className="lg:text-xl text-md  font-semibold text-black mb-3">
                  4. User Responsibilities
                </h3>
                <p className="lg:text-md text-sm ">
                  You are responsible for maintaining the confidentiality of
                  your account and password and for restricting access to your
                  computer.
                </p>
              </section>

              <section>
                <h3 className="lg:text-xl text-md  font-semibold text-black mb-3">
                  5. Limitation of Liability
                </h3>
                <p className="lg:text-md text-sm ">
                  In no event shall our company be liable for any damages
                  arising out of the use or inability to use our service.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsandConditions;
