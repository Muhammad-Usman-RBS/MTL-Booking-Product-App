export const driverStatusEmailTemplate = ({
  booking,
  driver,
  vehicle,
  status,
  company = {},
  options = {},
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
    name: company?.name || company?.companyProfile?.name || options.companyName || "Our Company",
    logoUrl: options.logoUrl || company?.logoUrl || company?.logo || company?.companyProfile?.logoUrl || "",
    email: options.supportEmail || company?.email || company?.companyProfile?.email || "",
    phone: options.supportPhone || company?.phone || company?.companyProfile?.phone || "",
  };

  const safe = (v) => String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  // Enhanced driver/vehicle data with fallbacks
  const driverInfo = {
    firstName: driver?.firstName || "Your",
    surName: driver?.surName || "Driver", 
    contact: driver?.contact || "Will contact you shortly",
    pcoLicense: driver?.privateHireCardNo || "-",
    fullName: driver ? `${driver.firstName || ''} ${driver.surName || ''}`.trim() || 'Your Driver' : 'Your Driver'
  };

  const vehicleInfo = {
    registration: vehicle?.carRegistration || "TBD",
    make: vehicle?.carMake || "TBD",
    model: vehicle?.carModal || "TBD", // Note: carModal not carModel in your schema
    color: vehicle?.carColor || "TBD",
    makeModel: vehicle ? `${vehicle.carMake || ''} ${vehicle.carModal || ''}`.trim() || 'TBD' : 'TBD'
  };

  // Status-specific styling
  const statusConfig = {
    "On Route": { color: brand.warning, bg: "#FEF3C7", text: "Your driver is on the way!" },
    "At Location": { color: brand.success, bg: "#DCFCE7", text: "Your driver has arrived!" }
  };

  const currentStatus = statusConfig[status] || statusConfig["On Route"];
  const journey = booking?.primaryJourney || booking?.returnJourney || {};

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Driver Update - Booking #${safe(booking?.bookingId)}</title>
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
            <td style="padding:0;background:linear-gradient(90deg, ${currentStatus.bg}, #ffffff);border-bottom:1px solid ${brand.border}">
              <table width="100%" role="presentation" style="padding:18px 22px">
                <tr>
                  <td align="left" style="vertical-align:middle">
                    ${org.logoUrl
                      ? `<img src="${safe(org.logoUrl)}" width="150" style="display:block;max-width:180px;height:auto" alt="${safe(org.name)}" />`
                      : `<div style="font:800 18px/1 Arial,sans-serif;color:${brand.primary}">${safe(org.name)}</div>`
                    }
                  </td>
                  <td align="right" style="vertical-align:middle">
                    <span style="display:inline-block;background:${currentStatus.bg};color:${currentStatus.color};font:700 12px/1 Arial,sans-serif;padding:8px 12px;border-radius:999px;border:1px solid ${currentStatus.color}33">${safe(status)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Message -->
          <tr>
            <td class="px-22" style="padding:24px 22px 18px;text-align:center">
              <div style="font:800 24px/1.3 Arial,sans-serif;color:${brand.primary};margin:0 0 8px">${safe(currentStatus.text)}</div>
              <div style="font:400 14px/1.5 Arial,sans-serif;color:${brand.muted};margin:0">Booking #${safe(booking?.bookingId)}</div>
            </td>
          </tr>

          <!-- Journey Summary -->
          <tr>
            <td class="px-22" style="padding:0 22px 18px">
              <table role="presentation" width="100%" style="background:${brand.bg};border:1px solid ${brand.border};border-radius:12px;padding:16px">
                <tr>
                  <td style="font:700 14px Arial,sans-serif;color:${brand.primary};padding-bottom:8px">Your Journey</td>
                </tr>
                <tr>
                  <td style="font:400 14px/1.6 Arial,sans-serif;color:${brand.primary}">
                    <strong>From:</strong> ${safe(journey?.pickup || "-")}<br/>
                    <strong>To:</strong> ${safe(journey?.dropoff || "-")}<br/>
                    <strong>Date:</strong> ${safe(journey?.date || "-")} at ${safe(journey?.hour || "--")}:${String(journey?.minute || 0).padStart(2, "0")}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Driver & Vehicle Info -->
          <tr>
            <td class="px-22" style="padding:0 22px 18px">
              <table role="presentation" width="100%" class="grid" style="border-collapse:separate;border-spacing:0 12px">
                <tr>
                  <!-- Driver Info -->
                  <td class="col" width="50%" valign="top" style="width:50%;padding-right:8px">
                    <table role="presentation" width="100%" style="background:${brand.card};border:1px solid ${brand.border};border-radius:12px;">
                      <tr>
                        <td style="font:700 14px Arial,sans-serif;color:${brand.primary};padding:16px 16px 8px">Your Driver</td>
                      </tr>
                      <tr>
                        <td style="padding:0 16px 16px">
                          <table role="presentation" width="100%">
                            <tr>
                              <td style="padding:4px 0;color:${brand.muted};font:400 12px Arial,sans-serif">Name</td>
                              <td style="padding:4px 0;color:${brand.primary};font:600 12px Arial,sans-serif">${safe(driverInfo.fullName)}</td>
                            </tr>
                            <tr>
                              <td style="padding:4px 0;color:${brand.muted};font:400 12px Arial,sans-serif">Contact</td>
                              <td style="padding:4px 0;color:${brand.primary};font:600 12px Arial,sans-serif">${safe(driverInfo.contact)}</td>
                            </tr>
                            <tr>
                              <td style="padding:4px 0;color:${brand.muted};font:400 12px Arial,sans-serif">PCO License</td>
                              <td style="padding:4px 0;color:${brand.primary};font:600 12px Arial,sans-serif">${safe(driverInfo.pcoLicense)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Vehicle Info -->
                  <td class="col" width="50%" valign="top" style="width:50%;padding-left:8px">
                    <table role="presentation" width="100%" style="background:${brand.card};border:1px solid ${brand.border};border-radius:12px;">
                      <tr>
                        <td style="font:700 14px Arial,sans-serif;color:${brand.primary};padding:16px 16px 8px">Your Vehicle</td>
                      </tr>
                      <tr>
                        <td style="padding:0 16px 16px">
                          <table role="presentation" width="100%">
                            <tr>
                              <td style="padding:4px 0;color:${brand.muted};font:400 12px Arial,sans-serif">Registration</td>
                              <td style="padding:4px 0;color:${brand.primary};font:600 12px Arial,sans-serif">${safe(vehicleInfo.registration)}</td>
                            </tr>
                            <tr>
                              <td style="padding:4px 0;color:${brand.muted};font:400 12px Arial,sans-serif">Make & Model</td>
                              <td style="padding:4px 0;color:${brand.primary};font:600 12px Arial,sans-serif">${safe(vehicleInfo.makeModel)}</td>
                            </tr>
                            <tr>
                              <td style="padding:4px 0;color:${brand.muted};font:400 12px Arial,sans-serif">Color</td>
                              <td style="padding:4px 0;color:${brand.primary};font:600 12px Arial,sans-serif">${safe(vehicleInfo.color)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contact Info - Only show if we have actual driver contact -->
          ${driver?.contact && driver.contact !== "Will contact you shortly" ? `
          <tr>
            <td class="px-22" style="padding:0 22px 18px">
              <table role="presentation" width="100%" style="background:${brand.bg};border:1px solid ${brand.border};border-radius:12px;padding:16px;text-align:center">
                <tr>
                  <td style="font:400 14px/1.6 Arial,sans-serif;color:${brand.primary}">
                    Need to contact your driver?<br/>
                    <a href="tel:${safe(driver.contact)}" style="color:${brand.accent};text-decoration:none;font-weight:600">${safe(driver.contact)}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>` : ``}

          <!-- Footer -->
          <tr>
            <td style="padding:16px 22px;border-top:1px solid ${brand.border};background:#FFF">
              <div style="font:700 12px/1.6 Arial,sans-serif;color:${brand.primary};margin-bottom:4px">${safe(org.name)}</div>
              <div style="font:400 12px/1.6 Arial,sans-serif;color:${brand.muted}">
                ${org.email ? `<a href="mailto:${safe(org.email)}" style="color:${brand.accent};text-decoration:none">${safe(org.email)}</a>` : ""}
                ${org.phone && org.email ? ` • ` : ""}
                ${org.phone ? `<span style="color:${brand.primary}">${safe(org.phone)}</span>` : ""}
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