import React, { useEffect } from "react";
import Icons from "../../../assets/icons";
import { useSelector } from "react-redux";
import { useGetCompanyByIdQuery } from "../../../redux/api/companyApi";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import { useLoading } from "../../common/LoadingProvider";
import { formatPhoneNumber } from "../../../utils/formatPhoneNumber";

const ViewCompany = () => {
    const user = useSelector((state) => state.auth.user);
    const companyId = user?.companyId;
    const { showLoading, hideLoading } = useLoading()

    const { data: company, isLoading, error } = useGetCompanyByIdQuery(companyId, {
        skip: !companyId,
    });
    useEffect(() => {
        if (isLoading) {
            showLoading()
        } else {
            hideLoading()
        }
    }, [isLoading, hideLoading, showLoading])
    if (error) return <p className="p-4 text-red-500">Failed to load company info</p>;
    if (!company) return <p className="p-4 text-gray-400">No company data found.</p>;

    // Define fields to display in order
    const fields = [
        { label: "Full Name", value: company.fullName },
        { label: "Trading Name", value: company.tradingName },
        { label: "Phone", value: company.contact ? `${formatPhoneNumber(company.contact)}` : null },
        { label: "Licensed By", value: company.licensedBy },
        { label: "License Number", value: company.licenseNumber },
        { label: "Website", value: company.website },
        { label: "Address", value: company.address },
        { label: "Cookie Consent", value: company.cookieConsent },
    ];

    return (
        <>
            <OutletHeading name="Company Details" />
            <div className="max-w-4xl w-full overflow-hidden mx-auto bg-white shadow-lg rounded-xl p-4 sm:p-8">
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
                                className="w-full h-full object-contain rounded-md"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm text-gray-700">
                    {fields.map(
                        (field, idx) =>
                            field.value && (
                                <div key={idx} className="flex items-start gap-1">
                                    <strong className="min-w-[130px]">{field.label}:</strong>
                                    {field.label === "Address" ? (
                                        <span style={{ whiteSpace: "pre-line" }}>{field.value}</span>
                                    ) : (
                                        <span className="break-all">{field.value}</span>
                                    )}
                                </div>
                            )
                    )}
                </div>
            </div>
        </>
    );
};

export default ViewCompany;
