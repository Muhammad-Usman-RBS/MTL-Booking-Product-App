import sendEmail from "../../sendEmail.js";

function daysDiff(from, to = new Date()) {
    try {
        const a = new Date(from);
        const b = new Date(to);
        const ms = b - a;
        return Math.floor(ms / (1000 * 60 * 60 * 24));
    } catch {
        return null;
    }
}

function normalizeDocs(expiredDocsRaw = {}) {
    const out = {};
    for (const [docKey, value] of Object.entries(expiredDocsRaw || {})) {
        const label = docKey
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (s) => s.toUpperCase());

        const expiresOn = value?.expiresOn || value?.expiry || value?.expireDate || value?.date;
        const status = value?.status || "expired";
        const daysOverdue = expiresOn ? daysDiff(expiresOn) : null;

        out[label] = {
            Status: status,
            "Expired On": expiresOn ? new Date(expiresOn).toISOString().split("T")[0] : "Not Provided",
            "Days Overdue": daysOverdue != null ? String(daysOverdue) : "Not Provided",
        };
    }
    return out;
}

export async function sendDriverDocsExpiryEmail({
    to,
    driverName,
    expiredDocs,
    companyName = "Mega Transfers",
    actionUrl,             // optional CTA link to upload/renew
    supportEmail,          // optional support contact
}) {
    if (!to) throw new Error("Recipient email (to) is required");

    const subject =
        `${companyName}: ` +
        `${driverName ? `${driverName} – ` : ""}` +
        `Document Expiry Alert`;

    const title = `Documents expired${driverName ? ` for ${driverName}` : ""}`;
    let subtitle = "Please renew the following documents at your earliest.";

    if (actionUrl) {
        subtitle += ` Visit your portal: ${actionUrl}`;
    }
    if (supportEmail) {
        subtitle += ` | Need help? ${supportEmail}`;
    }

    // shape data so your existing generateHtmlTable renders a clean nested table
    const data = normalizeDocs(expiredDocs);

    return sendEmail(to, subject, { title, subtitle, data });
}

export default sendDriverDocsExpiryEmail;
