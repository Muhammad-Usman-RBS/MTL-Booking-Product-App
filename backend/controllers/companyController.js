import Company from '../models/Company.js';
import User from '../models/User.js';
import nodemailer from "nodemailer";
import mongoose from "mongoose";

export const createCompanyAccount = async (req, res) => {
  try {
    const {
      companyName,
      contactName,
      email,
      website,
      designation,
      contact,
      city,
      dueDays,
      state,
      zip,
      passphrase,
      country,
      bookingPayment,
      invoicePayment,
      showLocations,
      address,
      invoiceTerms,
      clientAdminId,
      fullName,
      status,
    } = req.body;

    // ✅ Validate required fields
    if (!clientAdminId || !mongoose.Types.ObjectId.isValid(clientAdminId)) {
      return res.status(400).json({ message: "Invalid or missing clientAdminId" });
    }

    if (!companyName || !email || !contactName || !designation) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Check if clientAdminId exists
    const clientAdmin = await User.findById(clientAdminId);
    if (!clientAdmin) {
      return res.status(404).json({ message: "ClientAdmin not found" });
    }

    const profileImage = req.file?.path || "";

    // ✅ Create company instance
    const newCompany = new Company({
      companyName,
      contactName,
      email,
      website,
      designation,
      contact,
      city,
      dueDays: dueDays ? parseInt(dueDays) : null,
      state,
      zip,
      passphrase,
      country,
      bookingPayment,
      invoicePayment,
      showLocations,
      address,
      invoiceTerms,
      profileImage,
      clientAdminId: new mongoose.Types.ObjectId(clientAdminId),
      fullName,
      status,
    });

    // ✅ Save company and update user
    const savedCompany = await newCompany.save();

    await User.findByIdAndUpdate(clientAdminId, {
      $set: { companyId: savedCompany._id },
    });

    return res.status(201).json(savedCompany);

  } catch (error) {
    console.error("Company Create Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteCompanyAccount = async (req, res) => {
    try {
        await Company.findByIdAndDelete(req.params.id);
        res.json({ message: 'Company deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllCompanies = async (req, res) => {
    try {
        const currentUser = req.user;

        let companies;

        if (currentUser.role === "superadmin") {
            // ✅ Superadmin sees ALL companies they created via assigned clientAdmins
            companies = await Company.find({})
                .populate("clientAdminId", "status")
                .sort({ createdAt: -1 });
        } else {
            // ✅ Clientadmin sees only their own assigned companies
            companies = await Company.find({ clientAdminId: currentUser._id })
                .populate("clientAdminId", "status")
                .sort({ createdAt: -1 });
        }

        const updated = companies.map((c) => ({
            ...c._doc,
            status: c.clientAdminId?.status || c.status,
        }));

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCompanyById = async (req, res) => {
    try {
        console.log("Fetching company with ID:", req.params.id); // <== Debug
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }
        res.status(200).json(company);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCompanyAccount = async (req, res) => {
    try {
        if (req.file?.path) {
            req.body.profileImage = req.file.path; // ✅ use the newly uploaded file
        }

        const updatedCompany = await Company.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedCompany) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.status(200).json(updatedCompany);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const sendCompanyEmail = async (req, res) => {
    const { email, company } = req.body;

    if (!email || !company) {
        return res.status(400).json({ message: "Email and company data required." });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });

        const htmlContent = `
        <h2>📄 Company Account Details</h2>
        <table cellpadding="8" border="1" style="border-collapse: collapse; font-family: Arial; font-size: 14px;">
          ${Object.entries(company).map(([key, value]) => `
            <tr>
              <td><strong>${key.replace(/([A-Z])/g, ' $1')}</strong></td>
              <td>${value || '-'}</td>
            </tr>
          `).join('')}
        </table>
      `;

        await transporter.sendMail({
            from: `"MTL Admin" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "📬 Company Account Details",
            html: htmlContent,
        });

        res.status(200).json({ message: "Email sent successfully." });
    } catch (error) {
        console.error("Email error:", error);
        res.status(500).json({ message: "Failed to send email." });
    }
};


