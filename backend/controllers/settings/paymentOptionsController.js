import PaymentOption from "../../models/settings/PaymentOption.js";
import mongoose from "mongoose";

// POST: Create or update payment option
export const createOrUpdatePaymentOption = async (req, res) => {
  try {
    const { companyId, paymentMethod, isEnabled, isLive, title, settings } = req.body;

    if (!companyId || !paymentMethod || !title) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if payment option already exists for this company
    let paymentOption = await PaymentOption.findOne({ companyId, paymentMethod });

    if (paymentOption) {
      // Update existing payment option
      paymentOption.isEnabled = isEnabled !== undefined ? isEnabled : paymentOption.isEnabled;
      paymentOption.isLive = isLive !== undefined ? isLive : paymentOption.isLive;
      paymentOption.title = title;
      paymentOption.settings = { ...paymentOption.settings, ...settings };
      
      const updatedPaymentOption = await paymentOption.save();
      
      return res.status(200).json({
        success: true,
        message: "Payment option updated successfully",
        paymentOption: updatedPaymentOption,
      });
    } else {
      // Create new payment option
      const newPaymentOption = new PaymentOption({
        companyId,
        paymentMethod,
        isEnabled: isEnabled || false,
        isLive: isLive || false,
        title,
        settings: settings || {},
      });

      const savedPaymentOption = await newPaymentOption.save();

      return res.status(201).json({
        success: true,
        message: "Payment option created successfully",
        paymentOption: savedPaymentOption,
      });
    }
  } catch (error) {
    console.error("Payment option creation/update error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// GET: All payment options for a company
export const getAllPaymentOptions = async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: "Invalid or missing companyId" });
    }

    const paymentOptions = await PaymentOption.find({ companyId }).lean();

    // If no payment options exist, return default structure
    if (!paymentOptions || paymentOptions.length === 0) {
      const defaultPaymentMethods = [
        "Cash", "Paypal", "Stripe", "Invoice", "PaymentLink"
      ];
      
      const defaultOptions = defaultPaymentMethods.map(method => ({
        companyId,
        paymentMethod: method,
        isEnabled: false,
        isLive: false,
        title: method.charAt(0).toUpperCase() + method.slice(1),
        settings: {}
      }));

      return res.status(200).json({
        success: true,
        message: "Default payment options returned",
        paymentOptions: defaultOptions
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment options fetched successfully",
      paymentOptions
    });
  } catch (err) {
    console.error("Error fetching payment options:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

// GET: Single payment option
export const getPaymentOption = async (req, res) => {
  try {
    const { companyId, paymentMethod } = req.query;

    if (!companyId || !paymentMethod) {
      return res.status(400).json({ message: "Missing companyId or paymentMethod" });
    }

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: "Invalid companyId format" });
    }

    const paymentOption = await PaymentOption.findOne({ companyId, paymentMethod }).lean();

    if (!paymentOption) {
      return res.status(404).json({
        message: "Payment option not found"
      });
    }

    return res.status(200).json({
      success: true,
      paymentOption
    });
  } catch (err) {
    console.error("Error fetching payment option:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

// PUT: Update payment option status (enable/disable, live/test mode)
export const updatePaymentOptionStatus = async (req, res) => {
  try {
    const { paymentOptionId } = req.params;
    const { isEnabled, isLive } = req.body;

    if (!paymentOptionId || !mongoose.Types.ObjectId.isValid(paymentOptionId)) {
      return res.status(400).json({ message: "Invalid paymentOptionId" });
    }

    const updatedPaymentOption = await PaymentOption.findByIdAndUpdate(
      paymentOptionId,
      {
        $set: {
          ...(isEnabled !== undefined && { isEnabled }),
          ...(isLive !== undefined && { isLive }),
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedPaymentOption) {
      return res.status(404).json({ message: "Payment option not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Payment option status updated successfully",
      paymentOption: updatedPaymentOption,
    });
  } catch (err) {
    console.error("Error updating payment option status:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// DELETE: Delete payment option
export const deletePaymentOption = async (req, res) => {
  try {
    const { paymentOptionId } = req.params;

    if (!paymentOptionId || !mongoose.Types.ObjectId.isValid(paymentOptionId)) {
      return res.status(400).json({ message: "Invalid paymentOptionId" });
    }

    const deletedPaymentOption = await PaymentOption.findByIdAndDelete(paymentOptionId);

    if (!deletedPaymentOption) {
      return res.status(404).json({ message: "Payment option not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Payment option deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting payment option:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

// GET: Get enabled payment options for frontend display
export const getEnabledPaymentOptions = async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: "Invalid or missing companyId" });
    }

    const enabledPaymentOptions = await PaymentOption.find({
      companyId,
      isEnabled: true
    }).select('paymentMethod title isLive settings').lean();

    return res.status(200).json({
      success: true,
      message: "Enabled payment options fetched successfully",
      paymentOptions: enabledPaymentOptions
    });
  } catch (err) {
    console.error("Error fetching enabled payment options:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};