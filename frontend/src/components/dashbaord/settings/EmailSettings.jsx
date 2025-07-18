import React, { useState } from "react";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import usePasswordToggle from "../../../hooks/usePasswordToggle";
import Icons from "../../../assets/icons";

const EmailSettings = () => {
  const {type: passwordType, visible: passwordVisible, toggleVisibility: togglePasswordVisibility} = usePasswordToggle();
  const [formData, setFormData] = useState({
    fromEmail: "megatransfers22@gmail.com",
    fromName: "Mega Transfers Limited",
    mailer: "PHP Default",
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    encryption: "TLS",
    smtpUsername: "megatransfers22@gmail.com",
    smtpPassword: "",
    sendTo: "",
  });

  return (
    <div>
      <OutletHeading name="Email Settings" />
      <div className="max-w-xl mx-auto bg-white shadow-md p-2 md:p-6 rounded space-y-6">
        <div>
          <div className="mt-0 md:mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                From Email
              </label>
              <input
                type="email"
                className="w-full border border-[var(--light-gray)] rounded px-3 py-2"
                value={formData.fromEmail}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                From Name
              </label>
              <input
                type="text"
                className="w-full border border-[var(--light-gray)] rounded px-3 py-2"
                value={formData.fromName}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mailer</label>
              <div className="flex gap-6 items-center mt-1">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="mailer"
                    defaultChecked
                    className="mr-2"
                  />
                  PHP Default
                </label>
                <label className="inline-flex items-center">
                  <input type="radio" name="mailer" className="mr-2" />
                  SMTP
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                SMTP Host
              </label>
              <input
                type="text"
                className="w-full border border-[var(--light-gray)] rounded px-3 py-2"
                value={formData.smtpHost}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                SMTP Port
              </label>
              <input
                type="text"
                className="w-full border border-[var(--light-gray)] rounded px-3 py-2"
                value={formData.smtpPort}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Encryption
              </label>
              <SelectOption
                label=""
                value={formData.encryption}
                onChange={() => {}}
                options={["TLS", "SSL"]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                SMTP Username
              </label>
              <input
                type="email"
                className="w-full border border-[var(--light-gray)] rounded px-3 py-2"
                value={formData.smtpUsername}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                SMTP Password
              </label>
              <div className="relative">

              <input
    type={passwordType}
    className="w-full border border-[var(--light-gray)] rounded px-3 py-2"
                placeholder="********"
                readOnly
              />
              <span
                 className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-500"
                    onClick={togglePasswordVisibility}
                  >
                    {passwordVisible ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
                  </span>
              </div>
            </div>

            <div className="text-right">
              <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
                UPDATE
              </button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-md font-semibold border-b pb-2">
            Send a test email
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Send To</label>
              <input
                type="email"
                className="w-full border border-[var(--light-gray)] rounded px-3 py-2"
                placeholder="Recipient Email"
              />
            </div>

            <div className="text-right">
              <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
                SEND
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;
