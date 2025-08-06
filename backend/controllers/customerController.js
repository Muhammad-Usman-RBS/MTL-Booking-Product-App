import Customer from "../models/Customer.js";

// ✅ Create Customer (with improved validation and logging)
export const createCustomer = async (req, res) => {
  try {
    console.log("📥 Incoming customer creation request");

    // 🔍 Log entire file payload (important for debugging)
    console.log("🖼️ Received files:", req.files);

    // ✅ Check for uploaded profile image
    let profileUrl = "";
    if (req.files?.profile?.[0]) {
      profileUrl = req.files.profile[0].path; // Cloudinary uploaded URL
      console.log("✅ Profile image uploaded to Cloudinary:", profileUrl);
    } else {
      console.warn("⚠️ No profile image uploaded.");
    }

    // ✅ Destructure form fields from req.body
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
      paymentOptionsBooking = [],
      paymentOptionsInvoice,
      invoiceDueDays = 1,
      invoiceTerms,
      passphrase,
      vatnumber,
    } = req.body;

    // ✅ Basic field validation
    if (!name || !email || !phone || !companyId) {
      return res.status(400).json({
        message: "Missing required fields (name, email, phone, companyId)",
      });
    }

    // ✅ Build new customer document
    const newCustomer = new Customer({
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
      paymentOptionsBooking,
      paymentOptionsInvoice,
      invoiceDueDays,
      invoiceTerms,
      passphrase,
      vatnumber,
    });

    // ✅ Save to DB
    await newCustomer.save();

    console.log("✅ Customer created:", newCustomer._id);

    // ✅ Send response
    res.status(201).json({
      message: "Customer profile created successfully",
      customer: newCustomer,
    });

  } catch (err) {
    console.error("❌ Error creating customer:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// ✅ Get all customers for a company
export const getCustomers = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const customers = await Customer.find({ companyId });

    res.status(200).json({ customers });
  } catch (err) {
    console.error("❌ Error fetching customers:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Get a single customer by ID
export const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (err) {
    console.error("❌ Error fetching customer:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Update Customer by ID
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    console.log("🔄 Updating customer:", id);

    const existingCustomer = await Customer.findById(id);
    if (!existingCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // ✅ FIXED: Handle new profile image upload
    if (req.files && req.files.profile && req.files.profile[0]) {
      updatedData.profile = req.files.profile[0].path; // New Cloudinary URL
      console.log("✅ New profile image uploaded:", updatedData.profile);
    } else {
      // Keep existing image if no new image uploaded
      updatedData.profile = existingCustomer.profile;
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
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

// ✅ Delete Customer by ID
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting customer:", err);
    res.status(500).json({ error: "Server error" });
  }
};