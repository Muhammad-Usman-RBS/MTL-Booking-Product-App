import Coverage from "../../models/settings/Coverage.js";

// CREATE
export const createCoverage = async (req, res) => {
  const { type, coverage, category, value , companyId } = req.body;
  if (
    !companyId
  ) {
    return res.status(400).json({ message: "Invalid or missing companyId" });
  }

  if (!type || !coverage || !category || !value) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const exists = await Coverage.findOne({
      companyId,
      type,
      coverage,
      category,
      value: value.trim().toLowerCase(), 
    });    if (exists) {
      return res
        .status(409)
        .json({ message: "Coverage value already exists." });
    }

    const newCoverage = new Coverage({ type, coverage, category, value  , companyId });
    const savedCoverage = await newCoverage.save();

    res.status(201).json({
      message: "Coverage created successfully.",
      data: savedCoverage,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Server error while creating coverage.",
        error: error.message,
      });
  }
};

// READ ALL
export const getAllCoverage = async (req, res) => {
  try {
    const {companyId} = req.query
    if (!companyId ) {
      return res.status(400).json({ message: "Valid companyId is required" });
    }
    const coverages = await Coverage.find({companyId});
    res.status(200).json({
      message: "All coverage entries retrieved.",
      data: coverages,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to fetch coverage entries.",
        error: error.message,
      });
  }
};

// READ ONE
export const getCoverageById = async (req, res) => {
  const { id } = req.params;

  try {
    const coverage = await Coverage.findById(id);
    if (!coverage) {
      return res.status(404).json({ message: "Coverage entry not found." });
    }

    res.status(200).json({
      message: "Coverage entry retrieved.",
      data: coverage,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error retrieving coverage entry.",
        error: error.message,
      });
  }
};

// UPDATE
export const updateCoverage = async (req, res) => {
  const { id } = req.params;
  const { type, coverage, category, value } = req.body;

  try {
    const updated = await Coverage.findByIdAndUpdate(
      id,
      { type, coverage, category, value },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Coverage entry not found." });
    }

    res.status(200).json({
      message: "Coverage updated successfully.",
      data: updated,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update coverage.", error: error });
  }
};

// DELETE
export const deleteCoverage = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Coverage.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Coverage entry not found." });
    }

    res.status(200).json({
      message: "Coverage deleted successfully.",
      data: deleted,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete coverage.", error: error.message });
  }
};
