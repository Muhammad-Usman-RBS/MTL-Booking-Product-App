import Customer from "../models/Customer.js";

// ✅ Create Customer
export const createCustomer = async (req, res) => {
  try {
    const {
      name,
      email,
      contact,
      address,
      homeAddress,
      status,
      companyId,
      profile, // ✅ New field for image
    } = req.body;

    const newCustomer = new Customer({
      name,
      email,
      contact,
      address,
      homeAddress,
      status,
      companyId,
      profile, // ✅ Save image
    });

    await newCustomer.save();

    res.status(201).json({
      message: "Customer profile created successfully",
      customer: newCustomer,
    });
  } catch (err) {
    console.error("Error creating customer:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Get all customers for a company
export const getCustomers = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const customers = await Customer.find({ companyId });

    res.status(200).json({ customers });
  } catch (err) {
    console.error("Error fetching customers:", err);
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
    console.error("Error fetching customer:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Update Customer by ID
export const updateCustomer = async (req, res) => {
  try {
    const updatedData = req.body;

    const existingCustomer = await Customer.findById(req.params.id);
    if (!existingCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // If profile is not provided in request, preserve existing image
    if (!updatedData.profile) {
      updatedData.profile = existingCustomer.profile;
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Customer updated successfully",
      customer,
    });
  } catch (err) {
    console.error("Error updating customer:", err);
    res.status(500).json({ error: "Server error" });
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
    console.error("Error deleting customer:", err);
    res.status(500).json({ error: "Server error" });
  }
};
