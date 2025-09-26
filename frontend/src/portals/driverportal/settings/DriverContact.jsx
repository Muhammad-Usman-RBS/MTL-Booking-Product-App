import React, { useState } from "react";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import { informationData } from "../../../constants/dashboardTabsData/data";

const DriverContact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      <OutletHeading name={"Contact Us"} />

      <div className="grid lg:grid-cols-5 gap-8 w-full">
        <div className="lg:col-span-2 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          {informationData.map((item, idx) => (
            <div
              key={idx}
              className="bg-white shadow-sm hover:shadow-md rounded-xl border border-gray-200 hover:border-blue-500 transition-all duration-300 p-5"
            >
              <div className="flex items-start gap-4 mb-3">
                <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                  {item.icon}
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-[var(--dark-gray)] sm:text-lg">
                    {item.title}
                  </h3>
                  {item.detail.split("\n").map((line, i) => (
                    <p key={i} className="text-xs text-gray-700 leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
              {item.note && (
                <div className="mt-2 border-t pt-2 text-xs text-gray-500 italic">
                  {item.note}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="lg:col-span-3 w-full">
          <div className="bg-white rounded-md p-6 border border-[var(--light-gray)] w-full">

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-black mb-2 font-medium">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="custom_input"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-black mb-2 font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="custom_input"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-black mb-2 font-medium">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="custom_input"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label className="block text-black mb-2 font-medium">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  className="custom_input resize-none"
                  placeholder="Tell us more about your inquiry..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-reset flex items-center justify-center"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverContact;
