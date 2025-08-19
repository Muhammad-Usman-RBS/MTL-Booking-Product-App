import mongoose from "mongoose";
import Company from "../models/Company.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import { initializeDefaultThemes } from "./settings/themeController.js";

export const createCompanyAccount = async (req, res) => {
  try {
    const {
      companyName,
      tradingName,
      email,
      contact,
      licensedBy,
      licenseNumber,
      referrerLink,
      cookieConsent,
      address,
      clientAdminId,
      fullName,
      status,
    } = req.body;

    // ✅ 1. Validate clientAdminId
    if (!clientAdminId || !mongoose.Types.ObjectId.isValid(clientAdminId)) {
      return res.status(400).json({ message: "Invalid or missing clientAdminId" });
    }

    // ✅ 2. Check if the clientAdmin is already assigned to a company
    const existingCompany = await Company.findOne({ clientAdminId });
    if (existingCompany) {
      return res.status(400).json({
        message: "This Client Admin is already assigned to a company.",
      });
    }

    // ✅ 3. Validate required fields
    if (!companyName || !email || !tradingName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ 4. Ensure clientAdmin exists
    const clientAdmin = await User.findById(clientAdminId);
    if (!clientAdmin) {
      return res.status(404).json({ message: "Client Admin not found" });
    }

    // ✅ 5. Handle file upload (profileImage)
    const profileImage = req.files?.profileImage?.[0]?.path || "";

    // ✅ 6. Create new company instance
    const newCompany = new Company({
      companyName,
      tradingName,
      email,
      contact,
      licensedBy,
      licenseNumber: licenseNumber ? parseInt(licenseNumber) : null,
      referrerLink,
      cookieConsent,
      address,
      profileImage,
      clientAdminId: new mongoose.Types.ObjectId(clientAdminId),
      fullName,
      status,
    });

    // ✅ 7. Save company and update clientAdmin with companyId
    const savedCompany = await newCompany.save();

    await User.findByIdAndUpdate(clientAdminId, {
      $set: { companyId: savedCompany._id },
    });
    await initializeDefaultThemes(savedCompany._id);

    // ✅ 8. Return success
    return res.status(201).json(savedCompany);
  } catch (error) {
    console.error("❌ Company Create Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteCompanyAccount = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    await User.findByIdAndUpdate(company.clientAdminId, {
      $unset: { companyId: "" },
    });

    await Company.findByIdAndDelete(req.params.id);

    res.json({ message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllCompanies = async (req, res) => {
  try {
    const currentUser = req.user;

    let companies;

    if (currentUser.role === "superadmin") {
      // Superadmin sees ALL companies they created via assigned clientAdmins
      companies = await Company.find({})
        .populate("clientAdminId", "status")
        .sort({ createdAt: -1 });
    } else {
      // Clientadmin sees only their own assigned companies
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
    // Handle file uploads
    if (req.files?.profileImage?.[0]) {
      req.body.profileImage = req.files.profileImage[0].path;
    }

    // ✅ Safely parse cookieConsent
    if (req.body.cookieConsent) {
      try {
        const parsed = JSON.parse(req.body.cookieConsent);
        if (parsed && typeof parsed === "object" && parsed.value) {
          req.body.cookieConsent = parsed.value;
        }
      } catch (err) {
        // It's already a plain string like "Yes" or "No" — leave it as is
      }
    }

    // Update company
    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json(updatedCompany);
  } catch (error) {
    console.error("Update Company Error:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const sendCompanyEmail = async (req, res) => {
  const { email, company } = req.body;

  if (!email || !company) {
    return res
      .status(400)
      .json({ message: "Email and company data required." });
  }
  try {
    const {
      _id,
      clientAdminId,
      __v,
      createdAt,
      updatedAt,
      ...sanitizedCompany
    } = company;
    await sendEmail(email, "📬 Company Account Details", {
      title: "Company Account Details",
      subtitle: "Please find the details of your company account below.",
      data: sanitizedCompany,
    });

    res.status(200).json({ message: "Email sent successfully." });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ message: "Failed to send email." });
  }
};
