import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GGMAIL_USER,         // Your Gmail
      pass: process.env.GGMAIL_PASS,         // App password from Gmail
    },
  });

  await transporter.sendMail({
    from: `"MTL Booking" <${process.env.GGMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;
