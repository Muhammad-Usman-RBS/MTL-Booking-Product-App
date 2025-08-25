import React from "react";
import Icons from "../../../../assets/icons";

const PriceBreakdown = ({
    activePricingMode,
    selectedCarFinalPrice,
    fixedZonePrice,
    matchedZonePrice,
    matchedZoneToZonePrice,
    matchedPostcodePrice,
    dropOffPrice,
    pickupAirportPrice,
    matchedSurcharge,
    dropoffAirportPrice,
    isHourlyMode,
    calculatedTotalPrice,
    currencySymbol = '£',
    currencyCode = 'GBP',
}) => (
    <div className="rounded-2xl p-6 bg-white shadow-md border border-gray-200">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-800 font-semibold text-lg">
                <Icons.ReceiptText className="w-5 h-5 text-blue-500" />
                <span>Price Breakdown</span>
            </div>
            {/* <span className="text-sm text-gray-500">GBP</span> */}
            <span className="text-sm text-gray-500">{currencyCode}</span>

        </div>

        <div className="text-sm text-blue-500">
            Pricing Mode:&nbsp;
            <strong>{activePricingMode.toUpperCase()}</strong>
        </div>

        {/* <div className="space-y-3 text-sm text-gray-700">
            <Line label="Base Fare" value={selectedCarFinalPrice} />

            {fixedZonePrice !== null && (
                <Line label="Fixed Zone Price" value={fixedZonePrice} />
            )}

            {!isHourlyMode && matchedZonePrice !== null && (
                <Line label="Zone Toll Price" value={matchedZonePrice} />
            )}

            {matchedZoneToZonePrice !== null && (
                <Line label="Zone-to-Zone Price" value={matchedZoneToZonePrice} />
            )}

            {!isHourlyMode && matchedPostcodePrice && (
                <Line label="Postcode Price" value={matchedPostcodePrice.price} />
            )}

            {dropOffPrice > 0 && (
                <Line label="Additional Drop-Offs" value={dropOffPrice} />
            )}

            {(pickupAirportPrice > 0 || dropoffAirportPrice > 0) && (
                <Line
                    label="Meet & Greet (Airport)"
                    value={pickupAirportPrice + dropoffAirportPrice}
                />
            )}

            {matchedSurcharge > 0 && (
                <div className="flex justify-between border-b border-dashed pb-2">
                    <span>Surcharge</span>
                    <span className="font-medium text-gray-900">
                        {matchedSurcharge.toFixed(2)}%
                    </span>
                </div>
            )}

            <div className="flex justify-between pt-2 mt-12 border-t border-[var(--light-gray)] text-base font-semibold">
                <span className="flex items-center">
                    Total
                    {isHourlyMode && (
                        <span className="ms-2 text-xs font-medium text-blue-600">
                            (Hourly Package Selected)
                        </span>
                    )}
                </span>
                {/* <span>£{calculatedTotalPrice.toFixed(2)}</span> 
                <span>{currencySymbol}{Number(calculatedTotalPrice || 0).toFixed(2)}</span>
            </div>
        </div> */}
        <div className="space-y-3 text-sm text-gray-700">
            <Line label="Base Fare" value={selectedCarFinalPrice} currencySymbol={currencySymbol} />

            {fixedZonePrice !== null && (
                <Line label="Fixed Zone Price" value={fixedZonePrice} currencySymbol={currencySymbol} />
            )}

            {!isHourlyMode && matchedZonePrice !== null && (
                <Line label="Zone Toll Price" value={matchedZonePrice} currencySymbol={currencySymbol} />
            )}

            {matchedZoneToZonePrice !== null && (
                <Line label="Zone-to-Zone Price" value={matchedZoneToZonePrice} currencySymbol={currencySymbol} />
            )}

            {!isHourlyMode && matchedPostcodePrice && (
                <Line label="Postcode Price" value={matchedPostcodePrice?.price} currencySymbol={currencySymbol} />
            )}

            {dropOffPrice > 0 && (
                <Line label="Additional Drop-Offs" value={dropOffPrice} currencySymbol={currencySymbol} />
            )}

            {(pickupAirportPrice > 0 || dropoffAirportPrice > 0) && (
                <Line
                    label="Meet & Greet (Airport)"
                    value={(pickupAirportPrice || 0) + (dropoffAirportPrice || 0)}
                    currencySymbol={currencySymbol}
                />
            )}

            {matchedSurcharge > 0 && (
                <div className="flex justify-between border-b border-dashed pb-2">
                    <span>Surcharge</span>
                    <span className="font-medium text-gray-900">{Number(matchedSurcharge).toFixed(2)}%</span>
                </div>
            )}

            <div className="flex justify-between pt-2 mt-12 border-t border-[var(--light-gray)] text-base font-semibold">
                <span className="flex items-center">
                    Total
                    {isHourlyMode && (
                        <span className="ms-2 text-xs font-medium text-blue-600">(Hourly Package Selected)</span>
                    )}
                </span>
                <span>
                    {currencySymbol}
                    {Number(calculatedTotalPrice || 0).toFixed(2)}
                </span>
            </div>
        </div>

    </div>
);

const Line = ({ label, value, currencySymbol = '£' }) => (
    <div className="flex justify-between border-b border-dashed pb-2">
        <span>{label}</span>
        {/* <span className="font-medium text-gray-900">£{value.toFixed(2)}</span> */}
        <span className="font-medium text-gray-900">
            {currencySymbol}{Number(value || 0).toFixed(2)}
        </span>
    </div>
);

export default PriceBreakdown;
