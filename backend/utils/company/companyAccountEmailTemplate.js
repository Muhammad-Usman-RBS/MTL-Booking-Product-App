export default function companyAccountEmailTemplate({ company = {}, options = {} }) {
    const brand = {
        primary: options.primaryColor || "#0F172A",   // Heading color
        accent: options.accentColor || "#2563EB",   // Links / chips
        muted: options.mutedColor || "#6B7280",   // Subtext
        bg: options.bgColor || "#F5F7FB",   // Page bg
        card: options.cardColor || "#FFFFFF",   // Card bg
        border: options.borderColor || "#E5E7EB",   // Borders
        chipBg: "#EEF2FF",
        chipTxt: "#1E40AF",
    };

    const baseUrl = (options.baseUrl || "").replace(/\/+$/, "");
    const absUrl = (u = "") => {
        if (!u) return "";
        if (/^https?:\/\//i.test(u)) return u;
        return `${baseUrl}/${String(u).replace(/^\/+/, "")}`;
    };

    const safe = (v = "") =>
        String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const zws = "&#8203;";
    const wrapEmail = (e = "") =>
        safe(String(e)).replace("@", `${zws}@${zws}`).replace(/\./g, `${zws}.${zws}`);

    const fmtPhone = (p) => {
        if (!p) return "N/A";
        const s = String(p);
        return s.startsWith("+") ? s : `+${s}`;
    };

    const fmtDate = (d) => {
        if (!d) return "N/A";
        try {
            const dt = new Date(d);
            return dt.toLocaleString("en-GB", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch { return safe(String(d)); }
    };

    const logoUrl =
        absUrl(company.profileImage) ||
        absUrl(options.logoUrl) || "";

    // —— Fields you want to show
    const fields = [
        { label: "Company ID", value: company._id },
        { label: "Company Name", value: company.companyName },
        { label: "Trading Name", value: company.tradingName },
        { label: "Owner Name", value: company.fullName },
        { label: "Company Email", value: company.email, isEmail: true },
        { label: "Phone", value: fmtPhone(company.contact) },
        { label: "Licensed By", value: company.licensedBy || "Not Provided" },
        { label: "License Number", value: company.licenseNumber ?? "N/A" },
        { label: "License Referrer Link", value: company.referrerLink, isLink: true },
        { label: "Cookie Consent", value: company.cookieConsent ?? "N/A" },
        { label: "Created At", value: fmtDate(company.createdAt) },
        { label: "Company Address", value: company.address },
    ];

    // Utility: chunk into rows of 2 cards (desktop), will stack on mobile
    const chunk = (arr, size = 2) => {
        const out = [];
        for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
        return out;
    };

    const card = ({ label, value, isLink, isEmail }) => {
        const val = (value === null || value === undefined || value === "")
            ? "N/A"
            : isLink
                ? `<a href="${safe(String(value))}" target="_blank" rel="noopener noreferrer" style="color:${brand.accent};text-decoration:none">${safe(String(value))}</a>`
                : isEmail
                    ? wrapEmail(String(value))
                    : safe(String(value));

        return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
             style="background:${brand.card};border:1px solid ${brand.border};border-radius:12px">
        <tr>
          <td style="padding:12px 14px">
            <div style="font:700 11px/1 Arial, sans-serif;color:${brand.muted};letter-spacing:.04em;text-transform:uppercase;margin-bottom:6px">
              ${safe(label)}
            </div>
<div style="font:400 14px/1.5 Arial, sans-serif;color:${brand.primary}">
              ${val}
            </div>
          </td>
        </tr>
      </table>
    `;
    };

    const rowsHtml = chunk(fields, 2).map((row) => {
        // exactly 2 columns; if single item, right col spacer
        const left = row[0] ? card(row[0]) : "";
        const right = row[1] ? card(row[1]) : "";

        return `
      <tr>
        <td class="col" width="50%" style="width:50%;padding:6px 6px 6px 0">${left}</td>
        <td class="col" width="50%" style="width:50%;padding:6px 0 6px 6px">${right}</td>
      </tr>
    `;
    }).join("");

    const headerChip = `
    <span style="display:inline-block;background:${brand.chipBg};color:${brand.chipTxt};
                 font:700 12px/1 Arial,sans-serif;padding:8px 14px;border-radius:999px;
                 border:1px solid ${brand.chipTxt}22;">
      Company Account
    </span>
  `;

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>Company Account Details</title>
  <style>
    /* Mobile stacking */
    @media (max-width:640px){
      .container{width:100% !important;padding:0 16px !important}
      .col{display:block !important;width:100% !important}
      .px{padding-left:16px !important;padding-right:16px !important}
      .logo img{max-width:84px !important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${brand.bg}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${brand.bg}">
    <tr>
      <td align="center" style="padding:28px 16px">
        <table role="presentation" width="680" cellpadding="0" cellspacing="0" border="0"
               class="container"
               style="width:680px;max-width:680px;background:${brand.card};border:1px solid ${brand.border};border-radius:18px;overflow:hidden">

          <!-- Header -->
          <tr>
            <td style="padding:0;border-bottom:1px solid ${brand.border};
                       background:linear-gradient(90deg, #F0F4FF, #FFFFFF)">
              <table width="100%" role="presentation" cellpadding="0" cellspacing="0" style="padding:18px 20px">
                <tr>
                  <td class="logo" align="left" style="vertical-align:middle">
                    ${logoUrl
            ? `<img src="${safe(logoUrl)}" width="96" style="display:block;height:auto;border-radius:12px;border:1px solid ${brand.border}" alt="${safe(company.companyName || "Company")}">`
            : `<div style="font:800 18px/1 Arial,sans-serif;color:${brand.primary}">${safe(company.companyName || "Company")}</div>`
        }
                  </td>
                  <td align="right" style="vertical-align:middle">
                    ${headerChip}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td class="px" style="padding:22px 22px 10px">
              <div style="font:700 22px/1.35 Arial, sans-serif;color:${brand.primary};margin:0 0 6px">
                Company Account Details
              </div>
              <div style="font:400 14px/1.65 Arial, sans-serif;color:${brand.muted}">
                Below are the complete details of your company account.
              </div>
            </td>
          </tr>

          <!-- Cards Grid (2 columns desktop, stacked on mobile) -->
          <tr>
            <td class="px" style="padding:8px 22px 24px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${rowsHtml}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
  <td style="padding:20px 24px;border-top:1px solid ${brand.border};background:#FAFAFA">
    <div style="font:700 16px/1.4 Arial,sans-serif;color:${brand.primary};margin-bottom:8px">
      ${safe(company.companyName || "Company")}
    </div>
    <div style="font:500 12px/1.4 Arial,sans-serif;color:${brand.muted};margin-bottom:8px">
      📍 ${company.address ? safe(company.address) : "Address not provided"}
    </div>
  </td>
</tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}