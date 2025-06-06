import React from "react";
import Icons from "../../../assets/icons";
import IMAGES from "../../../assets/images";

const DriverData = ({
    filePreviews,
    handleAddAvailability,
    handleInputChange,
    formData,
    handleRemoveAvailability,
}) => {
    const dvlaCardFile = formData.dvlaCard;
    const dvlaCardPreview = filePreviews.dvlaCard;
    const dvlaCardPreviewName = filePreviews.dvlaCardName;
    const dvlaCardIsPdf =
        dvlaCardFile instanceof File
            ? dvlaCardFile.type === "application/pdf"
            : false;
    const dvlaCardPreviewIsPdf =
        typeof dvlaCardPreview === "string"
            ? dvlaCardPreview.toLowerCase().endsWith(".pdf")
            : false;

    const dvlaCardUrl =
        dvlaCardFile instanceof File
            ? URL.createObjectURL(dvlaCardFile)
            : filePreviews.dvlaCard ||
            (formData.dvlaCard && formData.dvlaCard.url) ||
            null;

    const dvlaCardName =
        dvlaCardFile?.name ||
        dvlaCardPreviewName ||
        (formData.dvlaCard && formData.dvlaCard.name) ||
        "";

    // Get Driver Private Hire Paper preview URL
    const driverPrivateHirePaperFile = formData.driverPrivateHirePaper;
    const driverPrivateHirePaperPreviewName =
        filePreviews.driverPrivateHirePaperName;
    const driverPrivateHirePaperName =
        driverPrivateHirePaperFile?.name ||
        driverPrivateHirePaperPreviewName ||
        (formData.driverPrivateHirePaper && formData.driverPrivateHirePaper.name) ||
        "";
    const driverPrivateHirePaperUrl =
        driverPrivateHirePaperFile instanceof File
            ? URL.createObjectURL(driverPrivateHirePaperFile)
            : filePreviews.driverPrivateHirePaper ||
            (formData.driverPrivateHirePaper &&
                formData.driverPrivateHirePaper.url) ||
            null;

    const driverPrivateHirePaperIsPdf =
        driverPrivateHirePaperFile instanceof File
            ? driverPrivateHirePaperFile.type === "application/pdf"
            : false;

    const driverPrivateHirePaperPreviewIsPdf =
        typeof driverPrivateHirePaperUrl === "string"
            ? driverPrivateHirePaperUrl.toLowerCase().endsWith(".pdf")
            : false;


    return (
        <>
            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label>Employee No. *</label>
                        <input
                            className="custom_input"
                            name="employeeNumber"
                            value={formData.employeeNumber}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label>First Name *</label>
                        <input
                            className="custom_input"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label>Sur Name *</label>
                        <input
                            className="custom_input"
                            name="surName"
                            value={formData.surName}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label>Email *</label>
                        <input
                            type="email"
                            className="custom_input"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label>Contact *</label>
                        <input
                            type="tel"
                            className="custom_input"
                            name="contact"
                            value={formData.contact}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="w-full">
                        <label htmlFor="status">Status</label>
                        <select
                            id="status"
                            name="status"
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900"
                            value={formData.status}
                            onChange={handleInputChange}
                        >
                            <option value="">Select Status</option>
                            <option value="Active">Active</option>
                            <option value="Deleted">Deleted</option>
                            <option value="Pending">Pending</option>
                            <option value="Suspended">Suspended</option>
                            <option value="Expired">Expired</option>
                        </select>
                    </div>

                    <div>
                        <label>D.O.B.</label>
                        <input
                            type="date"
                            className="custom_input"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div>
                        <label>Driving License</label>
                        <input
                            className="custom_input"
                            name="driverLicense"
                            value={formData.driverLicense}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label>Driving License Expiry</label>
                        <input
                            type="date"
                            className="custom_input"
                            name="driverLicenseExpiry"
                            value={formData.driverLicenseExpiry}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label>Driver Private Hire Card No.</label>
                        <input
                            className="custom_input"
                            name="privateHireCardNo"
                            value={formData.privateHireCardNo}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label>Driver Private Hire License Expiry</label>
                        <input
                            type="date"
                            className="custom_input"
                            name="driverPrivateHireLicenseExpiry"
                            value={formData.driverPrivateHireLicenseExpiry}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div>
                        <label>NI Number</label>
                        <input
                            className="custom_input"
                            name="NationalInsurance"
                            value={formData.NationalInsurance}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
            </div>

            <div>
                <label>Address</label>
                <textarea
                    className="custom_input"
                    rows="2"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                />
            </div>

            <div className="mt-3">
                <label>Holidays</label>

                {formData.availability?.map((slot, index) => (
                    <div
                        key={index}
                        className="flex flex-col mt-2 md:flex-row md:items-center gap-2 mb-3"
                    >
                        <div className="flex items-center gap-2 w-full">
                            <label className="text-xs mb-1 text-gray-500">From:</label>
                            <input
                                type="date"
                                name={`availability[${index}].from`}
                                value={slot?.from || ""}
                                onChange={(e) => handleInputChange(e, index, "from")}
                                className="custom_input"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full">
                            <label className="text-xs mb-1 text-gray-500">To:</label>
                            <input
                                type="date"
                                name={`availability[${index}].to`}
                                value={slot.to || ""}
                                onChange={(e) => handleInputChange(e, index, "to")}
                                className="custom_input"
                            />
                        </div>
                        <div>
                            {index > 0 && (
                                <div className="p-2 ">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveAvailability(index)}
                                        className=" btn btn-cancel"
                                    >
                                        <Icons.X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {formData.availability?.length < 3 && (
                    <button
                        type="button"
                        onClick={handleAddAvailability}
                        className="flex items-center mt-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                        <Icons.Plus size={16} className="mr-1" />
                        Add Holidays
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* DVLA Card */}
                <div>
                    <label>DVLA Card</label>
                    <div className="flex mt-2 items-center gap-4">
                        {dvlaCardFile ? (
                            dvlaCardIsPdf ? (
                                <div className="w-36 h-24 flex flex-col items-center justify-center border-gray-300 border-2 bg-gray-100">
                                    <Icons.FileText className="w-10 h-10 text-red-600" />
                                    <p className="text-xs text-black mt-1 px-2 text-center break-all">
                                        {(dvlaCardName || "PDF File").slice(0, 20)}
                                    </p>
                                </div>
                            ) : (
                                <img
                                    src={dvlaCardUrl}
                                    alt={dvlaCardName}
                                    className="w-36 h-24 object-cover border-gray-300 border-2"
                                />
                            )
                        ) : dvlaCardUrl ? (
                            dvlaCardPreviewIsPdf ? (
                                <div className="w-36 h-24 flex flex-col items-center justify-center border-gray-300 border-2 bg-gray-100">
                                    <Icons.FileText className="w-10 h-10 text-red-600" />
                                    <p className="text-xs text-black mt-1 px-2 text-center break-all">
                                        {(dvlaCardPreviewName || "PDF File").slice(0, 20)}
                                    </p>
                                </div>
                            ) : (
                                <img
                                    src={dvlaCardUrl}
                                    alt="DVLA Card Preview"
                                    className="w-36 h-24 object-cover border-gray-300 border-2"
                                />
                            )
                        ) : (
                            <img
                                src={IMAGES.dummyFile}
                                alt="DVLA Card Dummy"
                                className="w-36 h-24 object-cover border-gray-300 border-2"
                            />
                        )}

                        <div>
                            <input
                                type="file"
                                id="dvlaCard"
                                name="dvlaCard"
                                accept="image/*,application/pdf"
                                className="custom_input hidden"
                                onChange={handleInputChange}
                            />
                            <label
                                htmlFor="dvlaCard"
                                className="btn btn-primary cursor-pointer"
                            >
                                Choose file
                            </label>
                        </div>
                    </div>
                </div>

                {/* Driver Private Hire Paper */}
                <div>
                    <label>Driver Private Hire Paper</label>
                    <div className="flex mt-2 items-center gap-4">
                        {driverPrivateHirePaperFile ? (
                            driverPrivateHirePaperIsPdf ||
                                driverPrivateHirePaperPreviewIsPdf ? (
                                <div className="w-36 h-24 flex flex-col items-center justify-center border-gray-300 border-2 bg-gray-100">
                                    <Icons.FileText className="w-10 h-10 text-red-600" />
                                    <p className="text-xs text-black mt-1 px-2 text-center break-all">
                                        {(driverPrivateHirePaperName || "PDF File").slice(0, 20)}
                                    </p>
                                </div>
                            ) : (
                                <img
                                    src={driverPrivateHirePaperUrl}
                                    alt={driverPrivateHirePaperFile.name}
                                    className="w-36 h-24 object-cover border-gray-300 border-2"
                                />
                            )
                        ) : driverPrivateHirePaperUrl ? (
                            driverPrivateHirePaperIsPdf ||
                                driverPrivateHirePaperPreviewIsPdf ? (
                                <div className="w-36 h-24 flex flex-col items-center justify-center border-gray-300 border-2 bg-gray-100">
                                    <Icons.FileText className="w-10 h-10 text-red-600" />
                                    <p className="text-xs text-black mt-1 px-2 text-center break-all">
                                        {(driverPrivateHirePaperName || "PDF File").slice(0, 20)}
                                    </p>
                                </div>
                            ) : (
                                <img
                                    src={driverPrivateHirePaperUrl}
                                    alt="Driver Private Hire Paper"
                                    className="w-36 h-24 object-cover border-gray-300 border-2"
                                />
                            )
                        ) : (
                            <img
                                src={IMAGES.dummyFile}
                                alt="Driver Private Hire Paper Dummy"
                                className="w-36 h-24 object-cover border-gray-300 border-2"
                            />
                        )}

                        <div>
                            <input
                                type="file"
                                id="driverPrivateHirePaper"
                                name="driverPrivateHirePaper"
                                accept="image/*,application/pdf"
                                className="custom_input hidden"
                                onChange={handleInputChange}
                            />
                            <label
                                htmlFor="driverPrivateHirePaper"
                                className="btn btn-primary cursor-pointer"
                            >
                                Choose file
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-12 mt-12">
                <hr className=" border-gray-300" />
            </div>
        </>
    );
};

export default DriverData; 