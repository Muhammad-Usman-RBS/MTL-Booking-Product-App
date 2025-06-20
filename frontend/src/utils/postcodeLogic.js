import { useGetMapKeyQuery } from "../redux/api/googleApi";

// ✅ Google PlaceId Based Matching (React hook version)
export const useVerifyPostcodeFromAddress = (dbPostcodes) => {
    const { data, isLoading, error } = useGetMapKeyQuery();

    const verifyPostcodeFromAddress = async (placeId) => {
        try {
            const apiKey = data?.mapKey;
            if (!apiKey) {
                console.error("Google API Key missing");
                return null;
            }

            const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=address_components&key=${apiKey}`);
            const resultData = await response.json();

            const components = resultData.result?.address_components || [];
            const postcode = components.find(c => c.types.includes("postal_code"))?.long_name;

            if (!postcode) {
                return null;
            }

            const districtMatch = postcode.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)/i);
            const district = districtMatch ? districtMatch[1].toUpperCase() : null;

            const matched = dbPostcodes.find(item =>
                item.pickup.toUpperCase() === district || item.dropoff.toUpperCase() === district
            );

            return matched || null;

        } catch (err) {
            console.error(err);
            return null;
        }
    };

    return { verifyPostcodeFromAddress, isLoading, error };
};

// ✅ Pure Text Based Postcode Extraction (this stays same as before)
export const verifyPostcodeFromText = (pickupText, dbPostcodes) => {
    const postcodeMatch = pickupText.match(/\b[A-Z]{1,2}\d{1,2}[A-Z]?\b/i);
    if (!postcodeMatch) {
        return null;
    }

    const manualPostcode = postcodeMatch[0].toUpperCase();

    const matched = dbPostcodes.find(item =>
        item.pickup.toUpperCase() === manualPostcode || item.dropoff.toUpperCase() === manualPostcode
    );

    return matched || null;
};
