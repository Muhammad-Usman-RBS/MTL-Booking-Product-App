import User from "../../models/User.js";

export const shouldSendCustomerEmail = async (companyId, passengerEmail) => {
  if (!passengerEmail) return false;
  const customerUser = await User.findOne({
    companyId,
    role: "customer",
    email: passengerEmail.trim().toLowerCase(),
  }).select("emailPreference").lean();
  return customerUser?.emailPreference === true;
};
