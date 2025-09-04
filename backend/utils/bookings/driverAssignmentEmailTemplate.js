export const driverAssignmentEmailTemplate = ({
    booking,
    driver,
    vehicle,
    company = {},
    options = {},
    assignmentType = "assigned", // "assigned" or "unassigned"
}) => {
    // Brand colors
    const brand = {
        primary: options.primaryColor || "#0F172A",
        accent: options.accentColor || "#2563EB",
        muted: options.mutedColor || "#6B7280",
        bg: options.bgColor || "#F8FAFC",
        card: options.cardColor || "#FFFFFF",
        border: options.borderColor || "#E5E7EB",
        success: options.successColor || "#16A34A",
        warning: options.warningColor || "#F59E0B",
    };

    // Company info
    const org = {
        name: company?.companyName || company?.tradingName || options.companyName || "Our Company",
        logoUrl: options.logoUrl || company?.profileImage || company?.logoUrl || "",
        email: options.supportEmail || company?.email || "",
        phone: options.supportPhone || company?.contact || "",
        address: options.address || company?.address || "",
    };

    const safe = (v) =>
        String(v ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    // Driver and vehicle info with fallbacks
    const driverInfo = {
        firstName: driver?.DriverData?.firstName || driver?.firstName || "Driver",
        surName: driver?.DriverData?.surName || driver?.surName || "",
        email: driver?.DriverData?.email || driver?.email || "",
        contact: driver?.DriverData?.contact || driver?.contact || "",
        employeeNumber: driver?.DriverData?.employeeNumber || driver?.employeeNumber || "N/A",
        fullName: driver
            ? `${(driver?.DriverData?.firstName || driver?.firstName || "")} ${(driver?.DriverData?.surName || driver?.surName || "")}`.trim() || "Driver"
            : "Driver",
    };

    const vehicleInfo = {
        registration: vehicle?.carRegistration || driver?.VehicleData?.carRegistration || "TBD",
        make: vehicle?.carMake || driver?.VehicleData?.carMake || "TBD",
        model: vehicle?.carModal || driver?.VehicleData?.carModal || "TBD",
        color: vehicle?.carColor || driver?.VehicleData?.carColor || "TBD",
    };

    // Journey info
    const journey = booking?.primaryJourney || booking?.returnJourney || {};

    // Format date and time
    const formatDateTime = (j) => {
        if (!j?.date) return "-";
        const date = new Date(j.date);
        const dateStr = date.toLocaleDateString("en-GB", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        const hour = j?.hour ?? 0;
        const minute = j?.minute ?? 0;
        const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        return `${dateStr} at ${timeStr}`;
    };

    // Assignment-specific styling and messaging
    const assignmentConfig = {
        assigned: {
            color: brand.success,
            bg: "#DCFCE7",
            text: "New Job Assignment",
            message: "You have been assigned to a new booking!",
            actionColor: brand.success,
        },
        unassigned: {
            color: brand.warning,
            bg: "#FEF3C7",
            text: "Job Unassignment",
            message: "You have been unassigned from this booking.",
            actionColor: brand.warning,
        },
    };

    const config = assignmentConfig[assignmentType] || assignmentConfig.assigned;

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${config.text} - Booking #${safe(booking?.bookingId)}</title>
  <style>
    @media (max-width:640px){
      .container{width:100% !important;padding:0 16px !important}
      .grid{display:block !important}
      .col{width:100% !important;display:block !important;margin-bottom:16px !important}
      .px-22{padding-left:16px !important;padding-right:16px !important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${brand.bg};">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${brand.bg}">
    <tr>
      <td align="center" style="padding:28px 16px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="width:600px;max-width:600px;background:${brand.card};border:1px solid ${brand.border};border-radius:16px;overflow:hidden">

          <!-- Header -->
          <tr>
            <td style="padding:0;background:linear-gradient(90deg, ${config.bg}, #ffffff);border-bottom:1px solid ${brand.border}">
              <table width="100%" role="presentation" style="padding:18px 22px">
                <tr>
                  <td align="left" style="vertical-align:middle">
                    ${org.logoUrl
            ? `<img src="${safe(org.logoUrl)}" width="90" style="display:block;max-width:180px;height:auto" alt="${safe(org.name)}" />`
            : `<div style="font:800 18px/1 Arial,sans-serif;color:${brand.primary}">${safe(org.name)}</div>`
        }
                  </td>
                  <td align="right" style="vertical-align:middle">
                    <div style="margin-bottom:8px;text-align:right;">
                      <span style="display:inline-block;background:${config.bg};color:${config.color};font:700 12px/1 Arial,sans-serif;padding:8px 16px;border-radius:999px;border:1px solid ${config.color}33;">
                        ${assignmentType === "assigned" ? "ASSIGNED" : "UNASSIGNED"}
                      </span>
                    </div>
                    <div style="font:400 13px/2 Arial,sans-serif;color:${brand.muted}">
                      ${org.email ? `<strong>Email:</strong> <a href="mailto:${safe(org.email)}" style="color:${brand.accent};text-decoration:none">${safe(org.email)}</a><br/>` : ""}
                      ${org.phone ? `<strong>Phone:</strong> +${safe(org.phone)}<br/>` : ""}
                      ${org.address ? `<strong>Location:</strong> ${safe(org.address)}<br/>` : ""}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Message -->
          <tr>
            <td class="px-22" style="padding:24px 22px 18px;text-align:start">
              <div style="font:500 24px/1.3 Arial,sans-serif;color:${brand.primary};margin:0 0 10px">${safe(config.message)}</div>
              <div style="font:600 16px/1.5 Arial,sans-serif;color:${brand.accent};margin:8px 0 0">Booking Reference: #${safe(booking?.bookingId)}</div>
              <div style="font:400 14px/1.5 Arial,sans-serif;color:${brand.muted};margin:8px 0 0">
                Hello ${safe(driverInfo.firstName)}, ${assignmentType === "assigned"
            ? "you have been assigned to handle this booking. Please review the details below."
            : "this booking assignment has been removed from your schedule."}
              </div>
            </td>
          </tr>

          <!-- Journey Details -->
          <tr>
            <td class="px-22" style="padding:0 22px 18px">
              <table role="presentation" width="100%" style="border:1px solid ${brand.border};border-radius:12px;padding:16px">
                <tr>
                  <td style="font:700 14px Arial,sans-serif;color:${brand.primary};padding-bottom:8px">
                    <div style="margin-bottom:10px;">Journey Details</div>
                  </td>
                </tr>
                <tr>
                  <td style="color:${brand.muted};font:600 13px Arial,sans-serif">
                    <div style="margin-bottom:3px;">From:</div>
                  </td>
                  <td style="color:${brand.primary};font:400 13px Arial,sans-serif">
                    <div style="margin-bottom:3px;">${safe(journey?.pickup || "-")}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 8px 4px 0;color:${brand.muted};width:80px;font:600 13px Arial,sans-serif">
                    <div style="margin-bottom:3px;">To:</div>
                  </td>
                  <td style="padding:4px 0;color:${brand.primary};font:400 13px Arial,sans-serif">
                    <div style="margin-bottom:3px;">${safe(journey?.dropoff || "-")}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 8px 4px 0;color:${brand.muted};width:80px;font:600 13px Arial,sans-serif">
                    <div style="margin-bottom:3px;">Date & Time:</div>
                  </td>
                  <td style="padding:4px 0;color:${brand.primary};font:400 13px Arial,sans-serif">
                    <div style="margin-bottom:3px;">${safe(formatDateTime(journey))}</div>
                  </td>
                </tr>
                ${journey?.notes ? `
                <tr>
                  <td style="padding:4px 8px 4px 0;color:${brand.muted};width:80px;font:600 13px Arial,sans-serif">
                    <div style="margin-bottom:3px;">Notes:</div>
                  </td>
                  <td style="padding:4px 0;color:${brand.primary};font:400 13px Arial,sans-serif">
                    <div style="margin-bottom:3px;">${safe(journey.notes)}</div>
                  </td>
                </tr>
                ` : ""}
              </table>
            </td>
          </tr>

          <!-- Passenger Info -->
          <tr>
            <td class="px-22" style="padding:0 22px 18px">
              <table role="presentation" width="100%" style="background:${brand.card};border:1px solid ${brand.border};border-radius:12px;padding:16px">
                <tr>
                  <td style="font:700 14px Arial,sans-serif;color:${brand.primary};padding-bottom:8px">Passenger Information</td>
                </tr>
                <tr>
                  <td style="font:400 13px Arial,sans-serif;color:${brand.primary}">
                    <div style="margin-bottom:4px;"><strong>Name:</strong> ${safe(booking?.passenger?.name || "N/A")}</div>
                    <div style="margin-bottom:4px;"><strong>Phone:</strong> ${safe(booking?.passenger?.phone || "N/A")}</div>
                    <div style="margin-bottom:4px;"><strong>Email:</strong> ${safe(booking?.passenger?.email || "N/A")}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${assignmentType === "assigned" ? `
          <!-- Assigned Vehicle Info -->
          <tr>
            <td class="px-22" style="padding:0 22px 18px">
              <table role="presentation" width="100%" style="background:${brand.card};border:1px solid ${brand.border};border-radius:12px;padding:16px">
                <tr>
                  <td style="font:700 14px Arial,sans-serif;color:${brand.primary};padding-bottom:8px">Your Assigned Vehicle</td>
                </tr>
                <tr>
                  <td style="font:400 13px Arial,sans-serif;color:${brand.primary}">
                    <div style="margin-bottom:4px;"><strong>Registration:</strong> ${safe(vehicleInfo.registration)}</div>
                    <div style="margin-bottom:4px;"><strong>Make & Model:</strong> ${safe(vehicleInfo.make)} ${safe(vehicleInfo.model)}</div>
                    <div style="margin-bottom:4px;"><strong>Color:</strong> ${safe(vehicleInfo.color)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ""}

          <!-- Action Required -->
          ${assignmentType === "assigned" ? `
          <tr>
            <td class="px-22" style="padding:0 22px 18px">
              <table role="presentation" width="100%" style="background:${brand.bg};border:1px solid ${brand.border};border-radius:12px;padding:16px;text-align:center">
                <tr>
                  <td style="font:400 14px/1.6 Arial,sans-serif;color:${brand.primary}">
                    <strong>Action Required:</strong><br/>
                    Please review the booking details and prepare for the scheduled pickup time.<br/>
                    Contact the passenger if you need to confirm any details.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ""}

          <!-- Footer -->
          <tr>
            <td style="padding:20px 24px;border-top:1px solid ${brand.border};background:#FAFAFA">
              <div style="font:700 16px/1.4 Arial,sans-serif;color:${brand.primary};margin-bottom:8px">${safe(org.name)}</div>
              <div style="font:400 11px/1.5 Arial,sans-serif;color:#9CA3AF;margin-top:16px;padding-top:12px;border-top:1px solid ${brand.border}">
                This is an automated notification email. Please keep this for your records.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};