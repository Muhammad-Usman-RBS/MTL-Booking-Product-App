import React from "react";
import "react-phone-input-2/lib/style.css";
import IMAGES from "../../../assets/images";
import PhoneInput from "react-phone-input-2";
import { yesNoOptions } from "../../../constants/dashboardTabsData/data";
import SelectOption from "../../../constants/constantscomponents/SelectOption";

const Req = () => <span className="text-red-500 ml-0.5">*</span>;

const CompanyAccountForm = ({
    isEdit,
    isClientAdmin,
    formData,
    filePreviews,
    errors,
    touched,
    options,
    onInputChange,
    onChange,
    onBlur,
    onTouch,
    onSubmit,
}) => {
    const errorClass = (field) =>
        touched?.[field] && errors?.[field] ? "border-red-500 focus:border-red-500" : "";

    const ErrorText = ({ field }) =>
        touched?.[field] && errors?.[field] ? (
            <p className="text-red-600 text-sm mt-1">{errors[field]}</p>
        ) : null;

    return (
        <>
            <div
                className="inline-flex flex-col items-center gap-3 mb-6 p-4 bg-gradient-to-br from-sky-50 to-sky-100 border-2 border-dashed border-sky-300 rounded-xl shadow-sm w-fit"
            >
                <img
                    src={filePreviews.profileImage || IMAGES.dummyImg}
                    alt="Profile Preview"
                    className="w-24 h-24 rounded-full object-cover border border-sky-200 shadow-md"
                />
                <label
                    htmlFor="profile-upload"
                    className="btn btn-reset"
                >
                    Upload Company Logo
                </label>
                <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    name="profileImage"
                    onChange={onInputChange}
                    className="hidden"
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                <div>
                    <label className="block mb-1 font-medium">
                        Company Name{!isEdit && <Req />}
                    </label>
                    <input
                        name="companyName"
                        placeholder="Company Name"
                        className={`custom_input ${errorClass("companyName")}`}
                        value={formData.companyName}
                        onChange={(e) => onChange("companyName", e.target.value)}
                        onBlur={() => onBlur("companyName")}
                    />
                    <ErrorText field="companyName" />
                </div>

                <div>
                    <label className="block mb-1 font-medium">
                        Trading Name{!isEdit && <Req />}
                    </label>
                    <input
                        name="tradingName"
                        placeholder="Trading Name"
                        className={`custom_input ${errorClass("tradingName")}`}
                        value={formData.tradingName}
                        onChange={(e) => onChange("tradingName", e.target.value)}
                        onBlur={() => onBlur("tradingName")}
                    />
                    <ErrorText field="tradingName" />
                </div>

                <div>
                    <label className="block mb-1 font-medium">
                        Contact{!isEdit && <Req />}
                    </label>
                    <PhoneInput
                        country={"gb"}
                        inputClass={`w-full custom_input ${errorClass("contact")}`}
                        inputStyle={{ width: "100%" }}
                        value={formData.contact}
                        onChange={(value) => onChange("contact", value)}
                        onBlur={() => onBlur("contact")}
                        inputProps={{ name: "contact" }}
                    />
                    <ErrorText field="contact" />
                </div>

                <div>
                    <label className="block mb-1 font-medium">
                        {isClientAdmin ? "Assign to Associate Admin" : "Assign to Client Admin"}
                        {!isEdit && <Req />}
                    </label>
                    <SelectOption
                        label=""
                        value={formData.clientAdminId}
                        options={options}
                        onChange={(e) => {
                            const selectedId = e?.target?.value || e?.value || e;
                            const sel = options.find((o) => o.value === selectedId);
                            onChange("clientAdminId", selectedId);
                            onChange("fullName", sel?.label || "");
                            onChange("email", sel?.email || "");
                            onChange("status", sel?.status || "");
                        }}
                        onBlur={() => onBlur("clientAdminId")}
                    />
                    <ErrorText field="clientAdminId" />
                </div>

                <div>
                    <label className="block mb-1 font-medium">
                        Email{!isEdit && <Req />}
                    </label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        className={`custom_input ${errorClass("email")}`}
                        value={formData.email}
                        onChange={(e) => onChange("email", e.target.value)}
                        onBlur={() => onBlur("email")}
                    />
                    <ErrorText field="email" />
                </div>

                <div>
                    <label className="block mb-1 font-medium">Licensed By</label>
                    <input
                        name="licensedBy"
                        placeholder="Licensed By"
                        className="custom_input"
                        value={formData.licensedBy}
                        onChange={(e) => onChange("licensedBy", e.target.value)}
                        onBlur={() => onTouch("licensedBy")}
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium">
                        License Number{!isEdit && <Req />}
                    </label>
                    <input
                        type="number"
                        name="licenseNumber"
                        min="1"
                        placeholder="License Number"
                        className={`custom_input ${errorClass("licenseNumber")}`}
                        value={formData.licenseNumber}
                        onChange={(e) => onChange("licenseNumber", e.target.value)}
                        onBlur={() => onBlur("licenseNumber")}
                    />
                    <ErrorText field="licenseNumber" />
                </div>

                <div>
                    <label className="block mb-1 font-medium">
                        License Referrer Link{!isEdit && <Req />}
                    </label>
                    <input
                        name="referrerLink"
                        placeholder="https://example.com/license"
                        className={`custom_input ${errorClass("referrerLink")}`}
                        value={formData.referrerLink}
                        onChange={(e) => onChange("referrerLink", e.target.value)}
                        onBlur={() => onBlur("referrerLink")}
                    />
                    <ErrorText field="referrerLink" />
                </div>

                <div>
                    <label className="block mb-1 font-medium">
                        Cookie Consent{!isEdit && <Req />}
                    </label>
                    <SelectOption
                        label=""
                        options={yesNoOptions}
                        value={formData.cookieConsent}
                        onChange={(e) => onChange("cookieConsent", e.target.value)}
                        onBlur={() => onBlur("cookieConsent")}
                    />
                    <ErrorText field="cookieConsent" />
                </div>
            </div>

            <div className="mt-6">
                <label className="block mb-1 font-medium">
                    Company Address{!isEdit && <Req />}
                </label>
                <textarea
                    name="address"
                    placeholder="Company Address"
                    className={`custom_input w-full ${errorClass("address")}`}
                    rows={3}
                    value={formData.address}
                    onChange={(e) => onChange("address", e.target.value)}
                    onBlur={() => onBlur("address")}
                />
                <ErrorText field="address" />
            </div>

            <div className="mt-8 text-right">
                <button onClick={onSubmit} className="btn btn-success">
                    {isEdit ? "Update" : "Create Company Account"}
                </button>
            </div>
        </>
    );
};

export default CompanyAccountForm;