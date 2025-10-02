// ===== Common Validators =====
export const EMAIL_MAX = 254;

export const isEmpty = (v) =>
    v === undefined || v === null || String(v).trim() === "";

export const isValidEmail = (email) => {
    if (isEmpty(email)) return false;
    if (email.length > EMAIL_MAX) return false;
    const re = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return re.test(email);
};

export const isValidPassword = (pw) => {
    if (isEmpty(pw)) return false;
    // must include lowercase, uppercase, number, special char, and be 8–16 chars long
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,16}$/;
    return re.test(pw);
};

export const isValidPhone = (val) => {
    if (isEmpty(val)) return false;
    // keep simple: allow 8–15 digits ignoring non-digits
    const digits = String(val).replace(/\D/g, "");
    return digits.length >= 8 && digits.length <= 15;
};

export const isValidUrl = (url) => {
    if (isEmpty(url)) return false;
    try {
        // allow http/https only
        const u = new URL(url);
        return ["http:", "https:"].includes(u.protocol);
    } catch {
        return false;
    }
};

// ===== Existing: User validation (unchanged) =====
export function validateUserAccount(data, { isEdit = false } = {}) {
    const errors = {};

    if (isEmpty(data.role)) errors.role = "Type is required.";
    if (isEmpty(data.fullName)) errors.fullName = "Full Name is required.";

    if (isEmpty(data.email)) errors.email = "Email is required.";
    else if (!isValidEmail(data.email))
        errors.email = `Enter a valid email (max ${EMAIL_MAX} chars).`;

    if (isEmpty(data.status)) errors.status = "Status is required.";

    if (!isEdit && data.role === "clientadmin") {
        if (!isValidPassword(data.password))
            errors.password =
                "Password must be 8–16 chars with uppercase, lowercase, number & special character.";
    } else if (!isEmpty(data.password) && !isValidPassword(data.password)) {
        errors.password =
            "Password must be 8–16 chars with uppercase, lowercase, number & special character.";
    }

    return { errors, isValid: Object.keys(errors).length === 0 };
}

// ===== New: Company validation =====
// NOTE: per your request, profileImage and licensedBy are NOT required.
// Everything else is required.
export function validateCompanyAccount(data) {
    const errors = {};

    if (isEmpty(data.companyName))
        errors.companyName = "Company Name is required.";

    if (isEmpty(data.tradingName))
        errors.tradingName = "Trading Name is required.";

    if (isEmpty(data.email)) errors.email = "Email is required.";
    else if (!isValidEmail(data.email))
        errors.email = "Enter a valid email.";

    if (isEmpty(data.contact)) errors.contact = "Contact is required.";
    else if (!isValidPhone(data.contact))
        errors.contact = "Enter a valid phone number.";

    // licensedBy is optional -> no error

    if (isEmpty(data.licenseNumber) && data.licenseNumber !== 0)
        errors.licenseNumber = "License Number is required.";
    else if (Number.isNaN(Number(data.licenseNumber)) || Number(data.licenseNumber) <= 0)
        errors.licenseNumber = "License Number must be a positive number.";

    if (isEmpty(data.website))
        errors.website = "License Website Link is required.";
    else if (!isValidUrl(data.website))
        errors.website = "Enter a valid URL (http/https).";

    if (isEmpty(data.clientAdminId))
        errors.clientAdminId = "Please select an admin.";

    if (isEmpty(data.cookieConsent))
        errors.cookieConsent = "Cookie Consent is required.";

    if (isEmpty(data.address))
        errors.address = "Company Address is required.";

    // profileImage is optional -> no error

    return { errors, isValid: Object.keys(errors).length === 0 };
}

// ===== New: Driver validation =====
export function validateDriver(data, { isEdit = false } = {}) {
    const errors = {};

    if (isEmpty(data.firstName)) errors.firstName = "First Name is required.";
    if (isEmpty(data.surName)) errors.surName = "Surname is required.";

    if (isEmpty(data.email)) errors.email = "Email is required.";
    else if (!isValidEmail(data.email))
        errors.email = `Enter a valid email (max ${EMAIL_MAX} chars).`;

    if (isEmpty(data.contact)) errors.contact = "Contact is required.";
    else if (!isValidPhone(data.contact))
        errors.contact = "Enter a valid phone number.";

    if (isEmpty(data.driverLicense))
        errors.driverLicense = "Driving License is required.";

    if (isEmpty(data.driverLicenseExpiry))
        errors.driverLicenseExpiry = "Driving License Expiry is required.";

    if (isEmpty(data.dateOfBirth))
        errors.dateOfBirth = "Date of Birth is required.";

    if (isEmpty(data.status)) errors.status = "Status is required.";

    // Optional: ensure availability has valid dates if provided
    if (data.availability && Array.isArray(data.availability)) {
        data.availability.forEach((slot, idx) => {
            if (!isEmpty(slot.from) && isEmpty(slot.to)) {
                errors[`availability_${idx}`] = "End date required if start date is set.";
            }
        });
    }

    return { errors, isValid: Object.keys(errors).length === 0 };
}

// ===== New: Vehicle validation =====
export function validateVehicle(data) {
  const errors = {};

  if (isEmpty(data.carMake)) errors.carMake = "Vehicle Make is required.";
  if (isEmpty(data.carModal)) errors.carModal = "Vehicle Model is required.";
  if (isEmpty(data.carColor)) errors.carColor = "Vehicle Color is required.";
  if (isEmpty(data.carRegistration)) errors.carRegistration = "Vehicle Reg. No. is required.";

  if (isEmpty(data.carInsuranceExpiry))
    errors.carInsuranceExpiry = "Insurance Expiry is required.";

  if (isEmpty(data.carPrivateHireLicense))
    errors.carPrivateHireLicense = "Private Hire License is required.";

  if (isEmpty(data.carPrivateHireLicenseExpiry))
    errors.carPrivateHireLicenseExpiry = "Private Hire License Expiry is required.";

  if (isEmpty(data.motExpiryDate))
    errors.motExpiryDate = "MOT Expiry is required.";

  // Require at least one vehicle type
  if (!data.vehicleTypes || data.vehicleTypes.length === 0) {
    errors.vehicleTypes = "Select at least one Vehicle Type.";
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}