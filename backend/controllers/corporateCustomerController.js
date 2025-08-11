import CorporateCustomer from "../models/CorporateCustomer.js";

// Create Corporate Customer
export const createCorporateCustomer = async (req, res) => {
  try {
    let profileUrl = "";
    if (req.files?.profile?.[0]) {
      profileUrl = req.files.profile[0].path;
      console.log("Profile image uploaded to Cloudinary:", profileUrl);
    } else {
      console.warn("⚠️ No profile image uploaded.");
    }

    const {
      name,
      companyname,
      email,
      phone,
      address,
      homeAddress,
      status = "Active",
      companyId,
      primaryContactName,
      primaryContactDesignation,
      website,
      city,
      stateCounty,
      postcode,
      country,
      locationsDisplay = "Yes",
      paymentOptionsInvoice,
      invoiceDueDays = 1,
      invoiceTerms,
      passphrase,
      vatnumber,
    } = req.body;

    if (!name || !email || !phone || !companyId) {
      return res.status(400).json({
        message: "Missing required fields (name, email, phone, companyId)",
      });
    }

    const newCustomer = new CorporateCustomer({
      name,
      companyname,
      email,
      phone,
      address,
      homeAddress,
      status,
      companyId,
      profile: profileUrl,
      primaryContactName,
      primaryContactDesignation,
      website,
      city,
      stateCounty,
      postcode,
      country,
      locationsDisplay,
      paymentOptionsInvoice,
      invoiceDueDays,
      invoiceTerms,
      passphrase,
      vatnumber,
    });

    await newCustomer.save();

    console.log("Corporate customer created:", newCustomer._id);
    res.status(201).json({
      message: "Corporate customer profile created successfully",
      customer: newCustomer,
    });

  } catch (err) {
    console.error("❌ Error creating corporate customer:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Get all corporate customers for a company
export const getCorporateCustomers = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const customers = await CorporateCustomer.find({ companyId });
    res.status(200).json({ customers });
  } catch (err) {
    console.error("❌ Error fetching corporate customers:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get a single corporate customer by ID
export const getCorporateCustomer = async (req, res) => {
  try {
    const customer = await CorporateCustomer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Corporate customer not found" });
    }
    res.status(200).json(customer);
  } catch (err) {
    console.error("❌ Error fetching corporate customer:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update corporate customer by ID
export const updateCorporateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    console.log("🔄 Updating corporate customer:", id);

    const existingCustomer = await CorporateCustomer.findById(id);
    if (!existingCustomer) {
      return res.status(404).json({ message: "Corporate customer not found" });
    }

    if (req.files?.profile?.[0]) {
      updatedData.profile = req.files.profile[0].path;
      console.log("New profile image uploaded:", updatedData.profile);
    } else {
      updatedData.profile = existingCustomer.profile;
    }

    const updatedCustomer = await CorporateCustomer.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Corporate customer updated successfully",
      customer: updatedCustomer,
    });
  } catch (err) {
    console.error("❌ Error updating corporate customer:", err.message);
    res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
};

// Delete corporate customer by ID
export const deleteCorporateCustomer = async (req, res) => {
  try {
    const customer = await CorporateCustomer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Corporate customer not found" });
    }

    res.status(200).json({ message: "Corporate customer deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting corporate customer:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Backend route: /corporate-customer/by-vat/:vatnumber
export const getCorporateCustomerByVat = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const vatnumber = req.params.vatnumber.trim().toUpperCase();

    const customer = await CorporateCustomer.findOne({
      companyId,
      vatnumber: { $regex: new RegExp(`^${vatnumber}$`, 'i') }, // case-insensitive exact match
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

