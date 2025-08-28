export const customerBookingConfirmationTemplate = ({
  booking,
  company = {},
  options = {},
}) => {
  const pj = booking?.primaryJourney || {};
  const rj = booking?.returnJourneyToggle ? (booking?.returnJourney || {}) : null;

  // ===== Brand / Company =====
  const brand = {
    primary: options.primaryColor || "#0F172A",
    accent: options.accentColor || "#2563EB",
    muted: options.mutedColor || "#6B7280",
    bg: options.bgColor || "#F8FAFC",
    card: options.cardColor || "#FFFFFF",
    border: options.borderColor || "#E5E7EB",
    success: options.successColor || "#16A34A",
    pill: options.pillColor || "#DCFCE7",
    accentLight: options.accentLight || "#DBEAFE"
  };

  // One source of truth for clientadmin/company fields
  const org = {
    // Priority: company.companyName (top-level field from your DB)
    name: company?.companyName || company?.tradingName || company?.name || company?.companyProfile?.name || options.companyName || "Our Company",

    // Logo: profileImage is the field name in your DB
    logoUrl: company?.profileImage || options.logoUrl || company?.logoUrl || company?.logo || company?.companyProfile?.logoUrl || "",

    // Email: top-level email field
    email: options.supportEmail || company?.email || company?.companyProfile?.email || "",

    // Phone: contact field in your DB
    phone: options.supportPhone || company?.contact || company?.phone || company?.companyProfile?.phone || "",

    // Website and address from companyProfile if it exists
    website: options.website || company?.companyProfile?.website || "",
    address: options.address || company?.address || company?.companyProfile?.address || ""
  };

  const manageUrl = options.manageUrl || "";
  const termsUrl = options.termsUrl || "";
  const currency = options.currency || "£";

  // ===== Utils =====
  const pad2 = (n) => (Number.isInteger(n) ? String(n).padStart(2, "0") : "--");
  const dt = (j) => `${j?.date || "-"} ${pad2(j?.hour)}:${pad2(j?.minute)}`;
  const safe = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const fareLine = () => {
    const out = [`${currency}${Number(booking?.journeyFare || 0).toFixed(2)}`];
    if (booking?.returnJourneyToggle) out.push(`${currency}${Number(booking?.returnJourneyFare || 0).toFixed(2)}`);
    return out.join(" + ");
  };

  const button = (href, label) => href ? `
    <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${safe(href)}" style="height:44px;v-text-anchor:middle;width:240px;" arcsize="12%" stroke="f" fillcolor="${brand.accent}">
        <w:anchorlock/>
        <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">${safe(label)}</center>
      </v:roundrect>
    <![endif]-->
    <!--[if !mso]><!-- -->
      <a href="${safe(href)}" style="display:inline-block;background:${brand.accent};color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px">${safe(label)}</a>
    <!--<![endif]-->
  ` : "";

  const kv = (k, v) => `
    <tr>
      <td style="padding:8px 0;color:${brand.muted};width:140px">${safe(k)}</td>
      <td style="padding:8px 0;color:${brand.primary};font-weight:600">${safe(v || "-")}</td>
    </tr>
  `;

  const card = (title, inner) => `
    <table role="presentation" width="100%" style="background:${brand.card};border:1px solid ${brand.border};border-radius:14px;padding:16px">
      ${title ? `<tr><td style="font:700 14px Arial,sans-serif;color:${brand.primary};padding-bottom:8px">${safe(title)}</td></tr>` : ""}
      ${inner}
    </table>
  `;

  const journeyBlock = (label, j) => card(label, `
    <tr><td style="font:400 14px Arial,sans-serif;color:${brand.primary}">
      <strong>Pickup:</strong> ${safe(j?.pickup || "-")}<br/>
      <strong>Dropoff:</strong> ${safe(j?.dropoff || "-")}<br/>
      <strong>Date/Time:</strong> ${safe(dt(j))}<br/>
      ${j?.flightNumber ? `<strong>Flight:</strong> ${safe(j.flightNumber)}<br/>` : ""}
      ${j?.distanceText ? `<strong>Distance:</strong> ${safe(j.distanceText)}<br/>` : ""}
      ${j?.durationText ? `<strong>Duration:</strong> ${safe(j.durationText)}<br/>` : ""}
    </td></tr>
  `);

  // Equal heights for Passenger & Vehicle
  const BOX_HEIGHT = 190; // adjust if your content grows

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Booking #${safe(booking?.bookingId)}</title>
  <style>
    @media (max-width:640px){
      .container{width:100% !important;padding:0 16px !important}
      .grid{display:block !important}
      .col{width:100% !important;display:block !important}
      .px-22{padding-left:16px !important;padding-right:16px !important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${brand.bg};">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${brand.bg}">
    <tr>
      <td align="center" style="padding:28px 16px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="width:600px;max-width:600px;background:${brand.card};border:1px solid ${brand.border};border-radius:16px;overflow:hidden">

          <!-- Brand bar -->
          <tr>
            <td style="padding:0;background:linear-gradient(90deg, ${brand.accentLight}, #ffffff);border-bottom:1px solid ${brand.border}">
              <table width="100%" role="presentation" style="padding:18px 22px">
                <tr>
                  <td align="left" style="vertical-align:middle">
                    ${org.logoUrl
      ? `<img src="${safe(org.logoUrl)}" width="150" style="display:block;max-width:180px;height:auto" alt="${safe(org.name)}" />`
      : `<div style="font:800 18px/1 Arial,sans-serif;color:${brand.primary}">${safe(org.name)}</div>`
    }
                  </td>
                  <td align="right" style="vertical-align:middle">
                    <span style="display:inline-block;background:${brand.pill};color:${brand.success};font:700 12px/1 Arial,sans-serif;padding:8px 12px;border-radius:999px;border:1px solid ${brand.success}1A">Confirmed</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td class="px-22" style="padding:18px 22px 6px">
              <div style="font:800 22px/1.25 Arial,sans-serif;color:${brand.primary};margin:0 0 6px">Your Booking is Confirmed</div>
              <div style="font:400 13px/1.6 Arial,sans-serif;color:${brand.muted};margin:0">Booking #${safe(booking?.bookingId)}</div>
            </td>
          </tr>

          <!-- Journey first -->
          <tr>
            <td class="px-22" style="padding:6px 22px 6px">
              <table role="presentation" width="100%" class="grid" style="border-collapse:separate;border-spacing:0 12px">
                <tr>
                  <td class="col" width="${rj ? "50%" : "100%"}" style="width:${rj ? "50%" : "100%"};${rj ? "padding-right:8px" : ""}">
                    ${journeyBlock("Journey Details", pj)}
                  </td>
                  ${rj ? `
                  <td class="col" width="50%" style="width:50%;padding-left:8px">
                    ${journeyBlock("Return Journey", rj)}
                  </td>` : ``}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="height:1px;background:${brand.border};line-height:1px;font-size:0">&nbsp;</td></tr>

          <!-- Passenger & Vehicle (equal height) -->
          <tr>
            <td class="px-22" style="padding:10px 22px 6px">
              <table role="presentation" width="100%" class="grid" style="border-collapse:separate;border-spacing:0 12px">
                <tr>
                  <td class="col" width="50%" valign="top" style="width:50%;padding-right:8px">
                    <table role="presentation" width="100%" style="background:${brand.bg};border:1px solid ${brand.border};border-radius:12px;">
                      <tr>
                        <td style="font:700 14px Arial,sans-serif;color:${brand.primary};padding:14px 14px 6px">Passenger</td>
                      </tr>
                      <tr>
                        <!-- fixed height works in most clients when applied to TD -->
                        <td height="${BOX_HEIGHT}" valign="top" style="padding:0 14px 14px;height:${BOX_HEIGHT}px">
                          <table role="presentation" width="100%">
                            ${kv("Name", booking?.passenger?.name || "Guest")}
                            ${kv("Phone", booking?.passenger?.phone || "")}
                            ${kv("Email", booking?.passenger?.email || "")}
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <td class="col" width="50%" valign="top" style="width:50%;padding-left:8px">
                    <table role="presentation" width="100%" style="background:${brand.bg};border:1px solid ${brand.border};border-radius:12px;">
                      <tr>
                        <td style="font:700 14px Arial,sans-serif;color:${brand.primary};padding:14px 14px 6px">Vehicle</td>
                      </tr>
                      <tr>
                        <td height="${BOX_HEIGHT}" valign="top" style="padding:0 14px 14px;height:${BOX_HEIGHT}px">
                          <table role="presentation" width="100%">
                            ${kv("Model", booking?.vehicle?.vehicleName || "-")}
                            ${kv("Passengers", String(booking?.vehicle?.passenger ?? 0))}
                            ${kv("Check-in Luggage", String(booking?.vehicle?.checkinLuggage ?? 0))}
                            ${kv("Hand Luggage", String(booking?.vehicle?.handLuggage ?? 0))}
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Fare -->
          <tr>
            <td class="px-22" style="padding:6px 22px 6px">
              ${card("Fare", `
                <tr><td style="font:400 14px Arial,sans-serif;color:${brand.primary}">
                  <strong>Total:</strong> ${safe(fareLine())}
                </td></tr>
                ${booking?.primaryJourney?.notes ? `
                <tr><td style="font:400 13px Arial,sans-serif;color:${brand.muted};padding-top:8px">
                  <strong>Notes:</strong> ${safe(booking.primaryJourney.notes)}
                </td></tr>` : ``}
              `)}
            </td>
          </tr>

          <!-- CTA -->
          ${manageUrl ? `
          <tr>
            <td align="center" style="padding:10px 22px 18px">
              ${button(manageUrl, "View / Manage Booking")}
            </td>
          </tr>` : ``}

          <!-- Company info -->
          <tr>
            <td style="padding:16px 22px 22px;border-top:1px solid ${brand.border};background:#FFF">
              <div style="font:700 12px/1.6 Arial,sans-serif;color:${brand.primary};margin-bottom:4px">${safe(org.name)}</div>
              <div style="font:400 12px/1.6 Arial,sans-serif;color:${brand.muted}">
                ${org.email ? `Email: <a href="mailto:${safe(org.email)}" style="color:${brand.accent};text-decoration:none">${safe(org.email)}</a> &nbsp;•&nbsp; ` : ""}
                ${org.phone ? `Phone: <span style="color:${brand.primary}">${safe(org.phone)}</span> &nbsp;•&nbsp; ` : ""}
                ${org.website ? `<a href="${safe(org.website)}" style="color:${brand.accent};text-decoration:none">Website</a> &nbsp;•&nbsp; ` : ""}
                ${termsUrl ? `<a href="${safe(termsUrl)}" style="color:${brand.accent};text-decoration:none">Terms</a>` : ""}
                ${org.address ? `<div style="margin-top:6px">${safe(org.address)}</div>` : ""}
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
