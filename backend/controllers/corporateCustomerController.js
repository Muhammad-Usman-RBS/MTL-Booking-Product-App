import CorporateCustomer from "../models/CorporateCustomer.js";

export const createCorporateCustomer = async (req, res) => {
  try {
    let profileUrl = "";
    if (req.files?.profile?.[0]) {
      profileUrl = req.files.profile[0].path;
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
    res.status(201).json({
      message: "Corporate customer profile created successfully",
      customer: newCustomer,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

export const getCorporateCustomers = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const customers = await CorporateCustomer.find({ companyId });
    res.status(200).json({ customers });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getCorporateCustomer = async (req, res) => {
  try {
    const customer = await CorporateCustomer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Corporate customer not found" });
    }
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const updateCorporateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const existingCustomer = await CorporateCustomer.findById(id);
    if (!existingCustomer) {
      return res.status(404).json({ message: "Corporate customer not found" });
    }
    if (req.files?.profile?.[0]) {
      updatedData.profile = req.files.profile[0].path;
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
    res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
};

export const deleteCorporateCustomer = async (req, res) => {
  try {
    const customer = await CorporateCustomer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Corporate customer not found" });
    }
    res
      .status(200)
      .json({ message: "Corporate customer deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getCorporateCustomerByVat = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const vatnumber = req.params.vatnumber.trim().toUpperCase();
    const customer = await CorporateCustomer.findOne({
      companyId,
      vatnumber: { $regex: new RegExp(`^${vatnumber}$`, "i") },
    });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
