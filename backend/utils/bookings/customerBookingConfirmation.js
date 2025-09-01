export const customerBookingConfirmation = ({
  booking,
  company = {},
  clientAdmin = {},
  options = {},
}) => {
  const pj = booking?.primaryJourney || {};
  const rj = booking?.returnJourneyToggle ? (booking?.returnJourney || {}) : null;

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

  // Company (brand) info
  const org = {
    name: company?.companyName || company?.tradingName || company?.name || "Our Company",
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
  const safe = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Time formatting
  const pad2 = (n) => (Number.isInteger(n) ? String(n).padStart(2, "0") : "--");
  const dt = (j) => `${j?.date || "-"} ${pad2(j?.hour)}:${pad2(j?.minute)}`;

  // Fare calculation
  const fareLine = () => {
    const out = [`${currency}${Number(booking?.journeyFare || 0).toFixed(2)}`];
    if (booking?.returnJourneyToggle) out.push(`${currency}${Number(booking?.returnJourneyFare || 0).toFixed(2)}`);
    return out.join(" + ");
  };

  const journeyCard = (label, j) => `
    <table role="presentation" width="100%" style="background:${brand.card};border:1px solid ${brand.border};border-radius:12px;margin-bottom:16px">
      <tr>
        <td style="font:700 16px Arial,sans-serif;color:${brand.primary};padding:16px 16px 8px">${safe(label)}</td>
      </tr>
      <tr>
        <td style="padding:0 16px 16px">
          <table role="presentation" width="100%">
            <tr>
              <td style="padding:6px 0;color:${brand.muted};width:80px;font:600 13px Arial,sans-serif">From:</td>
              <td style="padding:6px 0;color:${brand.primary};font:400 14px Arial,sans-serif">${safe(j?.pickup || "-")}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:${brand.muted};width:80px;font:600 13px Arial,sans-serif">To:</td>
              <td style="padding:6px 0;color:${brand.primary};font:400 14px Arial,sans-serif">${safe(j?.dropoff || "-")}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:${brand.muted};width:80px;font:600 13px Arial,sans-serif">Date:</td>
              <td style="padding:6px 0;color:${brand.primary};font:400 14px Arial,sans-serif">${safe(dt(j))}</td>
            </tr>
            ${j?.flightNumber ? `
            <tr>
              <td style="padding:6px 0;color:${brand.muted};width:80px;font:600 13px Arial,sans-serif">Flight:</td>
              <td style="padding:6px 0;color:${brand.primary};font:400 14px Arial,sans-serif">${safe(j.flightNumber)}</td>
            </tr>` : ``}
            ${j?.notes ? `
            <tr>
              <td style="padding:6px 0;color:${brand.muted};width:80px;font:600 13px Arial,sans-serif">Notes:</td>
              <td style="padding:6px 0;color:${brand.primary};font:400 14px Arial,sans-serif">${safe(j.notes)}</td>
            </tr>` : ``}
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
      ? `<img src="${safe(org.logoUrl)}" width="160" style="display:block;max-width:180px;height:auto" alt="${safe(org.name)}" />`
      : `<div style="font:800 20px/1 Arial,sans-serif;color:${brand.primary}">${safe(org.name)}</div>`
    }
                  </td>
                  <td align="right" style="vertical-align:middle">
                    <span style="display:inline-block;background:${brand.pill};color:${brand.success};font:700 12px/1 Arial,sans-serif;padding:8px 16px;border-radius:999px;border:1px solid ${brand.success}1A">CONFIRMED</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td class="px-22" style="padding:24px 24px 16px">
              <div style="font:800 24px/1.3 Arial,sans-serif;color:${brand.primary};margin:0 0 8px">Booking Confirmed!</div>
              <div style="font:400 16px/1.5 Arial,sans-serif;color:${brand.muted};margin:0">Thank you for choosing ${safe(org.name)}. Your booking has been confirmed.</div>
              <div style="font:600 14px/1.5 Arial,sans-serif;color:${brand.accent};margin:8px 0 0">Booking Reference: #${safe(booking?.bookingId)}</div>
            </td>
          </tr>

          <!-- Journey Details -->
          <tr>
            <td class="px-22" style="padding:0 24px 16px">
              ${journeyCard("Journey Details", pj)}
              ${rj ? journeyCard("Return Journey", rj) : ""}
            </td>
          </tr>

          <!-- Customer Information -->
          <tr>
            <td class="px-22" style="padding:0 24px 16px">
              <table role="presentation" width="100%" style="background:${brand.bg};border:1px solid ${brand.border};border-radius:12px;padding:16px">
                <tr>
                  <td style="font:700 16px Arial,sans-serif;color:${brand.primary};padding-bottom:12px">Customer Information</td>
                </tr>
                <tr>
                  <td>
                    <table role="presentation" width="100%">
                      <tr>
                        <td style="padding:4px 0;color:${brand.muted};width:80px;font:600 13px Arial,sans-serif">Name:</td>
                        <td style="padding:4px 0;color:${brand.primary};font:400 14px Arial,sans-serif">${safe(booking?.passenger?.name || "Guest")}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:${brand.muted};width:80px;font:600 13px Arial,sans-serif">Email:</td>
                        <td style="padding:4px 0;color:${brand.primary};font:400 14px Arial,sans-serif">${safe(booking?.passenger?.email || "-")}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:${brand.muted};width:80px;font:600 13px Arial,sans-serif">Phone:</td>
                        <td style="padding:4px 0;color:${brand.primary};font:400 14px Arial,sans-serif">${safe(booking?.passenger?.phone || "-")}</td>
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
              <table role="presentation" width="100%" style="background:${brand.bg};border:1px solid ${brand.border};border-radius:12px;padding:16px">
                <tr>
                  <td style="font:700 16px Arial,sans-serif;color:${brand.primary};padding-bottom:8px">Fare Summary</td>
                </tr>
                <tr>
                  <td style="font:600 18px Arial,sans-serif;color:${brand.accent}">
                    Total: ${safe(fareLine())}
                  </td>
                </tr>
                <tr>
                  <td style="font:400 13px Arial,sans-serif;color:${brand.muted};padding-top:6px">
                    Payment Method: ${safe(booking?.paymentMethod || "Cash")}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Account Manager (Client Admin) -->
          ${(admin.name || admin.email || admin.phone) ? `
          <tr>
            <td class="px-22" style="padding:0 24px 24px">
              <table role="presentation" width="100%" style="background:${brand.card};border:1px solid ${brand.border};border-radius:12px;padding:16px">
                <tr>
                  <td style="font:700 16px Arial,sans-serif;color:${brand.primary};padding-bottom:8px">Your Account Manager</td>
                </tr>
                <tr>
                  <td style="font:400 14px Arial,sans-serif;color:${brand.primary}">
                    ${admin.name ? `<div><strong>${safe(admin.name)}</strong></div>` : ``}
                    ${admin.email ? `<div>📧 <a href="mailto:${safe(admin.email)}" style="color:${brand.accent};text-decoration:none">${safe(admin.email)}</a></div>` : ``}
                    ${admin.phone ? `<div>📞 ${safe(admin.phone)}</div>` : ``}
                  </td>
                </tr>
              </table>
            </td>
          </tr>` : ``}

          <!-- Important Note -->
          <tr>
            <td class="px-22" style="padding:0 24px 24px">
              <table role="presentation" width="100%" style="background:#FEF3C7;border:1px solid #F59E0B;border-radius:12px;padding:16px">
                <tr>
                  <td style="font:600 14px/1.5 Arial,sans-serif;color:#92400E">
                    📞 Our driver will contact you shortly before pickup with vehicle details and arrival information.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer with company info -->
          <tr>
            <td style="padding:20px 24px;border-top:1px solid ${brand.border};background:#FAFAFA">
              <div style="font:700 16px/1.4 Arial,sans-serif;color:${brand.primary};margin-bottom:8px">${safe(org.name)}</div>
              <div style="font:400 13px/1.6 Arial,sans-serif;color:${brand.muted}">
                ${org.email ? `📧 <a href="mailto:${safe(org.email)}" style="color:${brand.accent};text-decoration:none">${safe(org.email)}</a><br/>` : ""}
                ${org.phone ? `📞 ${safe(org.phone)}<br/>` : ""}
                ${org.address ? `📍 ${safe(org.address)}<br/>` : ""}
                ${org.website ? `🌐 <a href="${safe(org.website)}" style="color:${brand.accent};text-decoration:none">${safe(org.website)}</a>` : ""}
              </div>
              <div style="font:400 11px/1.5 Arial,sans-serif;color:#9CA3AF;margin-top:16px;padding-top:12px;border-top:1px solid ${brand.border}">
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