import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Icons from "../../../assets/icons";
import usePasswordToggle from "../../../hooks/usePasswordToggle";
import { useCreateClientAdminMutation } from "../../../redux/api/adminApi";
import { useLocation, useNavigate } from "react-router-dom";

const AddCustomer = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const passedEmail = location.state?.email || "";

    const user = useSelector((state) => state.auth.user);
    const [createAdmin] = useCreateClientAdminMutation();

    const { type: passwordType, visible: passwordVisible, toggleVisibility } =
        usePasswordToggle();

    const [formData, setFormData] = useState({
        fullName: "",
        email: passedEmail,
        password: "",
        role: "customer",
        status: "Active",
        permissions: [],
    });

    const handleSave = async () => {
        if (!formData.fullName || !formData.email || !formData.password) {
            toast.error("Please fill in all required fields.");
            return;
        }

        try {
            const payload = {
                ...formData,
                companyId: user?.companyId || user?._id,
                createdBy: user?._id,
            };

            await createAdmin(payload).unwrap();
            toast.success("Customer created successfully");

            setTimeout(() => {
                navigate("/login");
            }, 500);
        } catch (err) {
            toast.error(err?.data?.message || "Failed to create customer");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-green-50">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-center text-[var(--dark-gray)] mb-6">
                    Add Customer Account
                </h2>

                <input
                    type="text"
                    placeholder="Full Name"
                    className="custom_input mb-4 w-full"
                    value={formData.fullName}
                    onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                    }
                />

                <input
                    type="email"
                    placeholder="Email"
                    className={`custom_input mb-4 w-full ${passedEmail ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    disabled={!!passedEmail}
                    value={formData.email}
                />

                <div className="relative mb-6">
                    <input
                        type={passwordType}
                        placeholder="Password"
                        className="custom_input w-full"
                        value={formData.password}
                        onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                        }
                    />
                    <span
                        className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-500"
                        onClick={toggleVisibility}
                    >
                        {passwordVisible ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
                    </span>
                </div>

                <div className="flex justify-end">
                    <button
                        className="btn btn-success w-full sm:w-auto"
                        onClick={handleSave}
                    >
                        Create Customer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddCustomer;
