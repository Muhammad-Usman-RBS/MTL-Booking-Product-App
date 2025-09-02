import React from "react";
import { useSelector } from "react-redux";
import { useGetCompanyByIdQuery } from "../../../redux/api/companyApi";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const ViewCompany = () => {
    const user = useSelector((state) => state.auth.user);
    const companyId = user?.companyId;

    const { data: company, isLoading, error } = useGetCompanyByIdQuery(companyId, {
        skip: !companyId,
    });

    if (isLoading) return <p className="p-4 text-gray-500">Loading company info...</p>;
    if (error) return <p className="p-4 text-red-500">Failed to load company info</p>;
    if (!company) return <p className="p-4 text-gray-400">No company data found.</p>;

    // Define fields to display in order
    const fields = [
        { label: "Full Name", value: company.fullName },
        { label: "Trading Name", value: company.tradingName },
        { label: "Phone", value: company.contact ? `+${company.contact}` : null },
        { label: "Address", value: company.address },
        { label: "Licensed By", value: company.licensedBy },
        { label: "License Number", value: company.licenseNumber },
        { label: "Referrer Link", value: company.referrerLink },
        { label: "Cookie Consent", value: company.cookieConsent },
    ];

    return (
        <>
            <OutletHeading name="Company Details" />
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
                {/* Header with name + email + logo */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold uppercase text-gray-800 mb-1">
                            {company.companyName}
                        </h2>
                        {company.email && (
                            <p className="text-sm text-gray-500">{company.email}</p>
                        )}
                    </div>
                    {company?.profileImage ? (
                        <div className="mt-4 sm:mt-0 w-20 h-20 flex items-center justify-center rounded-md border border-gray-300 shadow-md bg-gray-50">
                            <img
                                src={company.profileImage}
                                alt="Company Logo"
                                className="w-full h-full object-cover rounded-md"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "";
                                }}
                            />
                        </div>
                    ) : (
                        <div className="mt-4 sm:mt-0 w-20 h-20 flex items-center justify-center rounded-md border border-gray-300 shadow-md bg-gray-50">
                            <Icons.Building2 className="w-10 h-10 text-gray-400" />
                        </div>
                    )}
                </div>

                <hr className="mb-6 border-[var(--light-gray)]" />

                {/* Info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-gray-700">
                    {fields.map(
                        (field, idx) =>
                            field.value && (
                                <p key={idx}>
                                    <strong>{field.label}:</strong> {field.value}
                                </p>
                            )
                    )}
                </div>
            </div>
        </>
    );
};

export default ViewCompany;
