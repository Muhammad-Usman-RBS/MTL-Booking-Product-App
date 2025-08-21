export const parseDate = (v) => (v ? new Date(v) : null);

export const isExpired = (v) => {
  const d = v ? new Date(v) : null;
  if (!d || isNaN(d)) return false;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return end <= today;              // <= today (previously strictly < today)
};

export const collectExpiredDocs = (driverDoc) => {
  const out = [];

  // Driver-level
  if (isExpired(driverDoc?.DriverData?.driverLicenseExpiry)) {
    out.push("driverLicenseExpiry");
  }
  if (isExpired(driverDoc?.DriverData?.driverPrivateHireLicenseExpiry)) {
    out.push("driverPrivateHireLicenseExpiry");
  }

  // Vehicle-level
  if (isExpired(driverDoc?.VehicleData?.carPrivateHireLicenseExpiry)) {
    out.push("carPrivateHireLicenseExpiry");
  }
  if (isExpired(driverDoc?.VehicleData?.carInsuranceExpiry)) {
    out.push("carInsuranceExpiry");
  }
  if (isExpired(driverDoc?.VehicleData?.motExpiryDate)) {
    out.push("motExpiryDate");
  }

  return out;
};
