import BookingRestriction from "../../models/settings/BookingRestrictionDate.js";

export const createBookingRestriction = async (req, res) => {
  try {
    const { caption, recurring, from, to, status , companyId } = req.body;
    if (!companyId) {
      res.status(400).json({ message: "Invalid or missing companyId" });
      return;
    }
    if (!caption || !recurring || !from || !to || !status) {
      return res.status(500).json({ message: "All fields required" });
    }
    const newRestriction = new BookingRestriction({
      caption,
      recurring,
      from,
      to,
      status,
      companyId,
    });
    const savedRestriction = await newRestriction.save();
    res.status(201).json({
      message: "Booking Restriction created successfully",
      data: savedRestriction,
    });
  } catch (error) {
    console.error("Error creating booking restriction:", error);
    res
      .status(500)
      .json({ message: "Server error creating booking restriction" });
  }
};

export const getAllBookingRestrictions = async (req, res) => {
  const { companyId } = req.query;
  try {
    if (!companyId) {
      return res
        .status(400)
        .json({ message: "Valid companyId is required" });
        } 
    const bookingRestrictions = await BookingRestriction.find({companyId});
    res.status(200).json({
      messagee: "The data was fetched successfully",
      data: bookingRestrictions,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch booking restrictions", error });
  }
};

export const getBookingRestrictionById = async (req, res) => {
  try {
    const { id } = req.params;
    const bookingRestriction = await BookingRestriction.findById(id);
    if (!bookingRestriction) {
      return res.status(404).json({ message: "Booking restriction not found" });
    }
    res
      .status(200)
      .json({ message: "Fetched by id successfull", data: bookingRestriction });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch booking restriction", error });
  }
};


export const updateBookingRestriction = async (req, res) => {
  try {
    const { id } = req.params;
    const { caption, recurring, from, to, status } = req.body;

    const updatedData = { caption, recurring, from, to, status };

    const updatedRestriction = await BookingRestriction.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    if (!updatedRestriction) {
      return res.status(404).json({ message: "Booking restriction not found" });
    }

    res.status(200).json({
      message: "Booking restriction updated successfully",
      data: updatedRestriction,
    });
  } catch (error) {
    console.error("Error updating booking restriction:", error);
    res.status(500).json({ message: "Server error updating booking restriction" });
  }
};



export const deleteBookingRestriction = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRestriction = await BookingRestriction.findByIdAndDelete(id);

    if (!deletedRestriction) {
      return res.status(404).json({ message: "Booking restriction not found" });
    }

    res.status(200).json({
      message: "Booking restriction deleted successfully",
      data: deletedRestriction,
    });
  } catch (error) {
    console.error("Error deleting booking restriction:", error);
    res.status(500).json({ message: "Server error deleting booking restriction" });
  }
};
