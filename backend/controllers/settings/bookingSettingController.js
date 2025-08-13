import BookingSetting from "../../models/settings/BookingSetting.js";

// GET - fetch setting
export const getBookingSetting = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(401).json({ message: "Company ID missing or unauthorized" });

    // upsert a default doc if not found so UI always has data
    let setting = await BookingSetting.findOne({ companyId });
    if (!setting) {
      setting = await BookingSetting.create({
        companyId,
        currency: [{ label: "British Pound", value: "GBP", symbol: "£" }],
      });
    }

    res.status(200).json({ success: true, setting });
  } catch (error) {
    console.error("Error fetching booking setting:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST - create/update
export const createOrUpdateBookingSetting = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(401).json({ message: "Unauthorized" });

    const {
      operatingCountry,
      timezone,
      currency, // array of {label,value,symbol}
      googleApiKeys, // {browser, server, android, ios}
      avoidRoutes,   // {highways, tolls, ferries}
      distanceUnit,  // "Miles" | "KMs"
      hourlyPackage, // boolean
      advanceBookingMin,  // {value, unit}
      advanceBookingMax,  // {value, unit}
      cancelBookingWindow,// {value, unit}
      cancelBookingTerms, // string
    } = req.body;

    // currency validation
    if (!Array.isArray(currency) || currency.length === 0) {
      return res.status(400).json({ message: "Currency should be a non-empty array of currency objects" });
    }
    const isValidCurrency = currency.every(
      (c) => c?.label && c?.value && c?.symbol &&
             typeof c.label === "string" &&
             typeof c.value === "string" &&
             typeof c.symbol === "string"
    );
    if (!isValidCurrency) {
      return res.status(400).json({ message: "Invalid currency format" });
    }

    const update = {
      operatingCountry,
      timezone,
      currency,
      googleApiKeys: {
        browser: googleApiKeys?.browser ?? "",
        server: googleApiKeys?.server ?? "",
        android: googleApiKeys?.android ?? "",
        ios: googleApiKeys?.ios ?? "",
      },
      avoidRoutes: {
        highways: !!avoidRoutes?.highways,
        tolls: !!avoidRoutes?.tolls,
        ferries: !!avoidRoutes?.ferries,
      },
      distanceUnit: distanceUnit || "Miles",
      hourlyPackage: !!hourlyPackage,
      advanceBookingMin: {
        value: Number(advanceBookingMin?.value ?? 12),
        unit: advanceBookingMin?.unit || "Hours",
      },
      advanceBookingMax: {
        value: Number(advanceBookingMax?.value ?? 2),
        unit: advanceBookingMax?.unit || "Years",
      },
      cancelBookingWindow: {
        value: Number(cancelBookingWindow?.value ?? 6),
        unit: cancelBookingWindow?.unit || "Hours",
      },
      cancelBookingTerms: cancelBookingTerms ?? "",
    };

    const setting = await BookingSetting.findOneAndUpdate(
      { companyId },
      update,
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, message: "Booking setting updated", setting });
  } catch (error) {
    console.error("Error updating booking setting:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
