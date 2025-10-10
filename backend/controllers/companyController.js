import mongoose from "mongoose";
import User from "../models/User.js";
import Company from "../models/Company.js";
import sendEmail from "../utils/sendEmail.js";
import { initializeDefaultThemes } from "./settings/themeController.js";
import companyAccountEmailTemplate from "../utils/company/companyAccountEmailTemplate.js";

export const createCompanyAccount = async (req, res) => {
  try {
    const {
      companyName,
      tradingName,
      email,
      contact,
      licensedBy,
      licenseNumber,
      website,
      cookieConsent,
      address,
      clientAdminId,
      fullName,
      status,
    } = req.body;
    if (!clientAdminId || !mongoose.Types.ObjectId.isValid(clientAdminId)) {
      return res.status(400).json({ message: "Invalid or missing clientAdminId" });
    }
    const existingCompany = await Company.findOne({ clientAdminId });
    if (existingCompany) {
      return res.status(400).json({
        message: "This Client Admin is already assigned to a company.",
      });
    }
    if (!companyName || !email || !tradingName) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const clientAdmin = await User.findById(clientAdminId);
    if (!clientAdmin) {
      return res.status(404).json({ message: "Client Admin not found" });
    }
    const profileImage = req.files?.profileImage?.[0]?.path || "";
    const newCompany = new Company({
      companyName,
      tradingName,
      email,
      contact,
      licensedBy,
      licenseNumber: licenseNumber ? parseInt(licenseNumber) : null,
      website,
      cookieConsent,
      address,
      profileImage,
      clientAdminId: new mongoose.Types.ObjectId(clientAdminId),
      fullName,
      status,
    });
    const savedCompany = await newCompany.save();
    await User.findByIdAndUpdate(clientAdminId, {
      $set: { companyId: savedCompany._id },
    });
    await initializeDefaultThemes(savedCompany._id);
    return res.status(201).json(savedCompany);
  } catch (error) {
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
      companies = await Company.find({})
        .populate("clientAdminId", "status role fullName")
        .sort({ createdAt: -1 });
    }
    else if (currentUser.role === "clientadmin") {
      const associates = await User.find({ createdBy: currentUser._id }).select("_id");
      const allAdminIds = [currentUser._id, ...associates.map(a => a._id)];
      companies = await Company.find({ clientAdminId: { $in: allAdminIds } })
        .populate("clientAdminId", "status role fullName")
        .sort({ createdAt: -1 });
    }
    else if (currentUser.role === "associateadmin") {
      companies = await Company.find({ clientAdminId: currentUser._id })
        .populate("clientAdminId", "status role fullName")
        .sort({ createdAt: -1 });
    }
    else {
      return res.status(403).json({ message: "Unauthorized" });
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
    if (req.files?.profileImage?.[0]) {
      req.body.profileImage = req.files.profileImage[0].path;
    }
    if (req.body.cookieConsent) {
      try {
        const parsed = JSON.parse(req.body.cookieConsent);
        if (parsed && typeof parsed === "object" && parsed.value) {
          req.body.cookieConsent = parsed.value;
        }
      } catch (err) {
      }
    }
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
    res.status(400).json({ message: error.message });
  }
};

export const sendCompanyEmail = async (req, res) => {
  const { email, company } = req.body;
  if (!email || !company) {
    return res.status(400).json({ message: "Email and company data required." });
  }
  try {
    const baseUrl =
      process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
    const html = companyAccountEmailTemplate({
      company,
      options: {
        baseUrl,
        primaryColor: "#0F172A",
        accentColor: "#2563EB",
      },
    });
    await sendEmail(email, "🏢 Company Account Details", { html });
    res.status(200).json({ message: "Email sent successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to send email." });
  }
};