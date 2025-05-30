import React, { useState } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const DriverContact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
const Information = [
  {
    icon: <Icons.Mail className="size-4 text-black" />,
    title: "Email Us",
    detail: "hello@company.com",
    note: "Send us an email anytime",
  },
  {
    icon: <Icons.Phone className="size-4 text-black" />,
    title: "Call Us",
    detail: "+1 (555) 123-4567",
    note: "Available 24 for support",
  },
  {
    icon: <Icons.MapPin className="size-4 text-black" />,
    title: "Visit Us",
    detail: "123 Business St\nNew York, NY 10001",
  },
  {
    icon: <Icons.Clock className="size-4 text-black" />,
    title: "Office Hours",
    detail: "Mon - Fri: 9AM - 6PM\nWeekend: 10AM - 4PM",
  },
]
  return (
    <div>
      <OutletHeading name={"Contact Us"} />

      <div className="grid lg:grid-cols-5 gap-8 w-full">
        {/* Contact Info */}
        <div className="lg:col-span-2 space-y-6 w-full">
          {Information.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-md p-2 border border-gray-300 hover:bg-gray-50 transition-all duration-300 w-full"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gray-100 rounded-md">{item.icon}</div>
                <div>
                  <h3 className="font-semibold text-black">{item.title}</h3>
                  {item.detail.split("\n").map((line, i) => (
                    <p key={i} className="text-black">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
              {item.note && (
                <p className="text-gray-600 text-sm">{item.note}</p>
              )}
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-3 w-full">
          <div className="bg-white rounded-md p-6 border border-gray-300 w-full">
           
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
                className="btn btn-outline flex items-center justify-center"
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
