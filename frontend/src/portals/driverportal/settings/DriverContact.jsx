import React, { useState } from "react";
import { Mail } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-white lg:px-4 py-8 ">
      <div className="max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-3xl p-6  w-full">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-white border border-gray-300 rounded-2xl">
              <Icons.MessageCircle className="w-8 h-8 text-black" />
            </div>
            <OutletHeading name={"Contact Us"} />
          </div>

          <div className="grid lg:grid-cols-5 gap-8 w-full">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6 w-full">
              {[
                {
                  icon: <Mail className="w-6 h-6 text-black" />,
                  title: "Email Us",
                  detail: "hello@company.com",
                  note: "Send us an email anytime",
                },
                {
                  icon: <Icons.Phone className="w-6 h-6 text-black" />,
                  title: "Call Us",
                  detail: "+1 (555) 123-4567",
                  note: "Available 24 for support",
                },
                {
                  icon: <Icons.MapPin className="w-6 h-6 text-black" />,
                  title: "Visit Us",
                  detail: "123 Business St\nNew York, NY 10001",
                },
                {
                  icon: <Icons.Clock className="w-6 h-6 text-black" />,
                  title: "Office Hours",
                  detail: "Mon - Fri: 9AM - 6PM\nWeekend: 10AM - 4PM",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border hover:bg-gray-50 transition-all duration-300 w-full"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gray-100 rounded-xl">
                      {item.icon}
                    </div>
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
              <div className="bg-white rounded-2xl p-6 border w-full">
                <h2 className="text-2xl font-bold text-black mb-6">
                  Send us a message
                </h2>
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
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-black placeholder-gray-500 focus:border-black focus:outline-none"
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
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-black placeholder-gray-500 focus:border-black focus:outline-none"
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
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-black placeholder-gray-500 focus:border-black focus:outline-none"
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
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-black placeholder-gray-500 focus:border-black focus:outline-none resize-none"
                      placeholder="Tell us more about your inquiry..."
                    ></textarea>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="submit"
                      className="w-full md:w-auto bg-black text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
                    >
                      <Icons.Send className="w-5 h-5" />
                      Send Message
                    </button>
                  </div>
                </form>

                <div className="mt-8 p-4 bg-gray-50 rounded-xl border text-center">
                  <p className="text-black text-sm">
                    We typically respond within 24 hours. For urgent matters,
                    please call us directly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DriverContact;
