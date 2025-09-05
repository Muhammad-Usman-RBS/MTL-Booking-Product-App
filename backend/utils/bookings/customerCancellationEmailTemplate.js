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

export const customerCancellationEmailTemplate = ({
    booking = {},
    company = {},
    clientAdmin = {},
    cancelledBy = "Admin",
    cancellationReason = null,
    options = {},
}) => {
    // Brand colors (same system as driverStatusEmailTemplate)
    const brand = {
        primary: options.primaryColor || "#0F172A",
        accent: options.accentColor || "#2563EB", // red accent for cancellation
        muted: options.mutedColor || "#6B7280",
        bg: options.bgColor || "#F8FAFC",
        card: options.cardColor || "#FFFFFF",
        border: options.borderColor || "#E5E7EB",
        danger: options.dangerColor || "#DC2626",
        dangerBg: "#FEE2E2",
    };

    // Company info
    const org = {
        name:
            company.companyName ||
            company.tradingName ||
            options.companyName ||
            "Our Company",
        logoUrl:
            options.logoUrl ||
            company.profileImage ||
            clientAdmin.profileImage ||
            "",
        email:
            options.supportEmail ||
            clientAdmin?.email ||
            company?.email ||
            "support@company.com",
        phone:
            options.supportPhone ||
            clientAdmin?.phone ||
            company?.contact ||
            "",
        address: options.address || company?.address || "",
        website: company.website || "",
    };

    const safe = (v) =>
        String(v ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    const journey = booking.returnJourney || booking.primaryJourney || {};
    const pickup = journey.pickup || "Not specified";
    const dropoff = journey.dropoff || "Not specified";
    const journeyDateTime = formatDateTime(journey);

    // Refund info
    const showRefund =
        booking.paymentStatus === "Paid" || booking.paymentMethod === "Card";
        const formatEmail = (email) => {
          return email.replace('@', '&#8203;@&#8203;').replace(/\./g, '&#8203;.&#8203;');
        };
        
        const locationLine = (addr) => {
          if (!addr) return "";
        
          const safeAddr = safe(String(addr).trim());
          const words = safeAddr.split(/\s+/);
        
          // Split into lines with 4 words per line
          const lines = [];
          for (let i = 0; i < words.length; i += 4) {
            lines.push(words.slice(i, i + 4).join(" "));
          }
        
          // Return HTML with "Location:" on the first line
          const [firstLine, ...restLines] = lines;
          const restHtml = restLines.length ? `<br/>${restLines.join("<br/>")}` : "";
        
          return `<strong>Location:</strong> ${firstLine}${restHtml}<br/>`;
        };
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Booking Cancelled - #${safe(booking.bookingId)}</title>
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
            <td style="padding:0;background:linear-gradient(90deg, ${brand.dangerBg}, #ffffff);border-bottom:1px solid ${brand.border}">
              <table width="100%" role="presentation" style="padding:18px 22px">
                <tr>
                  <td align="left" style="vertical-align:middle">
                    ${org.logoUrl
            ? `<img src="${safe(
                org.logoUrl
            )}" width="90" style="display:block;max-width:180px;height:auto" alt="${safe(
                org.name
            )}" />`
            : `<div style="font:800 18px/1 Arial,sans-serif;color:${brand.primary}">${safe(
                org.name
            )}</div>`
        }
                  </td>
                  <td align="right" style="vertical-align:middle">
                    <div style="margin-bottom:8px;text-align:right;">
                      <span style="
                        display:inline-block;
                        background:${brand.dangerBg};
                        color:${brand.danger};
                        font:700 12px/1 Arial,sans-serif;
                        padding:8px 16px;
                        border-radius:999px;
                        border:1px solid ${brand.danger}33;
                      ">
                        Cancelled
                      </span>
                    </div>
                    <div style="font:400 13px/2 Arial,sans-serif;color:${brand.muted}">
            
                    ${org.email ? `<strong>Email:</strong> ${formatEmail(safe(org.email))}<br/>` : ""}
                    
                      ${org.phone 
            ? `<strong>Phone:</strong> +${safe(org.phone)}<br/>`
            : ""
        }
        ${org.address ? locationLine(org.address) : ""}

                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Cancellation Message -->
          <tr>
            <td class="px-22" style="padding:24px 22px 18px;text-align:start">
              <div style="font:500 24px/1.3 Arial,sans-serif;color:${brand.primary};margin:0 0 10px">Your booking has been cancelled</div>
              <div style="font:600 16px/1.5 Arial,sans-serif;color:${brand.accent};margin:8px 0 0">Booking Reference: #${safe(
            booking.bookingId
        )}</div>
              <div style="font:400 14px/1.5 Arial,sans-serif;color:${brand.muted};margin-top:10px">
                Cancelled by ${safe(cancelledBy)}.
                ${cancellationReason
            ? `<br/><strong>Reason:</strong> ${safe(cancellationReason)}`
            : ""
        }
              </div>
            </td>
          </tr>

          <!-- Journey Summary -->
          <tr>
            <td class="px-22" style="padding:0 22px 18px;">
              <table role="presentation" width="100%" style="border:1px solid ${brand.border};border-radius:12px;padding:16px">
                <tr>
                  <td colspan="2" style="font:700 14px Arial,sans-serif;color:${brand.primary};padding-bottom:8px">Journey Details</td>
                </tr>
                <tr style="line-height:1.4;margin-bottom:6px;">
                  <td style="color:${brand.muted};vertical-align:top;font:600 13px Arial,sans-serif;margin-bottom:6px;"><div style="margin-bottom:10px;">From:</div></td>
                  <td style="color:${brand.primary};margin-bottom:6px;font:400 13px Arial,sans-serif"><div style="margin-bottom:10px;">${safe(pickup)}</div></td>
                </tr>
                <tr>
                  <td style="color:${brand.muted};vertical-align:top;font:600 13px Arial,sans-serif"><div style="margin-bottom:10px;">To:</div></td>
                  <td style="color:${brand.primary};font:400 13px Arial,sans-serif"><div style="margin-bottom:10px;">${safe(dropoff)}</div></td>
                </tr>
                <tr>
               
                  <td style="color:${brand.muted};vertical-align:top;font:600 13px Arial,sans-serif;white-space:nowrap;"> <div style="margin-bottom:10px;">Date & Time:</div></td>
                  <td style="color:${brand.primary};font:400 13px Arial,sans-serif"> <div style="margin-bottom:10px;">${safe(
            journeyDateTime
        )}</div></td>
        
                </tr>
              </table>
            </td>
          </tr>

          <!-- Refund Info -->
          ${showRefund
            ? `
          <tr>
            <td class="px-22" style="padding:0 22px 18px">
              <table role="presentation" width="100%" style="background:#FFF3CD;border:1px solid #FDE68A;border-radius:12px;padding:16px">
                <tr>
                  <td style="font:400 14px/1.6 Arial,sans-serif;color:#854D0E">
                    If you have made a payment for this booking, your refund will be processed within 5–7 business days to your original payment method.
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
            : ""
        }

          <!-- Contact Section -->
          <tr>
            <td class="px-22" style="padding:0 22px 18px">
              <table role="presentation" width="100%" style="background:${brand.bg};border:1px solid ${brand.border};border-radius:12px;padding:16px;text-align:center">
                <tr>
                  <td style="font:400 14px/1.6 Arial,sans-serif;color:${brand.primary}">
                    Need help or want to rebook?<br/>
                    <a href="mailto:${safe(
            org.email
        )}" style="color:${brand.accent};font-weight:600;text-decoration:none">Email Support</a>
                    ${org.phone
            ? `<br/><a href="tel:${safe(
                org.phone
            )}" style="color:${brand.accent};font-weight:600;text-decoration:none">Call +${safe(
                org.phone
            )}</a>`
            : ""
        }
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 24px;border-top:1px solid ${brand.border};background:#FAFAFA">
              <div style="font:700 16px/1.4 Arial,sans-serif;color:${brand.primary};margin-bottom:8px">${safe(
            org.name
        )}</div>
              ${org.website
            ? `<div style="margin-bottom:6px"><a href="${safe(
                org.website
            )}" style="color:${brand.accent};font-size:13px;text-decoration:none">${safe(
                org.website
            )}</a></div>`
            : ""
        }
              <div style="font:400 11px/1.5 Arial,sans-serif;color:#9CA3AF;margin-top:16px;padding-top:12px;border-top:1px solid ${brand.border}">
                This is an automated cancellation email. Please keep this for your records.
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
