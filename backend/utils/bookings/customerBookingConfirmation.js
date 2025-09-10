export const customerBookingConfirmation = ({
  booking,
  company = {},
  clientAdmin = {},
  options = {},
}) => {
  const pj = booking?.primaryJourney || {};
  const rj = booking?.returnJourneyToggle ? booking?.returnJourney || {} : null;

  // Brand colors
  const brand = {
    primary: options.primaryColor || "#0F172A",
    accent: options.accentColor || "#2563EB",
    muted: options.mutedColor || "#6B7280",
    bg: options.bgColor || "#F8FAFC",
    card: options.cardColor || "#FFFFFF",
    border: options.borderColor || "#E5E7EB",
    success: options.successColor || "#16A34A",
    pill: options.pillColor || "#DCFCE7",
    accentLight: options.accentLight || "#DBEAFE",
  };

  // Company  info
  const org = {
    name:
      company?.companyName ||
      company?.tradingName ||
      company?.name ||
      "Our Company",
    logoUrl: company?.profileImage || options.logoUrl || "",
    email: options.supportEmail || company?.email || "",
    phone: options.supportPhone || company?.contact || company?.phone || "",
    website: options.website || company?.website || "",
    address: options.address || company?.address || "",
  };

  // ✅ Client Admin (Account Manager)
  const admin = {
    name: clientAdmin?.name || "",
    email: clientAdmin?.email || "",
    phone: clientAdmin?.contact || clientAdmin?.phone || "",
    avatar: clientAdmin?.profileImage || "",
  };

  const currency = options.currency || "£";
  const safe = (v) =>
    String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  // Time formatting
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
  // Fare calculation
  const fareLine = () => {
    if (booking?.returnJourneyToggle) {
      return `${currency}${Number(booking?.returnJourneyFare || 0).toFixed(2)}`;
    }
    return `${currency}${Number(booking?.journeyFare || 0).toFixed(2)}`;
  };

  const journeyCard = (label, j, vehicleInfo = {}) => `
    <table role="presentation" width="100%" style="background:${
      brand.card
    };border:1px solid ${brand.border};border-radius:12px;">
      <tr>
        <td style="font:700 16px Arial,sans-serif;color:${
          brand.primary
        };padding:16px 16px 8px">${safe(label)}</td>
      </tr>
      <tr>
        <td style="padding:0 16px 16px">
          <table role="presentation" width="100%">
            <tr>
              <td style="padding:6px 0;color:${
                brand.muted
              };width:80px;font:600 13px Arial,sans-serif">From:</td>
              <td style="padding:6px 0;color:${
                brand.primary
              };font:400 14px Arial,sans-serif">${safe(j?.pickup || "-")}</td>
            </tr>

            <tr>
  ${
    j?.flightNumber || j?.pickmeAfter || j?.arrivefrom
      ? `
      <tr>
        ${
          j?.flightNumber
            ? `<td style="padding:6px 0;color:${brand.muted};font:600 13px Arial,sans-serif;">
                Flight No.:<br/>
                <span style="color:${brand.primary};font-weight:400;font-size:14px;">${safe(j.flightNumber)}</span>
              </td>`
            : ``
        }
        ${
          j?.pickmeAfter
            ? `<td style="padding:6px 0;color:${brand.muted};font:600 13px Arial,sans-serif;">
                Pick Me After:<br/>
                <span style="color:${brand.primary};font-weight:400;font-size:14px;">${safe(j.pickmeAfter)}</span>
              </td>`
            : ``
        }
        ${
          j?.arrivefrom
            ? `<td style="padding:6px 0;color:${brand.muted};font:600 13px Arial,sans-serif;">
                Arrive From:<br/>
                <span style="color:${brand.primary};font-weight:400;font-size:14px;">${safe(j.arrivefrom)}</span>
              </td>`
            : ``
        }
      </tr>`
      : ""
  }
</tr>

            <tr>
              <td style="padding:6px 0;color:${
                brand.muted
              };width:80px;font:600 13px Arial,sans-serif">To:</td>
              <td style="padding:6px 0;color:${
                brand.primary
              };font:400 14px Arial,sans-serif">${safe(j?.dropoff || "-")}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:${
                brand.muted
              };width:80px;font:600 13px Arial,sans-serif">Date:</td>
              <td style="padding:6px 0;color:${
                brand.primary
              };font:400 14px Arial,sans-serif">${safe(formatDateTime(j))}</td>
            </tr>
         
            ${
              j?.dropoff_terminal_0
                ? `
            <tr>
              <td style="padding:6px 0;color:${
                brand.muted
              };width:80px;font:600 13px Arial,sans-serif">Dropoff Terminal-0:</td>
              <td style="padding:6px 0;color:${
                brand.primary
              };font:400 14px Arial,sans-serif">${safe(j.dropoff_terminal_0)}</td>
            </tr>`
                : ``
            }
            ${
              j?.dropoff_terminal_1
                ? `
            <tr>
              <td style="padding:6px 0;color:${
                brand.muted
              };width:80px;font:600 13px Arial,sans-serif">Dropoff Terminal-1:</td>
              <td style="padding:6px 0;color:${
                brand.primary
              };font:400 14px Arial,sans-serif">${safe(j.dropoff_terminal_1)}</td>
            </tr>`
                : ``
            }
            ${
              j?.dropoff_terminal_2
                ? `
            <tr>
              <td style="padding:6px 0;color:${
                brand.muted
              };width:80px;font:600 13px Arial,sans-serif">Dropoff Terminal-2:</td>
              <td style="padding:6px 0;color:${
                brand.primary
              };font:400 14px Arial,sans-serif">${safe(j.dropoff_terminal_2)}</td>
            </tr>`
                : ``
            }
            ${
              j?.dropoffDoorNumber0
                ? `
            <tr>
              <td style="padding:6px 0;color:${
                brand.muted
              };width:80px;font:600 13px Arial,sans-serif">Dropoff Door No-0:</td>
              <td style="padding:6px 0;color:${
                brand.primary
              };font:400 14px Arial,sans-serif">${safe(j.dropoffDoorNumber0)}</td>
            </tr>`
                : ``
            }
            ${
              j?.dropoffDoorNumber1
                ? `
            <tr>
              <td style="padding:6px 0;color:${
                brand.muted
              };width:80px;font:600 13px Arial,sans-serif">Dropoff Door No-1:</td>
              <td style="padding:6px 0;color:${
                brand.primary
              };font:400 14px Arial,sans-serif">${safe(j.dropoffDoorNumber1)}</td>
            </tr>`
                : ``
            }
            ${
              j?.dropoffDoorNumber2
                ? `
            <tr>
              <td style="padding:6px 0;color:${
                brand.muted
              };width:80px;font:600 13px Arial,sans-serif">Dropoff Door No.-2:</td>
              <td style="padding:6px 0;color:${
                brand.primary
              };font:400 14px Arial,sans-serif">${safe(j.dropoffDoorNumber2)}</td>
            </tr>`
                : ``
            }
         ${
    vehicleInfo?.childSeat && vehicleInfo.childSeat > 0
      ? `
      <tr>
        <td style="padding:6px 0;color:${
          brand.muted
        };width:80px;font:600 13px Arial,sans-serif">Child Seat:</td>
        <td style="padding:6px 0;color:${
          brand.primary
        };font:400 14px Arial,sans-serif">${vehicleInfo.childSeat}</td>
      </tr>`
      : ``
  }
          
            ${
              j?.notes
                ? `
            <tr>
              <td style="padding:6px 0;color:${
                brand.muted
              };width:80px;font:600 13px Arial,sans-serif">Notes:</td>
              <td style="padding:6px 0;color:${
                brand.primary
              };font:400 14px Arial,sans-serif">${safe(j.notes)}</td>
            </tr>`
                : ``
            }
          </table>
        </td>
      </tr>
    </table>
  `;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Booking Confirmation #${safe(booking?.bookingId)}</title>
  <style>
    @media (max-width:640px){
      .container{width:100% !important;padding:0 16px !important}
      .px-22{padding-left:16px !important;padding-right:16px !important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${brand.bg};font-family:Arial,sans-serif">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${brand.bg}">
    <tr>
      <td align="center" style="padding:28px 16px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="width:600px;max-width:600px;background:${brand.card};border:1px solid ${brand.border};border-radius:16px;overflow:hidden">

          <!-- Header -->
          <tr>
            <td style="padding:0;background:linear-gradient(90deg, ${brand.accentLight}, #ffffff);border-bottom:1px solid ${brand.border}">
              <table width="100%" role="presentation" style="padding:20px 24px">
                <tr>
                  <td align="left" style="vertical-align:middle">
                    ${org.logoUrl
         ? `<img src="${safe(org.logoUrl)}" width="90" style="display:block;max-width:100px;height:auto" alt="${safe(org.name)}" />`
                        : `<div style="font:500 20px/1 Arial,sans-serif;color:${
                            brand.primary
                          }">${safe(org.name)}</div>`
                    }
                                        
                  </td>
                  <td align="right" style="vertical-align:middle">
                    <div style="margin-bottom:8px">
  <strong style="display:inline-block;background:${brand.accentLight};font:500 14px/1 Arial,sans-serif;padding:8px 16px;border-radius:999px;border:1px solid ${
    brand.accentLight
  }1A">Confirmed</strong>
</div>
  <div style="font:400 13px/2 Arial,sans-serif;color:${brand.muted}">
    ${
      org.email
        ? `<strong>Email:</strong> <a href="mailto:${safe(
            org.email
          )}" style="color:${brand.accent};text-decoration:none">${safe(
            org.email
          )}</a><br/>`
        : ""
    }
    ${org.phone ? `<strong>Phone:</strong> +${safe(org.phone)}<br/>` : ""}
    ${org.address ? `<strong>Location:</strong> ${safe(org.address)}<br/>` : ""}
  </div>
 
</td>

                </tr>
              </table>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td class="px-22" style="padding:24px 24px 16px">
              <div style="font:600 22px/1.3 Arial,sans-serif;color:${
                brand.primary
              };margin:0 0 8px">Booking Confirmed!</div>
              <div style="font:400 16px/1.5 Arial,sans-serif;color:${
                brand.muted
              };margin:0">Thank you for choosing <strong>"${safe(
    org.name
  )}"</strong>. Your booking has been confirmed.</div>
              <div style="font:600 16px/1.5 Arial,sans-serif;color:${
                brand.accent
              };margin:8px 0 0">Booking Reference: #${safe(
    booking?.bookingId
  )}</div>
            </td>
          </tr>

          <!-- Journey Details -->
          <tr>
            <td class="px-22" style="padding:0 24px 16px">
            ${
              rj
                ? journeyCard("Journey Details (Return)", rj, booking?.vehicle)
                : journeyCard("Journey Details (Primary)", pj, booking?.vehicle)
            }
            
            </td>
          </tr>

          <!-- Customer Information -->
          <tr>
            <td class="px-22" style="padding:0 24px 16px">
              <table role="presentation" width="100%" style="background:${
                brand.card
              };border:1px solid ${
    brand.border
  };border-radius:12px;padding:16px">
                <tr>
                  <td style="font:700 16px Arial,sans-serif;color:${
                    brand.primary
                  };padding-bottom:12px">Customer Information</td>
                </tr>
                <tr>
                  <td>
                    <table role="presentation" width="100%">
                      <tr>
                        <td style="padding:4px 0;color:${
                          brand.muted
                        };width:80px;font:600 13px Arial,sans-serif">Name:</td>
                        <td style="padding:4px 0;color:${
                          brand.primary
                        };font:400 14px Arial,sans-serif">${safe(
    booking?.passenger?.name?.charAt(0).toUpperCase() +
      booking?.passenger?.name?.slice(1) || "Guest"
  )}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:${
                          brand.muted
                        };width:80px;font:600 13px Arial,sans-serif">Email:</td>
                        <td style="padding:4px 0;color:${
                          brand.primary
                        };font:400 14px Arial,sans-serif">${safe(
    booking?.passenger?.email || "-"
  )}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:${
                          brand.muted
                        };width:80px;font:600 13px Arial,sans-serif">Phone:</td>
                        <td style="padding:4px 0;color:${
                          brand.primary
                        };font:400 14px Arial,sans-serif">+${safe(
    booking?.passenger?.phone || "-"
  )}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Fare Summary -->
          <tr>
            <td class="px-22" style="padding:0 24px 24px">
              <table role="presentation" width="100%" style="background:${
                brand.card
              };border:1px solid ${
    brand.border
  };border-radius:12px;padding:16px">
                <tr>
                  <td style="font:700 16px Arial,sans-serif;color:${
                    brand.primary
                  };padding-bottom:8px">Fare Summary</td>
                </tr>
                <tr>
                  <td style="font:600 18px Arial,sans-serif;color:${
                    brand.accent
                  }">
                    Total: ${safe(fareLine())}
                  </td>
                </tr>
               
              </table>
            </td>
          </tr>

      

          <!-- Important Note -->
          <tr>
            <td class="px-22" style="padding:0 24px 24px">
              <table role="presentation" width="100%" style="background:#FEF3C7;border:1px solid #F59E0B;border-radius:12px;padding:16px">
                <tr>
                  <td style="font:600 14px/1.5 Arial,sans-serif;color:#92400E">
                    Our driver will contact you shortly before pickup with vehicle details and arrival information.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer with company info -->
          <tr>
            <td style="padding:20px 24px;border-top:1px solid ${
              brand.border
            };background:#FAFAFA">
              <div style="font:700 16px/1.4 Arial,sans-serif;color:${
                brand.primary
              };margin-bottom:8px">${safe(org.name)}</div>
            
              <div style="font:400 11px/1.5 Arial,sans-serif;color:#9CA3AF;margin-top:16px;padding-top:12px;border-top:1px solid ${
                brand.border
              }">
                This is an automated confirmation email. Please keep this for your records.
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
