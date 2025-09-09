import validator from "deep-email-validator";

/** ---------- Constants ---------- */
const EMAIL_MAX = 254;
const SIMPLE_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

// Common consumer providers that are occasionally misclassified as "disposable"
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

/** Normalize email safely */
function norm(email) {
  return String(email || "").trim().toLowerCase();
}

/** Build a friendly error object we can throw */
function makeErr(status, message, meta) {
  const e = new Error(message);
  e.status = status;
  if (meta) e.meta = meta;
  return e;
}

/** Map deep-email-validator reasons to concise codes/messages */
function reasonMessage(reason, validators) {
  const suggested = validators?.typo?.suggested;
  switch (reason) {
    case "regex":
      return { code: "invalid_format", msg: "Email format sahi nahin lag raha." };
    case "typo":
      return {
        code: "typo",
        msg: suggested
          ? `Kya aapka matlab '${suggested}' tha?`
          : "Email me typo ho sakta hai.",
      };
    case "disposable":
      return {
        code: "disposable",
        msg: "Yeh temporary/disposable email lagta hai. Kripya permanent email use karein.",
      };
    case "mx":
      return {
        code: "mx",
        msg: "Is domain ke MX records nahi milay. Kripya koi aur email try karein.",
      };
    case "smtp":
      return {
        code: "smtp",
        msg: "Mail server se connection nahi ho paya. Kripya doosri email try karein.",
      };
    default:
      return { code: "undeliverable", msg: "Email reach nahi ho payegi." };
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

  // Allow toggling SMTP checks (useful in local/dev or behind firewalls)
  const WANT_SMTP =
    (process.env.EMAIL_SMTP_CHECK ?? "true").toLowerCase() === "true";

  // Helper to call deep-email-validator correctly
  async function runValidate({ validateSMTP }) {
    return validator.validate({
      email: raw,
      sender,
      validateRegex: true,
      validateMx: true,
      validateTypo: true,
      validateDisposable: true,
      validateSMTP, // true or false
    });
  }

  // 1) Primary pass with SMTP (if enabled)
  try {
    const res = await runValidate({ validateSMTP: WANT_SMTP });

    // Hard-allow popular free domains when misclassified as disposable/smtp
    if (
      !res.valid &&
      SAFE_FREE_DOMAINS.has(domain) &&
      (res.reason === "disposable" || res.reason === "smtp")
    ) {
      return { ok: true, note: "Allowlisted common provider" };
    }

    if (res.valid) return { ok: true };

    // If only SMTP failed but MX is OK and the error looks transient → accept
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

    // 2) Fallback: try again without SMTP (network-safe)
    const res2 = await runValidate({ validateSMTP: false });
    if (res2.valid) return { ok: true, note: "SMTP skipped; MX valid" };

    // Still invalid → return structured failure
    return {
      ok: false,
      reason: res2.reason || res.reason || "undeliverable",
      details: res2.validators || res.validators || {},
    };
  } catch {
    // 3) If the first call itself threw (network hiccup), do an MX-only attempt
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

  // Friendlier message for plain format errors:
  const finalMsg =
    code === "invalid_format"
      ? "Please enter a valid email address."
      : "Invalid email address. Please use a valid, reachable email.";

  // Prefer specialized message if available
  const err = makeErr(400, code === "invalid_format" ? finalMsg : msg || finalMsg, {
    ok: false,
    reason: result.reason,
    details,
  });
  throw err;
}
