import TermsAndConditions from "../../models/settings/TermsandCondition.js";

export const createTerms = async (req, res) => {
  try {
    const { title, content, targetAudience: requestedAudience } = req.body;
    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }
    let targetAudience = [];
    if (req.user.role === "superadmin") {
      targetAudience = ["clientadmin", "superadmin"];
    } else if (req.user.role === "clientadmin") {
      const validOptions = ["driver", "customer", "associateadmin"];
      targetAudience = Array.isArray(requestedAudience)
        ? requestedAudience.filter((role) => validOptions.includes(role))
        : [];
      if (!targetAudience.includes("clientadmin")) {
        targetAudience.unshift("clientadmin");
      }
      if (targetAudience.length === 0) {
        return res.status(400).json({
          message: "At least one valid target audience must be selected",
        });
      }
    } else {
      return res.status(403).json({ message: "Unauthorized to create terms" });
    }
    const terms = await TermsAndConditions.create({
      title,
      content,
      createdBy: req.user._id,
      createdByRole: req.user.role,
      targetAudience,
      companyId: req.user.companyId,
    });
    res.status(201).json({
      success: true,
      data: terms,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getTerms = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userCompanyId = req.user.companyId;
    let query = {};
    if (userRole === "superadmin") {
      query = {
        targetAudience: "superadmin",
        createdBy: req.user._id,
      };
    } else if (userRole === "clientadmin") {
      query = {
        $or: [
          {
            targetAudience: "clientadmin",
            companyId: userCompanyId,
          },
          {
            targetAudience: "clientadmin",
            createdByRole: "superadmin",
          },
        ],
      };
    } else if (userRole === "driver" || userRole === "customer") {
      query = {
        targetAudience: userRole,
        companyId: userCompanyId,
      };
    }
    const terms = await TermsAndConditions.find(query)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email role");

    if (!terms) {
      return res.status(404).json({ message: "No terms and conditions found" });
    }
    res.status(200).json({
      success: true,
      count: terms.length,
      data: terms,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateTerms = async (req, res) => {
  try {
    const termId = req.params.id;
    const { title, content, targetAudience: requestedAudience } = req.body;
    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }
    let targetAudience = [];
    if (req.user.role === "superadmin") {
      targetAudience = ["clientadmin", "superadmin"];
    } else if (req.user.role === "clientadmin") {
      const validOptions = ["driver", "customer", "associateadmin"];
      targetAudience = Array.isArray(requestedAudience)
        ? requestedAudience.filter((role) => validOptions.includes(role))
        : [];
      if (!targetAudience.includes("clientadmin")) {
        targetAudience.unshift("clientadmin");
      }
      if (targetAudience.length === 0) {
        return res.status(400).json({
          message: "At least one valid target audience must be selected",
        });
      }
    }
    const existingTerm = await TermsAndConditions.findById(termId);
    if (!existingTerm) {
      return res
        .status(404)
        .json({ message: "Terms and Conditions not found" });
    }
    const isCreator =
      existingTerm.createdBy.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role === "superadmin";
    if (!isCreator && !isSuperAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this entry" });
    }
    existingTerm.title = title;
    existingTerm.content = content;
    existingTerm.targetAudience = targetAudience;
    const updatedTerm = await existingTerm.save();
    res.status(200).json({
      success: true,
      data: updatedTerm,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteTerms = async (req, res) => {
  const { id } = req.params;
  const companyId = req.user.companyId;
  const userRole = req.user.role;
  try {
    const term = await TermsAndConditions.findById(id);
    if (!term) {
      return res.status(404).json({ message: "No term found with this ID" });
    }
    const isSuperAdmin = userRole === "superadmin";
    const isClientAdmin =
      userRole === "clientadmin" && term.companyId?.toString() === companyId;
    if (
      (isSuperAdmin && term.createdBy.toString() === req.user._id.toString()) ||
      isClientAdmin
    ) {
      await term.deleteOne();
      return res
        .status(200)
        .json({ message: "Term deleted successfully", term });
    } else {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this term" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
