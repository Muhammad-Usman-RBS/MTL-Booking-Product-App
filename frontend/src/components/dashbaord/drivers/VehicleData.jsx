import React, { useState } from "react";
import Icons from "../../../assets/icons";

const VehicleData = ({
    filePreviews,
    handleInputChange,
    handleCheckboxChange,
    formData,
}) => {


    const privateHireCardFile = formData.privateHireCard;
    const privateHireCardPreview = filePreviews.privateHireCard;
    const privateHireCardIsPdf =
        privateHireCardFile instanceof File
            ? privateHireCardFile.type === "application/pdf"
            : false;
    const privateHireCardPreviewIsPdf =
        typeof privateHireCardPreview === "string"
            ? privateHireCardPreview.toLowerCase().endsWith(".pdf")
            : false;

    // ---------- Private Hire Car Paper ----------
    const privateHireCarPaperFile = formData.privateHireCarPaper;
    const privateHireCarPaperPreview = filePreviews.privateHireCarPaper;
    const privateHireCarPaperIsPdf =
        privateHireCarPaperFile instanceof File
            ? privateHireCarPaperFile.type === "application/pdf"
            : false;
    const privateHireCarPaperPreviewIsPdf =
        typeof privateHireCarPaperPreview === "string"
            ? privateHireCarPaperPreview.toLowerCase().endsWith(".pdf")
            : false;

    // ---------- Insurance ----------
    const insuranceFile = formData.insurance;
    const insurancePreview = filePreviews.insurance;
    const insuranceIsPdf =
        insuranceFile instanceof File ? insuranceFile.type === "application/pdf" : false;
    const insurancePreviewIsPdf =
        typeof insurancePreview === "string"
            ? insurancePreview.toLowerCase().endsWith(".pdf")
            : false;

    // ---------- MOT Expiry ----------
    const motExpiryFile = formData.motExpiry;
    const motExpiryPreview = filePreviews.motExpiry;
    const motExpiryIsPdf =
        motExpiryFile instanceof File ? motExpiryFile.type === "application/pdf" : false;
    const motExpiryPreviewIsPdf =
        typeof motExpiryPreview === "string"
            ? motExpiryPreview.toLowerCase().endsWith(".pdf")
            : false;

    // ---------- V5 ----------
    const V5File = formData.V5;
    const V5Preview = filePreviews.V5;
    const V5IsPdf = V5File instanceof File ? V5File.type === "application/pdf" : false;
    const V5PreviewIsPdf =
        typeof V5Preview === "string" ? V5Preview.toLowerCase().endsWith(".pdf") : false;


    return (
        <>
            <div>
                <h3 className="text-xl font-semibold mt-6">Vehicle Information</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 mt-2">

                    {filePreviews.carPicture || formData.carPicture ? (
                        <img
                        src={filePreviews.carPicture || formData.carPicture}
                            alt="Car Picture Preview"
                            className="w-64 h-40 object-cover border-gray-300 border-2"
                        />
                    ) : (
                        <div className="w-64 h-40 border border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-sm font-light">
                            No Car Image Uploaded
                        </div>
                    )}
                    <div>
                        <label className="block font-medium text-sm mb-1">
                            Upload Car Image
                        </label>
                        <label
                            htmlFor="carPicture"
                            className="btn btn-edit mt-1 cursor-pointer inline-block"
                        >
                            Choose File
                        </label>
                        <input
                            id="carPicture"
                            name="carPicture"
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleInputChange}
                            className="hidden"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label>Vehicle Make</label>
                        <input
                            name="carMake"
                            value={formData.carMake || ""}
                            onChange={handleInputChange}
                            className="custom_input"
                        />
                    </div>
                    <div>
                        <label>Vehicle Model</label>
                        <input
                            name="carModal"
                            value={formData.carModal || ""}
                            onChange={handleInputChange}
                            className="custom_input"
                        />
                    </div>
                    <div>
                        <label>Vehicle Color</label>
                        <input
                            name="carColor"
                            value={formData.carColor || ""}
                            onChange={handleInputChange}
                            className="custom_input"
                        />
                    </div>
                    <div>
                        <label>Vehicle Reg. No.</label>
                        <input
                            name="carRegistration"
                            value={formData.carRegistration || ""}
                            onChange={handleInputChange}
                            className="custom_input"
                        />
                    </div>

                    <div>
                        <label>Vehicle Insurance Expiry</label>
                        <input
                            type="date"
                            name="carInsuranceExpiry"
                            value={formData.carInsuranceExpiry || ""}
                            onChange={handleInputChange}
                            className="custom_input"
                        />
                    </div>
                    <div>
                        <label>Vehicle Private Hire License</label>
                        <input
                            name="carPrivateHireLicense"
                            value={formData.carPrivateHireLicense || ""}
                            onChange={handleInputChange}
                            className="custom_input"
                        />
                    </div>
                    <div>
                        <label>Vehicle Private Hire License Expiry</label>
                        <input
                            type="date"
                            name="carPrivateHireLicenseExpiry"
                            value={formData.carPrivateHireLicenseExpiry || ""}
                            onChange={handleInputChange}
                            className="custom_input"
                        />
                    </div>
                    <div>
                        <label>MOT Expiry</label>
                        <input
                            type="date"
                            name="motExpiryDate"
                            value={formData.motExpiryDate || ""}
                            onChange={handleInputChange}
                            className="custom_input"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Private Hire Card */}
                <div>
                    <label>Private Hire Card</label>
                    <div className="flex mt-2 items-center gap-4">
                        {privateHireCardFile ? (
                            privateHireCardIsPdf ? (
                                <div className="w-36 h-24 flex flex-col items-center justify-center border-gray-300 border-2 bg-gray-100">
                                    <Icons.FileText className="w-10 h-10 text-red-600" />
                                    <p className="text-xs text-black mt-1 px-2 text-center break-all">
                                        {privateHireCardFile.name.slice(0, 20)}
                                    </p>
                                </div>
                            ) : (
                                <img
                                    src={privateHireCardPreview}
                                    alt={privateHireCardFile.name}
                                    className="w-36 h-24 object-cover border-gray-300 border-2"
                                />
                            )
                        ) : privateHireCardPreview ? (
                            privateHireCardPreviewIsPdf ? (
                                <div className="w-36 h-24 flex flex-col items-center justify-center border-gray-300 border-2 bg-gray-100">
                                    <Icons.FileText className="w-10 h-10 text-red-600" />
                                    <p className="text-xs text-black mt-1 px-2 text-center break-all">
                                    </p>
                                </div>
                            ) : (
                                <img
                                    src={privateHireCardPreview}
                                    alt="Private Hire Card"
                                    className="w-36 h-24 object-cover border-gray-300 border-2"
                                />
                            )
                        ) : (
                            <div className="w-36 h-24 border border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-xs font-light">
                                No File Uploaded
                            </div>
                        )}
                        <div>
                            <input
                                type="file"
                                id="privateHireCard"
                                name="privateHireCard"
                                accept="image/*,application/pdf"
                                className="custom_input hidden"
                                onChange={handleInputChange}
                            />
                            <label
                                htmlFor="privateHireCard"
                                className="btn btn-primary cursor-pointer"
                            >
                                Choose file
                            </label>
                        </div>
                    </div>
                </div>


                {/* Private Hire Car Paper */}
                <div>
                    <label>Private Hire Car Paper</label>
                    <div className="flex mt-2 items-center gap-4">
                        {privateHireCarPaperFile ? (
                            privateHireCarPaperIsPdf ? (
                                <div className="w-36 h-24 flex flex-col items-center justify-center border-gray-300 border-2 bg-gray-100">
                                    <Icons.FileText className="w-10 h-10 text-red-600" />
                                    <p className="text-xs text-black mt-1 px-2 text-center break-all">
                                        {privateHireCarPaperFile.name.slice(0, 20)}
                                    </p>
                                </div>
                            ) : (
                                <img
                                    src={privateHireCarPaperPreview}
                                    alt={privateHireCarPaperFile.name}
                                    className="w-36 h-24 object-cover border-gray-300 border-2"
                                />
                            )
                        ) : privateHireCarPaperPreview ? (
                            privateHireCarPaperPreviewIsPdf ? (
                                <div className="w-36 h-24 flex flex-col items-center justify-center border-gray-300 border-2 bg-gray-100">
                                    <Icons.FileText className="w-10 h-10 text-red-600" />
                                    <p className="text-xs text-black mt-1 px-2 text-center break-all">
                                    </p>
                                </div>
                            ) : (
                                <img
                                    src={privateHireCarPaperPreview}
                                    alt="Private Hire Car Paper Preview"
                                    className="w-36 h-24 object-cover border-gray-300 border-2"
                                />
                            )
                        ) : (
                            <div className="w-36 h-24 border border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-xs font-light">
                                No File Uploaded
                            </div>
                        )}
                        <div>
                            <input
                                type="file"
                                id="privateHireCarPaper"
                                name="privateHireCarPaper"
                                accept="image/*,application/pdf"
                                className="custom_input hidden"
                                onChange={handleInputChange}
                            />
                            <label
                                htmlFor="privateHireCarPaper"
                                className="btn btn-primary cursor-pointer"
                            >
                                Choose file
                            </label>
                        </div>
                    </div>
                </div>

                {/* Insurance */}
                <div>
                    <label>Insurance</label>
                    <div className="flex mt-2 items-center gap-4">
                        {insuranceFile ? (
                            insuranceIsPdf ? (
                                <div className="w-36 h-24 flex flex-col items-center justify-center border-gray-300 border-2 bg-gray-100">
                                    <Icons.FileText className="w-10 h-10 text-red-600" />
                                    <p className="text-xs text-black mt-1 px-2 text-center break-all">
                                        {insuranceFile.name.slice(0, 20)}
                                    </p>
                                </div>
                            ) : (
                                <img
                                    src={insurancePreview}
                                    alt={insuranceFile.name}
                                    className="w-36 h-24 object-cover border-gray-300 border-2"
                                />
                            )
                        ) : insurancePreview ? (
                            insurancePreviewIsPdf ? (
                                <div className="w-36 h-24 flex flex-col items-center justify-center border-gray-300 border-2 bg-gray-100">
                                    <Icons.FileText className="w-10 h-10 text-red-600" />
                                    <p className="text-xs text-black mt-1 px-2 text-center break-all">
                                    </p>
                                </div>
                            ) : (
                                <img
                                    src={insurancePreview}
                                    alt="Insurance"
                                    className="w-36 h-24 object-cover border-gray-300 border-2"
                                />
                            )
                        ) : (
                            <div className="w-36 h-24 border border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-xs font-light">
                                No File Uploaded
                            </div>
                        )}
                        <div>
                            <input
                                type="file"
                                id="insurance"
                                name="insurance"
                                accept="image/*,application/pdf"
                                className="custom_input hidden"
                                onChange={handleInputChange}
                            />
                            <label
                                htmlFor="insurance"
                                className="btn btn-primary cursor-pointer"
                            >
                                Choose file
                            </label>
                        </div>
                    </div>
                </div>

                {/* MOT Expiry */}
                <div>
                    <label>MOT Expiry</label>
                    <div className="flex mt-2 items-center gap-4">
                        {motExpiryFile ? (
                            motExpiryIsPdf ? (
                                <div className="w-36 h-24 flex flex-col items-center justify-center border-gray-300 border-2 bg-gray-100">
                                    <Icons.FileText className="w-10 h-10 text-red-600" />
                                    <p className="text-xs text-black mt-1 px-2 text-center break-all">
                                        {motExpiryFile.name.slice(0, 20)}
                                    </p>
                                </div>
                            ) : (
                                <img
                                    src={motExpiryPreview}
                                    alt={motExpiryFile.name}
                                    className="w-36 h-24 object-cover border-gray-300 border-2"
                                />
                            )
                        ) : motExpiryPreview ? (
                            motExpiryPreviewIsPdf ? (
                                <div className="w-36 h-24 flex flex-col items-center justify-center border-gray-300 border-2 bg-gray-100">
                                    <Icons.FileText className="w-10 h-10 text-red-600" />
                                    <p className="text-xs text-black mt-1 px-2 text-center break-all">
                                    </p>
                                </div>
                            ) : (
                                <img
                                    src={motExpiryPreview}
                                    alt="MOT Expiry"
                                    className="w-36 h-24 object-cover border-gray-300 border-2"
                                />
                            )
                        ) : (
                            <div className="w-36 h-24 border border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-xs font-light">
                                No File Uploaded
                            </div>
                        )}
                        <div>
                            <input
                                type="file"
                                id="motExpiry"
                                name="motExpiry"
                                accept="image/*,application/pdf"
                                className="custom_input hidden"
                                onChange={handleInputChange}
                            />
                            <label
                                htmlFor="motExpiry"
                                className="btn btn-primary cursor-pointer"
                            >
                                Choose file
                            </label>
                        </div>
                    </div>
                </div>

                {/* V5 */}
                <div>
                    <label>V5</label>
                    <div className="flex mt-2 items-center gap-4">
                        {V5File ? (
                            V5IsPdf ? (
                                <div className="w-36 h-24 flex flex-col items-center justify-center border-gray-300 border-2 bg-gray-100">
                                    <Icons.FileText className="w-10 h-10 text-red-600" />
                                    <p className="text-xs text-black mt-1 px-2 text-center break-all">
                                        {V5File.name.slice(0, 20)}
                                    </p>
                                </div>
                            ) : (
                                <img
                                    src={V5Preview}
                                    alt={V5File.name}
                                    className="w-36 h-24 object-cover border-gray-300 border-2"
                                />
                            )
                        ) : V5Preview ? (
                            V5PreviewIsPdf ? (
                                <div className="w-36 h-24 flex flex-col items-center justify-center border-gray-300 border-2 bg-gray-100">
                                    <Icons.FileText className="w-10 h-10 text-red-600" />
                                    <p className="text-xs text-black mt-1 px-2 text-center break-all">
                                    </p>
                                </div>
                            ) : (
                                <img
                                    src={V5Preview}
                                    alt="V5"
                                    className="w-36 h-24 object-cover border-gray-300 border-2"
                                />
                            )
                        ) : (
                            <div className="w-36 h-24 border border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-xs font-light">
                                No File Uploaded
                            </div>
                        )}
                        <div>
                            <input
                                type="file"
                                id="V5"
                                name="V5"
                                accept="image/*,application/pdf"
                                className="custom_input hidden"
                                onChange={handleInputChange}
                            />
                            <label htmlFor="V5" className="btn btn-primary cursor-pointer">
                                Choose file
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-6">
                <label className="block font-semibold mb-2">Vehicle Types *</label>

                <div className="grid grid-cols-3 grid-rows-3 gap-2">
                    {[
                        "Standard Sedan",
                        "Executive Sedan",
                        "Luxury Saloon",
                        "6 Passenger MPV",
                        "8 Passenger MPV",
                    ].map((type) => (
                        <div key={type} className="flex items-center">
                            <input
                                type="checkbox"
                                id={type.toLowerCase()}
                                onChange={handleCheckboxChange}
                                checked={formData.vehicleTypes.includes(type.toLowerCase())}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <label
                                className="ml-2 text-sm text-gray-700"
                                htmlFor={type.toLowerCase().replace(/ /g, "")}
                            >
                                {type}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default VehicleData;      