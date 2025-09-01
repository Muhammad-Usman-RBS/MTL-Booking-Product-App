// import nodemailer from "nodemailer";

// const generateHtmlTable = (title, subtitle, dataObj) => {
//   const renderRows = (obj, prefix = "" , depth=0) => {
//     if (depth > 5) return ""; 

//     return Object.entries(obj)
//       .map(([key, value]) => {
//         const label = key
//           .replace(/([A-Z])/g, " $1")
//           .replace(/^./, (str) => str.toUpperCase());

//         if (
//           typeof value === "object" &&
//           value !== null &&
//           !Array.isArray(value)
//         ) {
//           return `
//           <tr><td colspan="2"><strong>${label} Details</strong></td></tr>
//           ${renderRows(value, prefix + key + ".")}
//         `;
//         } else {
//           return `
//           <tr>
//             <td><strong>${label}</strong></td>
//             <td>${value !== undefined && value !== null ? value : "Not Provided"}</td>
//           </tr>
//         `;
//         }
//       })
//       .join("");
//   };

//   return `
//     <h2>${title}</h2>
//     <p>${subtitle}</p>
//     <table cellpadding="8" border="1" style="border-collapse: collapse; font-family: Arial; font-size: 14px;">
//       ${renderRows(dataObj)}
//     </table>
//   `;
// };

// const sendEmail = async (to, subject, { title, subtitle = "", data = {} }) => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.GMAIL_USER,
//       pass: process.env.GMAIL_PASS,
//     },
//   });

//   const html = generateHtmlTable(title, subtitle, data);

//   await transporter.sendMail({
//     from: `"MTL Booking <${process.env.GMAIL_USER}>"`,
//     to,
//     subject,
//     html,
//   });
// };

// export default sendEmail;








// import nodemailer from "nodemailer";

// /** Make a Mongoose doc / subdoc safe for rendering */
// function toPlain(obj) {
//   if (!obj) return obj;
//   if (typeof obj?.toObject === "function") {
//     return obj.toObject({ depopulate: true, getters: false, virtuals: false, flattenMaps: true });
//   }
//   // Fallback: JSON trick strips functions & non-serializable bits
//   try {
//     return JSON.parse(JSON.stringify(obj));
//   } catch {
//     return obj; // last resort
//   }
// }

// const MAX_DEPTH = 5;
// const MAX_ROWS  = 500; // safety cap to avoid massive emails

// const generateHtmlTable = (title, subtitle, dataObjRaw) => {
//   const dataObj = toPlain(dataObjRaw);
//   let rowCount = 0;

//   const escape = (v) =>
//     String(v)
//       .replace(/&/g, "&amp;")
//       .replace(/</g, "&lt;")
//       .replace(/>/g, "&gt;");

//   const fmtVal = (value) => {
//     if (value == null) return "Not Provided";
//     if (value instanceof Date) return value.toISOString();
//     if (Array.isArray(value)) return value.map((x) => (x == null ? "" : String(x))).join(", ");
//     if (typeof value === "object") return ""; // objects will be drilled into by recursion
//     return String(value);
//   };

//   const renderRows = (obj, prefix = "", depth = 0) => {
//     if (obj == null || typeof obj !== "object") return "";
//     if (depth > MAX_DEPTH) return "";
//     const entries = Object.entries(obj);

//     return entries
//       .map(([key, value]) => {
//         if (rowCount > MAX_ROWS) return "";

//         const label = key
//           .replace(/([A-Z])/g, " $1")
//           .replace(/^./, (str) => str.toUpperCase());

//         if (value && typeof value === "object" && !Array.isArray(value)) {
//           rowCount++;
//           const headerRow = `
//             <tr>
//               <td colspan="2"><strong>${escape(label)} Details</strong></td>
//             </tr>
//           `;
//           // IMPORTANT: increment depth
//           const child = renderRows(toPlain(value), `${prefix}${key}.`, depth + 1);
//           return `${headerRow}${child}`;
//         } else {
//           rowCount++;
//           return `
//             <tr>
//               <td><strong>${escape(label)}</strong></td>
//               <td>${escape(fmtVal(value))}</td>
//             </tr>
//           `;
//         }
//       })
//       .join("");
//   };

//   return `
//     <h2>${escape(title || "")}</h2>
//     <p>${escape(subtitle || "")}</p>
//     <table cellpadding="8" border="1" style="border-collapse: collapse; font-family: Arial; font-size: 14px;">
//       ${renderRows(dataObj)}
//     </table>
//   `;
// };

// const sendEmail = async (to, subject, { title, subtitle = "", data = {} }) => {
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 465,
//     secure: true,
//     auth: {
//       user: process.env.GMAIL_USER,
//       pass: process.env.GMAIL_PASS, // Use an App Password if 2FA is on
//     },
//   });

//   const html = generateHtmlTable(title, subtitle, toPlain(data));

//   try {
//     const info = await transporter.sendMail({
//       from: `"MTL Booking" <${process.env.GMAIL_USER}>`,
//       to,
//       subject,
//       html,
//     });
//   } catch (e) {
//     throw e;
//   }
  
// };

// export default sendEmail;






import nodemailer from "nodemailer";

/** Make a Mongoose doc / subdoc safe for rendering */
function toPlain(obj) {
  if (!obj) return obj;
  if (typeof obj?.toObject === "function") {
    return obj.toObject({ depopulate: true, getters: false, virtuals: false, flattenMaps: true });
  }
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return obj;
  }
}

const MAX_DEPTH = 6;
const MAX_ROWS  = 1000;

const escapeHtml = (v = "") =>
  String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

const generateHtmlTable = (title, subtitle, raw) => {
  const dataObj = toPlain(raw);
  let rowCount = 0;

  const fmtVal = (value) => {
    if (value == null) return "Not Provided";
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (typeof value === "string") return value;
    return "";
  };

  const renderArray = (arr, keyPath, depth) => {
    if (!Array.isArray(arr)) return "";
    return arr.map((item, idx) => {
      if (rowCount > MAX_ROWS) return "";
      if (item && typeof item === "object" && !Array.isArray(item)) {
        rowCount++;
        const header = `<tr><td colspan="2"><strong>${escapeHtml(keyPath)} [${idx+1}]</strong></td></tr>`;
        return header + renderRows(item, `${keyPath}[${idx}]`, depth + 1);
      }
      rowCount++;
      return `
        <tr>
          <td><strong>${escapeHtml(keyPath)} [${idx+1}]</strong></td>
          <td>${escapeHtml(fmtVal(item))}</td>
        </tr>
      `;
    }).join("");
  };

  const renderRows = (obj, keyPath = "", depth = 0) => {
    if (obj == null) return "";
    if (depth > MAX_DEPTH) return "";
    if (Array.isArray(obj)) return renderArray(obj, keyPath || "Items", depth);

    if (typeof obj !== "object") {
      rowCount++;
      return `
        <tr>
          <td><strong>${escapeHtml(keyPath || "Value")}</strong></td>
          <td>${escapeHtml(fmtVal(obj))}</td>
        </tr>
      `;
    }

    return Object.entries(obj).map(([key, value]) => {
      if (rowCount > MAX_ROWS) return "";

      const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase());

      const path = keyPath ? `${keyPath}.${key}` : key;

      if (Array.isArray(value)) {
        return renderArray(value, label, depth + 1);
      }

      if (value && typeof value === "object") {
        rowCount++;
        const headerRow = `<tr><td colspan="2"><strong>${escapeHtml(label)} Details</strong></td></tr>`;
        return headerRow + renderRows(toPlain(value), path, depth + 1);
      }

      rowCount++;
      return `
        <tr>
          <td><strong>${escapeHtml(label)}</strong></td>
          <td>${escapeHtml(fmtVal(value))}</td>
        </tr>
      `;
    }).join("");
  };

  const rows = renderRows(dataObj);
  const safeTitle = title || "Booking Details";
  const safeSubtitle = subtitle || "";

  return `
  <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:Arial,sans-serif;line-height:1.5;margin:0;padding:16px;background:#ffffff;color:#111">
      <h2 style="margin:0 0 6px">${escapeHtml(safeTitle)}</h2>
      ${safeSubtitle ? `<p style="margin:0 0 12px;color:#555">${escapeHtml(safeSubtitle)}</p>` : ""}
      <table cellpadding="8" border="1" style="border-collapse:collapse;font-size:14px;border-color:#e5e5e5;min-width:320px">
        ${rows || `<tr><td>No details provided.</td></tr>`}
      </table>
    </body>
  </html>
  `;
};

const renderTextFallback = (subject, title, subtitle, data = {}) => {
  const lines = [];
  if (title) lines.push(title);
  if (subtitle) lines.push(subtitle);
  try {
    lines.push(JSON.stringify(toPlain(data), null, 2));
  } catch {
    lines.push(String(data));
  }
  return [subject, "", ...lines].join("\n");
};

/**
 * Flexible sender:
 * - Prefer payload.html when provided
 * - Else build HTML from (title, subtitle, data)
 * - Always include a text fallback
 */
const sendEmail = async (to, subject, payload = {}) => {
  const { html, title, subtitle = "", data = {} } = payload || {};

  // Validate email format
  if (!to || !to.includes("@")) {
    console.error("Invalid email address:", to);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
  });

  // Build final HTML content
  const finalHtml = html
    ? (html.startsWith("<") ? html : `<!doctype html><html><body>${html}</body></html>`)
    : generateHtmlTable(title || subject, subtitle, data);

  // Plain-text alternative for email clients that can't render HTML
  const textAlt = renderTextFallback(subject, title || subject, subtitle, data);

  try {
    const info = await transporter.sendMail({
      from: `"MTL Booking" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: finalHtml,
      text: textAlt,
    });
    console.log(`Email sent to: ${to}, MessageId: ${info.messageId}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export default sendEmail;
