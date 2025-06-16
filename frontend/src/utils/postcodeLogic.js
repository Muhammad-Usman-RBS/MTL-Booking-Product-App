export const findCheckedPrice = (postcodePrices, pickupLocation, dropoffLocation) => {

    const extractPostcodeDistrict = (address) => {
        if (!address) return '';

        // This regex looks for full UK postcode anywhere inside the address
        const match = address.match(/([A-Z]{1,2}\d{1,2}[A-Z]?)\s?\d[A-Z]{2}/gi);
        
        if (match && match[0]) {
            const fullPostcode = match[0].toUpperCase().replace(/\s/g, '');  // remove any space
            const district = fullPostcode.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)/i);
            return district ? district[1].toUpperCase() : '';
        }
        return '';
    };

    const pickupCode = extractPostcodeDistrict(pickupLocation);
    const dropoffCode = extractPostcodeDistrict(dropoffLocation);

    console.log("Extracted Pickup Code:", pickupCode);
    console.log("Extracted Dropoff Code:", dropoffCode);

    const matched = postcodePrices.find(item =>
        (item.pickup.toUpperCase() === pickupCode && item.dropoff.toUpperCase() === dropoffCode) ||
        (item.pickup.toUpperCase() === dropoffCode && item.dropoff.toUpperCase() === pickupCode)
    );

    if (matched) {
        alert(`Price Found: £${matched.price}`);
        return matched;
    } else {
        alert("No pricing data found for selected postcodes.");
        return null;
    }
};
 