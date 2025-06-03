import React, { useState } from 'react'
import IMAGES from "../../../assets/images";

const VehicleData = ({ filePreviews, handleInputChange, handleCheckboxChange, formData }) => {
    const [vehicleImage, setVehicleImage] = useState(null);
    const handleVehicleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVehicleImage(URL.createObjectURL(file));
        }
    };
    return (
        <>
            <div>   <h3 className="text-xl font-semibold mt-6">Vehicle Information</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                    {vehicleImage ? (
                        <img
                            src={vehicleImage}
                            alt="Profile Preview"
                            className="w-64 h-40 object-cover border-gray-300 border-2"
                        />
                    ) : (
                        <img
                            src={filePreviews.carPicture || IMAGES.dummyFile || formData.carPicture}
                            alt="Profile Preview"
                            className="w-64 h-40 object-cover border-gray-300 border-2"
                        />
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
                            name='carPicture'
                            type="file"
                            accept="image/*"
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
                            value={formData.carMake || ''}
                            onChange={handleInputChange}
                            className="custom_input"
                        />
                    </div>
                    <div>
                        <label>Vehicle Model</label>
                        <input
                            name="carModal"
                            value={formData.carModal || ''}
                            onChange={handleInputChange}
                            className="custom_input"
                        />
                    </div>
                    <div>
                        <label>Vehicle Color</label>
                        <input
                            name="carColor"
                            value={formData.carColor || ''}
                            onChange={handleInputChange}
                            className="custom_input"
                        />
                    </div>
                    <div>
                        <label>Vehicle Reg. No.</label>
                        <input
                            name="carRegistration"
                            value={formData.carRegistration || ''}
                            onChange={handleInputChange}
                            className="custom_input"
                        />
                    </div>
                    <div>
                        <label>Vehicle Insurance</label>
                        <input
                            type='date'
                            name="carInsuranceExpiry"
                            value={formData.carInsuranceExpiry || ''}
                            onChange={handleInputChange}
                            className="custom_input"
                        />
                    </div>
                    <div>
                        <label>Vehicle Insurance Expiry</label>
                        <input
                            type="date"
                            name="vehicleInsuranceExpiry"
                            value={formData.vehicleInsuranceExpiry || ''}
                            onChange={handleInputChange}
                            className="custom_input"
                        />
                    </div>
                    <div>
                        <label>Vehicle Private Hire License</label>
                        <input
                            name="carPrivateHireLicense"
                            value={formData.carPrivateHireLicense || ''}
                            onChange={handleInputChange}
                            className="custom_input"
                        />
                    </div>
                    <div>
                        <label>Vehicle Taxi License Expiry</label>
                        <input
                            type="date"
                            name="carPrivateHireLicenseExpiry"
                            value={formData.carPrivateHireLicenseExpiry || ''}
                            onChange={handleInputChange}
                            className="custom_input"
                        />
                    </div>
                    <div>
                        <label>MOT Expiry</label>
                        <input
                            type='date'
                            name="motExpiryDate"
                            value={formData.motExpiryDate || ''}
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
                        <img
                            src={filePreviews.privateHireCard || IMAGES.profilecarimg || formData.privateHireCard}
                            alt="Private Hire Card Preview"
                            className="w-36 h-24 object-cover border-gray-300 border-2 "
                        />
                        <div>
                            <input
                                type="file"
                                id="privateHireCard"
                                name="privateHireCard"
                                accept="image/*,application/pdf"
                                className="custom_input hidden"
                                onChange={handleInputChange}
                            />
                            <label htmlFor="privateHireCard" className="btn btn-primary cursor-pointer">
                                Choose file
                            </label>
                        </div>
                    </div>
                </div>


                {/* Private Hire Car Paper */}
                <div>
                    <label>Private Hire Car Paper</label>
                    <div className="flex mt-2 items-center gap-4">
                        <img
                            src={filePreviews.privateHireCarPaper || IMAGES.profilecarimg || formData.privateHireCarPaper}
                            alt="Private Hire Car Paper Preview"
                            className="w-36 h-24 object-cover border-gray-300 border-2 "
                        />
                        <div>
                            <input
                                type="file"
                                id="privateHireCarPaper"
                                name="privateHireCarPaper"
                                accept="image/*,application/pdf"
                                className="custom_input hidden"
                                onChange={handleInputChange}
                            />
                            <label htmlFor="privateHireCarPaper" className="btn btn-primary cursor-pointer">
                                Choose file
                            </label>
                        </div>
                    </div>
                </div>

                {/* Insurance */}
                <div>
                    <label>Insurance</label>
                    <div className="flex mt-2 items-center gap-4">
                        <img
                            src={filePreviews.insurance || IMAGES.profilecarimg || formData.insurance}
                            alt="Insurance Preview"
                            className="w-36 h-24 object-cover border-gray-300 border-2 "
                        />
                        <div>
                            <input
                                type="file"
                                id="insurance"
                                name="insurance"
                                accept="image/*,application/pdf"
                                className="custom_input hidden"
                                onChange={handleInputChange}
                            />
                            <label htmlFor="insurance" className="btn btn-primary cursor-pointer">
                                Choose file
                            </label>
                        </div>
                    </div>
                </div>

                {/* MOT Expiry */}
                <div>
                    <label>MOT Expiry</label>
                    <div className="flex mt-2 items-center gap-4">
                        <img
                            src={filePreviews?.motExpiry || IMAGES.profilecarimg || formData?.motExpiry}
                            alt="MOT Expiry Preview"
                            className="w-36 h-24 object-cover border-gray-300 border-2 "
                        />
                        <div>
                            <input
                                type="file"
                                id="motExpiry"
                                name="motExpiry"
                                accept="image/*,application/pdf"
                                className="custom_input hidden"
                                onChange={handleInputChange}
                            />
                            <label htmlFor="motExpiry" className="btn btn-primary cursor-pointer">
                                Choose file
                            </label>
                        </div>
                    </div>
                </div>

                {/* V5 */}
                <div>
                    <label>V5</label>
                    <div className="flex mt-2 items-center gap-4">
                        <img
                            src={filePreviews.V5 || IMAGES.profilecarimg || formData.V5}
                            alt="V5 Preview"
                            className="w-36 h-24 object-cover border-gray-300 border-2 "
                        />
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
            {/* VEHICLE TYPES */}
            <div className="mt-4">
                <label className="block font-semibold">Vehicle Types *</label>

                <div className="grid grid-cols-3 grid-rows-3 gap-2">
                    {[
                        "Standard Sedan",
                        "Luxury",
                        "SUV",
                        "Van / MPV",
                        "Commercial MPV",
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

export default VehicleData
