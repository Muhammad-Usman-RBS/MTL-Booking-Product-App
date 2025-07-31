import Customer from "../models/Customer.js";

// ✅ Create Customer
export const createCustomer = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      homeAddress,
      status,
      companyId,
      profile, // ✅ New field for image
    } = req.body;

    const newCustomer = new Customer({
      name,
      email,
      phone,
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
    const { id } = req.params;
    const updatedData = req.body;

    console.log("🔄 Incoming update for customer:", id);
    console.log("🖼️ Image length:", updatedData.profile?.length);

    const existingCustomer = await Customer.findById(id);
    if (!existingCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Keep existing image if not changed
    if (!updatedData.profile) {
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
    console.error("Error deleting customer:", err);
    res.status(500).json({ error: "Server error" });
  }
};
