import nodemailer from "nodemailer";

function toPlain(obj) {
  if (!obj) return obj;
  if (typeof obj?.toObject === "function") {
    return obj.toObject({
      depopulate: true,
      getters: false,
      virtuals: false,
      flattenMaps: true,
    });
  }
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return obj;
  }
}

const MAX_DEPTH = 6;
const MAX_ROWS = 1000;

const escapeHtml = (v = "") =>
  String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const generateHtmlTable = (title, subtitle, raw) => {
  const dataObj = toPlain(raw);
  let rowCount = 0;

  const fmtVal = (value) => {
    if (value == null) return "Not Provided";
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "number" || typeof value === "boolean")
      return String(value);
    if (typeof value === "string") return value;
    return "";
  };

  const renderArray = (arr, keyPath, depth) => {
    if (!Array.isArray(arr)) return "";
    return arr
      .map((item, idx) => {
        if (rowCount > MAX_ROWS) return "";
        if (item && typeof item === "object" && !Array.isArray(item)) {
          rowCount++;
          const header = `<tr><td colspan="2"><strong>${escapeHtml(keyPath)} [${
            idx + 1
          }]</strong></td></tr>`;
          return header + renderRows(item, `${keyPath}[${idx}]`, depth + 1);
        }
        rowCount++;
        return `
        <tr>
          <td><strong>${escapeHtml(keyPath)} [${idx + 1}]</strong></td>
          <td>${escapeHtml(fmtVal(item))}</td>
        </tr>
      `;
      })
      .join("");
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

    return Object.entries(obj)
      .map(([key, value]) => {
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
          const headerRow = `<tr><td colspan="2"><strong>${escapeHtml(
            label
          )} Details</strong></td></tr>`;
          return headerRow + renderRows(toPlain(value), path, depth + 1);
        }

        rowCount++;
        return `
        <tr>
          <td><strong>${escapeHtml(label)}</strong></td>
          <td>${escapeHtml(fmtVal(value))}</td>
        </tr>
      `;
      })
      .join("");
  };

  const rows = renderRows(dataObj);
  const safeTitle = title || "Booking Details";
  const safeSubtitle = subtitle || "";

  return `
  <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:Arial,sans-serif;line-height:1.5;margin:0;padding:16px;background:#ffffff;color:#111">
      <h2 style="margin:0 0 6px">${escapeHtml(safeTitle)}</h2>
      ${
        safeSubtitle
          ? `<p style="margin:0 0 12px;color:#555">${escapeHtml(
              safeSubtitle
            )}</p>`
          : ""
      }
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

const sendEmail = async (to, subject, payload = {}) => {
  const { html, title, subtitle = "", data = {} } = payload || {};

  if (!to || !to.includes("@")) {
    console.error("Invalid email address:", to);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      // ciphers: "SSLv3",
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  const finalHtml = html
    ? html.startsWith("<")
      ? html
      : `<!doctype html><html><body>${html}</body></html>`
    : generateHtmlTable(title || subject, subtitle, data);

  const textAlt = renderTextFallback(subject, title || subject, subtitle, data);

  try {
    //    const info = await transporter.sendMail({
    //   from: `"MTL Booking" <${process.env.GMAIL_USER}>`,
    //   to,
    //   subject,
    //   html: finalHtml,
    //   text: textAlt,
    // });
    // console.log(`Email sent to: ${to}, MessageId: ${info.messageId}`);
    const info = await new Promise((resolve, reject) => {
      transporter.sendMail(
        {
          from: `"MTL Booking" <${process.env.GMAIL_USER}>`,
          to,
          subject,
          html: finalHtml,
          text: textAlt,
        },
        (err, info) => {
          if (err) {
            console.error("Error inside sendMail callback:", err);
            return reject(err);
          }
          resolve(info);
        }
      );
    });

    console.log(`Email sent to: ${to}, MessageId: ${info.messageId}`);
  } catch (error) {
    console.error("Error sending email:", error.message);
    console.error("Full error:", error); // Complete error log

    // Optional: Notify admin
    if (process.env.ADMIN_EMAIL) {
      console.log(`Failed to send email to ${to}`);
    }
  }
};

export default sendEmail;
