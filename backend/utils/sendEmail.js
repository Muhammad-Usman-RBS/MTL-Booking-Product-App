import nodemailer from "nodemailer";

const generateHtmlTable = (title, subtitle, dataObj) => {
  const renderRows = (obj, prefix = "") => {
    return Object.entries(obj)
      .map(([key, value]) => {
        const label = (prefix + key)
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());

        if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          return `
          <tr><td colspan="2"><strong>${label}</strong></td></tr>
          ${renderRows(value, prefix + key + ".")}
        `;
        } else {
          return `
          <tr>
            <td><strong>${label}</strong></td>
            <td>${value !== undefined && value !== null ? value : "-"}</td>
          </tr>
        `;
        }
      })
      .join("");
  };

  return `
    <h2>${title}</h2>
    <p>${subtitle}</p>
    <table cellpadding="8" border="1" style="border-collapse: collapse; font-family: Arial; font-size: 14px;">
      ${renderRows(dataObj)}
    </table>
  `;
};

const sendEmail = async (to, subject, { title, subtitle = "", data = {} }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const html = generateHtmlTable(title, subtitle, data);

  await transporter.sendMail({
    from: "MTL Booking" `<${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;