import validator from "deep-email-validator";

const EMAIL_MAX = 254;
const SIMPLE_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const SAFE_FREE_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "yahoo.com",
  "ymail.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
]);
function norm(email) {
  return String(email || "").trim().toLowerCase();
}
function makeErr(status, message, meta) {
  const e = new Error(message);
  e.status = status;
  if (meta) e.meta = meta;
  return e;
}
function reasonMessage(reason, validators) {
  const suggested = validators?.typo?.suggested;
  switch (reason) {
    case "regex":
      return { code: "invalid_format", msg: "The email format does not look correct." };
    case "typo":
      return {
        code: "typo",
        msg: suggested
          ? `Did you mean '${suggested}'?`
          : "There might be a typo in the email.",
      };
    case "disposable":
      return {
        code: "disposable",
        msg: "Invalid email address. Please use a valid email address.",
      };
    case "mx":
      return {
        code: "mx",
        msg: "MX records for this domain were not found. Please try another email.",
      };
    case "smtp":
      return {
        code: "smtp",
        msg: "Could not connect to the mail server. Please try another email.",
      };
    default:
      return { code: "undeliverable", msg: "The email may not be deliverable." };
  }
}

export async function validateDeliverableEmail(email) {
  const raw = norm(email);
  if (!raw) return { ok: false, reason: "empty" };
  if (raw.length > EMAIL_MAX || !SIMPLE_RE.test(raw)) {
    return { ok: false, reason: "invalid_format" };
  }
  const domain = raw.split("@")[1];
  const sender = process.env.SMTP_SENDER || process.env.GMAIL_USER || undefined;
  const WANT_SMTP =
    (process.env.EMAIL_SMTP_CHECK ?? "true").toLowerCase() === "true";
  async function runValidate({ validateSMTP }) {
    return validator.validate({
      email: raw,
      sender,
      validateRegex: true,
      validateMx: true,
      validateTypo: true,
      validateDisposable: true,
      validateSMTP,
    });
  }
  try {
    const res = await runValidate({ validateSMTP: WANT_SMTP });
    if (
      !res.valid &&
      SAFE_FREE_DOMAINS.has(domain) &&
      (res.reason === "disposable" || res.reason === "smtp")
    ) {
      return { ok: true, note: "Allowlisted common provider" };
    }
    if (res.valid) return { ok: true };
    const smtpReason = res?.validators?.smtp?.reason || "";
    const mxValid = !!res?.validators?.mx?.valid;
    if (
      WANT_SMTP &&
      res.reason === "smtp" &&
      mxValid &&
      /timeout|greylist|connection|tls|refused/i.test(smtpReason || "")
    ) {
      return { ok: true, note: "SMTP uncertain; MX valid" };
    }
    const res2 = await runValidate({ validateSMTP: false });
    if (res2.valid) return { ok: true, note: "SMTP skipped; MX valid" };
    return {
      ok: false,
      reason: res2.reason || res.reason || "undeliverable",
      details: res2.validators || res.validators || {},
    };
  } catch {
    try {
      const res3 = await runValidate({ validateSMTP: false });
      return res3.valid
        ? { ok: true, note: "Validator fallback: MX valid" }
        : {
          ok: false,
          reason: res3.reason || "undeliverable",
          details: res3.validators || {},
        };
    } catch {
      return { ok: false, reason: "validator_error" };
    }
  }
}

export async function ensureDeliverableEmailOrThrow(email) {
  const result = await validateDeliverableEmail(email);
  if (result.ok) return true;
  const details = result.details || {};
  const { code, msg } = reasonMessage(result.reason, details);
  const finalMsg =
    code === "invalid_format"
      ? "Please enter a valid email address."
      : "Invalid email address. Please use a valid, reachable email.";
  const err = makeErr(400, code === "invalid_format" ? finalMsg : msg || finalMsg, {
    ok: false,
    reason: result.reason,
    details,
  });
  throw err;
}