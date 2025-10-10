import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});
const sendReviewEmail = async (to, subject, payload = {}) => {
    let htmlBody = payload.html;
    if (!htmlBody && payload.text) {
        htmlBody = `<div style="font-family:Arial,Helvetica,sans-serif;white-space:pre-line">${payload.text}</div>`;
    }
    await transporter.sendMail({
        from: `"MTL Booking" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html: htmlBody || undefined,
        text: payload.text || undefined,
    });
};
export default sendReviewEmail;