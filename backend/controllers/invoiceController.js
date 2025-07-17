import Invoice from "../models/Invoice.js";

const generateInvoiceNumber = async () => {
  const latestInvoice = await Invoice.findOne(
    {},
    {},
    { sort: { createdAt: -1 } }
  );

  if (!latestInvoice) {
    return "INV-00001";
  }

  const lastNumber = parseInt(
    latestInvoice.invoiceNumber?.split("-")[1] || "0",
    10
  );
  const nextNumber = (lastNumber + 1).toString().padStart(5, "0");
  return `INV-${nextNumber}`;
};

export const createInvoice = async (req, res) => {
  try {
    const user = req.user;
    const { items, customer } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Invoice items are required." });
    }

    const invoiceNumber = await generateInvoiceNumber();

    const newInvoice = new Invoice({
      invoiceNumber,
      companyId: user.companyId,
      customer, // ✅ updated
      items,
    });

    await newInvoice.save();

    return res.status(201).json({
      message: "Invoice created successfully.",
      invoice: newInvoice,
    });
  } catch (error) {
    console.error("Create invoice error:", error);
    return res.status(500).json({ error: "Failed to create invoice." });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
 
    const invoice = await Invoice.findOne({
      _id: id,
      companyId: user.companyId,
    });
 
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found." });
    }
 
    return res.status(200).json({ invoice });
  } catch (error) {
    console.error("Get invoice by ID error:", error);
    return res.status(500).json({ error: "Failed to fetch invoice." });
  }
 };
export const getAllInvoices = async (req, res) => {
  try {
    const user = req.user; // assuming user is authenticated and attached

    // Fetch all invoices for the user's company
    const invoices = await Invoice.find({ companyId: user.companyId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ invoices });
  } catch (error) {
    console.error("Get all invoices error:", error);
    return res.status(500).json({ error: "Failed to fetch invoices." });
  }
};
export const updateInvoice = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const {  items, status, notes } = req.body;

    const invoice = await Invoice.findOne({
      _id: id,
      companyId: user.companyId,
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found." });
    }

    if (items && Array.isArray(items)) invoice.items = items;
    if (status) invoice.status = status;
    if (notes) invoice.notes = notes;

    await invoice.save();

    return res.status(200).json({
      message: "Invoice updated successfully.",
      invoice,
    });
  } catch (error) {
    console.error("Update invoice error:", error);
    return res.status(500).json({ error: "Failed to update invoice." });
  }
};
