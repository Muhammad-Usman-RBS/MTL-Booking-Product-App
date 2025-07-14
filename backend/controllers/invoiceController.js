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
      const { items, customers } = req.body;
  
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Invoice items are required." });
      }
  
      if (!customers || !Array.isArray(customers) || customers.length === 0) {
        return res.status(400).json({ error: "At least one customer is required." });
      }
  
      const total = items.reduce((acc, item) => acc + item.totalAmount, 0);
  
      const invoiceNumber = await generateInvoiceNumber();
  
      const newInvoice = new Invoice({
        invoiceNumber,
        companyId: user.companyId,
        customers, // ✅ updated
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
  
