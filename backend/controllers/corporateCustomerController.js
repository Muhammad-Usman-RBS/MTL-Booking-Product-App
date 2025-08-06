import CorporateCustomer from "../models/CorporateCustomer.js";

// Create Customer
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

    console.log("Customer created:", newCustomer._id);
    res.status(201).json({
      message: "Customer profile created successfully",
      customer: newCustomer,
    });

  } catch (err) {
    console.error("❌ Error creating customer:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Get all customers for a company
export const getCorporateCustomers = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const customers = await CorporateCustomer.find({ companyId });
    res.status(200).json({ customers });
  } catch (err) {
    console.error("❌ Error fetching customers:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get a single customer by ID
export const getCorporateCustomer = async (req, res) => {
  try {
    const customer = await CorporateCustomer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (err) {
    console.error("❌ Error fetching customer:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update Customer by ID
export const updateCorporateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    console.log("🔄 Updating customer:", id);

    const existingCustomer = await CorporateCustomer.findById(id);
    if (!existingCustomer) {
      return res.status(404).json({ message: "Customer not found" });
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
      message: "Customer updated successfully",
      customer: updatedCustomer,
    });
  } catch (err) {
    console.error("❌ Error updating customer:", err.message);
    res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
};

// Delete Customer by ID
export const deleteCorporateCustomer = async (req, res) => {
  try {
    const customer = await CorporateCustomer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting customer:", err);
    res.status(500).json({ error: "Server error" });
  }
};