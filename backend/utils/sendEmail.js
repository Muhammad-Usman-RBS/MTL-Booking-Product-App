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








import nodemailer from "nodemailer";

/** Make a Mongoose doc / subdoc safe for rendering */
function toPlain(obj) {
  if (!obj) return obj;
  if (typeof obj?.toObject === "function") {
    return obj.toObject({ depopulate: true, getters: false, virtuals: false, flattenMaps: true });
  }
  // Fallback: JSON trick strips functions & non-serializable bits
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return obj; // last resort
  }
}

const MAX_DEPTH = 5;
const MAX_ROWS  = 500; // safety cap to avoid massive emails

const generateHtmlTable = (title, subtitle, dataObjRaw) => {
  const dataObj = toPlain(dataObjRaw);
  let rowCount = 0;

  const escape = (v) =>
    String(v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const fmtVal = (value) => {
    if (value == null) return "Not Provided";
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return value.map((x) => (x == null ? "" : String(x))).join(", ");
    if (typeof value === "object") return ""; // objects will be drilled into by recursion
    return String(value);
  };

  const renderRows = (obj, prefix = "", depth = 0) => {
    if (obj == null || typeof obj !== "object") return "";
    if (depth > MAX_DEPTH) return "";
    const entries = Object.entries(obj);

    return entries
      .map(([key, value]) => {
        if (rowCount > MAX_ROWS) return "";

        const label = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());

        if (value && typeof value === "object" && !Array.isArray(value)) {
          rowCount++;
          const headerRow = `
            <tr>
              <td colspan="2"><strong>${escape(label)} Details</strong></td>
            </tr>
          `;
          // IMPORTANT: increment depth
          const child = renderRows(toPlain(value), `${prefix}${key}.`, depth + 1);
          return `${headerRow}${child}`;
        } else {
          rowCount++;
          return `
            <tr>
              <td><strong>${escape(label)}</strong></td>
              <td>${escape(fmtVal(value))}</td>
            </tr>
          `;
        }
      })
      .join("");
  };

  return `
    <h2>${escape(title || "")}</h2>
    <p>${escape(subtitle || "")}</p>
    <table cellpadding="8" border="1" style="border-collapse: collapse; font-family: Arial; font-size: 14px;">
      ${renderRows(dataObj)}
    </table>
  `;
};

const sendEmail = async (to, subject, { title, subtitle = "", data = {} }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS, // Use an App Password if 2FA is on
    },
  });

  const html = generateHtmlTable(title, subtitle, toPlain(data));

  try {
    const info = await transporter.sendMail({
      from: `"MTL Booking" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (e) {
    throw e;
  }
  
};

export default sendEmail;
