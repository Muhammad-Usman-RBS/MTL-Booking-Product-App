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
  const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0"
  )}`;
  return `${dateStr} at ${timeStr}`;
};

export const driverStatusEmailTemplate = ({
  booking,
  driver,
  vehicle,
  status,
  company = {},
  options = {},
}) => {
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
  const org = {
    name:
      company?.name ||
      company?.companyProfile?.name ||
      options.companyName ||
      "Our Company",
    logoUrl:
      options.logoUrl ||
      company?.logoUrl ||
      company?.logo ||
      company?.companyProfile?.logoUrl ||
      "",
    email:
      options.supportEmail ||
      company?.email ||
      company?.companyProfile?.email ||
      "",
    phone:
      options.supportPhone ||
      company?.phone ||
      company?.companyProfile?.phone ||
      "",
    address: options.address || company?.address || "",
  };

  const safe = (v) =>
    String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  const driverInfo = {
    firstName: driver?.firstName || "Your",
    surName: driver?.surName || "Driver",
    contact: driver?.contact || "Will contact you shortly",
    pcoLicense: driver?.privateHireCardNo || "-",
    picture: driver?.driverPicture,
    fullName: driver
      ? `${driver.firstName || ""} ${driver.surName || ""}`.trim() ||
        "Your Driver"
      : "Your Driver",
  };

  const vehicleInfo = {
    registration: vehicle?.carRegistration || "TBD",
    make: vehicle?.carMake || "TBD",
    model: vehicle?.carModal || "TBD", 
    color: vehicle?.carColor || "TBD",
  };
  const statusConfig = {
    "On Route": {
      color: brand.warning,
      bg: "#FEF3C7",
      text: "Your driver is on the way!",
    },
    "At Location": {
      color: brand.success,
      bg: "#DCFCE7",
      text: "Your driver has arrived!",
    },
  };
  const currentStatus = statusConfig[status] || statusConfig["On Route"];
  const journey = booking?.primaryJourney || booking?.returnJourney || {};
  const formatEmail = (email) => {
    return email
      .replace("@", "&#8203;@&#8203;")
      .replace(/\./g, "&#8203;.&#8203;");
  };
  const locationLine = (addr) => {
    if (!addr) return "";
    const safeAddr = safe(String(addr).trim());
    const words = safeAddr.split(/\s+/);
    const lines = [];
    for (let i = 0; i < words.length; i += 6) {
      lines.push(words.slice(i, i + 6).join(" "));
    }
    const [firstLine, ...restLines] = lines;
    const restHtml = restLines.length
      ? `<div style="line-height:1.3;margin:0;padding:0;">${restLines.join("<br/>")}</div>`
      : "";
    return `<strong style="color:${brand.primary}">Location:</strong> ${firstLine}${restHtml}`;
  };
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
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${
    brand.bg
  }">
    <tr>
      <td align="center" style="padding:28px 16px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="width:600px;max-width:600px;background:${
          brand.card
        };border:1px solid ${brand.border};border-radius:16px;overflow:hidden">

          <!-- Header -->
          <tr>
            <td style="padding:0;background:linear-gradient(90deg, ${
              currentStatus.bg
            }, #ffffff);border-bottom:1px solid ${brand.border}">
              <table width="100%" role="presentation" style="padding:18px 22px">
                <tr>
                  <td align="left" style="vertical-align:middle">
                    ${
                      org.logoUrl
                        ? `<img src="${safe(
                            org.logoUrl
                          )}"  width="90" style="display:block;max-width:180px;height:auto" alt="${safe(
                            org.name
                          )}" />`
                        : `<div style="font:800 18px/1 Arial,sans-serif;color:${
                            brand.primary
                          }">${safe(org.name)}</div>`
                    }
                  </td>
 <td align="right" style="vertical-align:middle">
                <div style="margin-bottom:8px; text-align:right;">
  <span style="
    display:inline-block;
    background:${currentStatus.bg};
    color:${currentStatus.color};
    font:700 12px/1 Arial,sans-serif;
    padding:8px 16px;
    border-radius:999px;
    border:1px solid ${currentStatus.color}33;
  ">
    ${safe(status)}
  </span>
</div>
 <div style="font:400 13px/2 Arial,sans-serif;color:${brand.muted}">
   ${
     org.email
       ? `<strong style="color:${brand.primary}">Email:</strong> ${formatEmail(safe(org.email))}<br/>`
       : ""
   }
    ${org.phone ? `<strong style="color:${brand.primary}">Phone:</strong> +${safe(org.phone)}<br/>` : ""}
${org.address ? locationLine(org.address) : ""}  </div>
  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="px-22" style="padding:24px 22px 18px;text-align:start">
              <div style="font:500 24px/1.3 Arial,sans-serif;color:${
                brand.primary
              };margin:0 0 10px">${safe(currentStatus.text)}</div>
              <div style="font:600 16px/1.5 Arial,sans-serif;color:${
                brand.accent
              };margin:8px 0 0">Booking Reference: #${safe(
    booking?.bookingId
  )}</div>
            </td>
          </tr>
          <tr>
            <td class="px-22" style="padding:0 22px 18px">
              <table role="presentation" width="100%" style="background:${
                brand.bg
              };border:1px solid ${
    brand.border
  };border-radius:12px;padding:16px">
              <tr>
        <td style="font:700 14px Arial,sans-serif;width:80px;color:${
          brand.primary
        };padding-bottom:8px;white-space:nowrap">
        <div style="margin-bottom:10px;"> 
        Your Journey
        </div>  
        </td>
          </tr>
          <tr>
          <td style="color:${
            brand.muted
          };font:600 13px Arial,sans-serif"><div style="margin-bottom:15px;"> From: </div></td>
          <td style="color:${
            brand.primary
          };font:400 13px Arial,sans-serif"><div>${safe(
    journey?.pickup || "-"
  )}</div></td>
          </tr>
          <tr>
            <td style="padding:4px 8px 4px 0;color:${
              brand.muted
            };width:80px;font:600 13px Arial,sans-serif"><div style="margin-bottom:15px;">To:</div></td>
            <td style="padding:4px 0;color:${
              brand.primary
            };font:400 13px Arial,sans-serif"> <div>${safe(
    journey?.dropoff || "-"
  )}</div></td>
          </tr>
            <tr>
              <td style="padding:4px 8px 4px 0;color:${
                brand.muted
              };width:80px;font:600 13px Arial,sans-serif"><div style="margin-bottom:3px;">Date:</div></td>
              <td style="padding:4px 0;color:${
                brand.primary
              };font:400 13px Arial,sans-serif"><div style="margin-bottom:2px;">${safe(
    formatDateTime(journey)
  )}</div></td>
            </tr>
              </table>
            </td>
          </tr>

     <tr>
  <td class="px-22" style="padding:0 22px 18px;">
    <table role="presentation" width="100%" style="border:1px solid ${
      brand.border
    }; border-radius:12px; padding:16px; background:${brand.card};">
      <tr>
        <td colspan="2">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <!-- Driver Image -->
              <td valign="top" style="width:120px; padding-right:16px;">
                ${
                  driverInfo.picture
                    ? `<img src="${safe(driverInfo.picture)}"
                          alt="Driver Photo"
                          style="width:100px;height:100px;border-radius:12px;object-fit:cover;border:1px solid ${
                            brand.border
                          };" />`
                    : ""
                }
              </td>
              <td valign="center">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding:4px 0;color:${
                      brand.muted
                    };font:400 12px Arial,sans-serif;">Name</td>
                    <td style="padding:4px 0;color:${
                      brand.primary
                    };font:600 12px Arial,sans-serif;">${safe(
    driverInfo.fullName
  )}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:${
                      brand.muted
                    };font:400 12px Arial,sans-serif;">Contact</td>
                    <td style="padding:4px 0;color:${
                      brand.primary
                    };font:600 12px Arial,sans-serif;">${safe(
    driverInfo.contact
  )}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:${
                      brand.muted
                    };font:400 12px Arial,sans-serif;">PCO License</td>
                    <td style="padding:4px 0;color:${
                      brand.primary
                    };font:600 12px Arial,sans-serif;">${safe(
    driverInfo.pcoLicense
  )}</td>
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
  <tr>
  <td class="px-22" style="padding:0 22px 18px;">
    <table role="presentation" width="100%" style="border:1px solid ${
      brand.border
    }; border-radius:12px; padding:16px; background:${brand.card};">
      <tr>
        <td colspan="2">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <!-- Vehicle Image -->
              <td valign="top" style="width:120px; padding-right:16px;">
                ${
                  vehicle.vehiclePicture
                    ? `<img src="${safe(vehicle.vehiclePicture)}"
                          alt="Vehicle Photo"
                          style="width:100px;height:100px;border-radius:12px;object-fit:cover;border:1px solid ${
                            brand.border
                          };" />`
                    : ""
                }
              </td>
              <td valign="center">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding:4px 0;color:${
                      brand.muted
                    };font:400 12px Arial,sans-serif;">Registration</td>
                    <td style="padding:4px 0;color:${
                      brand.primary
                    };font:600 12px Arial,sans-serif;">${safe(
    vehicleInfo.registration
  )}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:${
                      brand.muted
                    };font:400 12px Arial,sans-serif;">Make</td>
                    <td style="padding:4px 0;color:${
                      brand.primary
                    };font:600 12px Arial,sans-serif;">${safe(
    vehicleInfo.make
  )}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:${
                      brand.muted
                    };font:400 12px Arial,sans-serif;">Model</td>
                    <td style="padding:4px 0;color:${
                      brand.primary
                    };font:600 12px Arial,sans-serif;">${safe(
    vehicleInfo.model
  )}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:${
                      brand.muted
                    };font:400 12px Arial,sans-serif;">Color</td>
                    <td style="padding:4px 0;color:${
                      brand.primary
                    };font:600 12px Arial,sans-serif;">${safe(
    vehicleInfo.color
  )}</td>
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
 <tr>
  <td style="padding:20px 24px;border-top:1px solid ${brand.border};background:#FAFAFA; text-align:center;">
    <div style="font:700 16px/1.4 Arial,sans-serif;color:${brand.primary};margin-bottom:3px;">
      ${safe(org.name)}
    </div>
    <div style="display:inline-flex;align-items:center;justify-content:center; Arial,sans-serif;color:#9CA3AF;">
      <span style="font:500 16px">Need to contact the company?</span>
      <a href="tel:${safe(driver.contact)}"
         style="margin-left:8px;color:${brand.accent};text-decoration:none;font-weight:600;">
        +${safe(org.phone)}
      </a>
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