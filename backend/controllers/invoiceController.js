import Invoice from "../models/Invoice.js";
import sendEmail from "../utils/sendEmail.js";

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
    const { items, customer, driver, invoiceType } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Invoice items are required." });
    }

    const invoiceNumber = await generateInvoiceNumber();

    const invoiceData = {
      invoiceNumber,
      companyId: user.companyId,
      items,
      invoiceType,
      invoiceDate: new Date(),
    };

    if (invoiceType === "driver") {
      if (!driver || !driver.name || !driver.email) {
        return res
          .status(400)
          .json({ error: "Driver details are required for driver invoices." });
      }
      invoiceData.driver = driver;
    } else {
      if (!customer || !customer.name || !customer.email) {
        return res.status(400).json({
          error: "Customer details are required for customer invoices.",
        });
      }
      invoiceData.customer = customer;
    }

    const newInvoice = new Invoice(invoiceData);

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
    const user = req.user;

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

    const {
      
      items,
      status,
      customer,
      driver,
      invoiceDate,
      dueDate,
      notes,
      discount,
      deposit,
    } = req.body;

    const invoice = await Invoice.findOne({
      _id: id,
      companyId: user.companyId,
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found." });
    }

    if (items && Array.isArray(items)) {
      invoice.items = items;
      invoice.markModified("items")
    }
    if (status) {
      invoice.status = status;
    }
  
    if (customer) {
      invoice.customer = customer;
    }
    if (driver) {
      invoice.driver = driver;
    }
    if (invoiceDate) {
      invoice.invoiceDate = new Date(invoiceDate);
    }
    if (notes !== undefined) {
      invoice.notes = notes;
    }
    if (discount !== undefined) {
      invoice.discount = discount;
    }
    if (deposit !== undefined) {
      invoice.deposit = deposit;
    }

    if (dueDate) {
      invoice.items.forEach((item, index) => {
        item.date = new Date(dueDate);
      });
    }

    await invoice.save();

    return res.status(200).json({
      message: "Invoice updated successfully.",
      invoice,
    });
  } catch (error) {
    console.error("Error name:", error.name);
    return res.status(500).json({ error: "Failed to update invoice." });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const invoice = await Invoice.findOneAndDelete({
      _id: id,
      companyId: user.companyId,
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found." });
    }

    return res.status(200).json({
      message: "Invoice deleted successfully.",
    });
  } catch (error) {
    console.error("Delete invoice error:", error);
    return res.status(500).json({ error: "Failed to delete invoice." });
  }
};

export const sendInvoiceEmail = async (req, res) => {
  try {
    const { recipient, subject, message, invoiceId } = req.body;
    const user = req.user;

    if (!recipient || !subject || !message || !invoiceId) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const invoice = await Invoice.findOne({
      _id: invoiceId,
      companyId: user.companyId,
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found." });
    }

    const invoiceUrl = `${process.env.BASE_URL_FRONTEND}/dashboard/invoices/edit/${invoiceId}`;

    const emailData = {
      Message: message,
      "Customer Name": invoice.customer?.name || "-",
      "Customer Email": invoice.customer?.email || "-",
      "Invoice Number": invoice.invoiceNumber,
      "Invoice Date": new Date(invoice.invoiceDate).toLocaleDateString(),
      "Invoice Status": invoice.status,
      "Invoice Link": `<a href="${invoiceUrl}" target="_blank">${invoiceUrl}</a>`,
    };

    await sendEmail(recipient, subject, {
      title: subject,
      subtitle: "Please find your invoice details below.",
      data: emailData,
    });

    return res
      .status(200)
      .json({ message: "Invoice email sent successfully." });
  } catch (error) {
    console.error("Email sending error:", error);
    return res.status(500).json({ error: "Failed to send invoice email." });
  }
};
