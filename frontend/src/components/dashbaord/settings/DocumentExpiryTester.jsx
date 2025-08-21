// import React, { useMemo, useState } from "react";
// import { useSelector } from "react-redux";
// import { useToggleCronJobFeatureMutation, useGetCronJobQuery } from "../../../redux/api/cronJobsApi";

// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
// const TZ_LABEL = "UTC"; 

// const styles = {
//   btn: { background: "#333", color: "white", padding: "8px 12px", borderRadius: 6, border: "none", cursor: "pointer" },
//   btnGreen: { background: "green", color: "white", padding: "8px 12px", borderRadius: 6, border: "none", cursor: "pointer" },
//   btnRed: { background: "red", color: "white", padding: "8px 12px", borderRadius: 6, border: "none", cursor: "pointer" },
//   btnBlue: { background: "#0d6efd", color: "white", padding: "8px 12px", borderRadius: 6, border: "none", cursor: "pointer" },
//   modalBackdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 },
//   modal: { width: "min(1000px, 96vw)", maxHeight: "88vh", background: "#fff", borderRadius: 10, boxShadow: "0 10px 30px rgba(0,0,0,0.2)", overflow: "hidden", display: "flex", flexDirection: "column" },
//   modalHeader: { padding: "12px 16px", background: "#111827", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" },
//   modalBody: { padding: 16, overflow: "auto", background: "#f9fafb" },
//   table: { width: "100%", borderCollapse: "collapse", background: "#fff" },
//   th: { textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, background: "#f3f4f6", zIndex: 1 },
//   td: { padding: "10px 12px", borderBottom: "1px solid #f3f4f6", verticalAlign: "top" },
//   tag: { display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: 12, background: "#eef2ff", color: "#3730a3", marginRight: 6, marginBottom: 6 },
// };

// function apiURL(path) { return `${API_BASE.replace(/\/$/, "")}${path}`; }
// async function fetchJSON(input, init) {
//   const res = await fetch(input, init);
//   const text = await res.text();
//   let data; try { data = JSON.parse(text || "{}"); } catch { data = { raw: text }; }
//   if (!res.ok) throw new Error(`${data?.message || data?.error || res.statusText || "Request failed"} (HTTP ${res.status})`);
//   return data;
// }

// // Simple window check against UTC to give a hint in UI (backend is the source of truth)
// function isWithinWindow(rangeStr) {
//   const parts = (rangeStr || "").split(/–|-/);
//   if (parts.length < 2) return true;
//   const [a, b] = parts.map(s => s.trim());
//   const [sh, sm] = a.split(":").map(Number);
//   const [eh, em] = b.split(":").map(Number);
//   if (![sh, sm, eh, em].every(n => Number.isInteger(n))) return true;
//   const now = new Date();
//   const n = now.getUTCHours() * 60 + now.getUTCMinutes();
//   const s = sh * 60 + sm, e = eh * 60 + em;
//   if (e === s) return true;
//   return e > s ? (n >= s && n < e) : (n >= s || n < e);
// }

// const DocumentExpiryTester = () => {
//   const companyId = useSelector((s) => s.auth?.user?.companyId);
//   const userId = useSelector((s) => s.auth?.user?._id);

//   const { data: cron, isFetching: cronLoading } = useGetCronJobQuery(companyId, { skip: !companyId });
//   const dailyTime = cron?.cronJob?.driverDocumentsExpiration?.timing?.dailyTime || "-";
//   const insideWindow = isWithinWindow(dailyTime);

//   const [toggleCronJob, { isLoading: isToggling }] = useToggleCronJobFeatureMutation();

//   const [report, setReport] = useState(null);
//   const [rawJson, setRawJson] = useState("");
//   const [open, setOpen] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const drivers = useMemo(() => {
//     const list = report?.drivers || report?.result?.drivers || [];
//     return Array.isArray(list) ? list : [];
//   }, [report]);

//   const ensureCompany = () => {
//     if (!companyId) { alert("Missing companyId in auth state."); return false; }
//     return true;
//   };

//   const handleToggle = async (enabled) => {
//     if (!ensureCompany()) return;
//     try {
//       await toggleCronJob({ companyId, feature: "driverDocumentsExpiration", enabled, updatedBy: userId }).unwrap();
//       alert(`Expiry emails ${enabled ? "enabled" : "disabled"} successfully.`);
//     } catch (err) {
//       console.error(err);
//       alert("Failed: " + (err?.data?.message || err?.error || err?.message || "Unknown error"));
//     }
//   };

//   const handleDryRun = async () => {
//     if (!ensureCompany()) return;
//     try {
//       setLoading(true);
//       const qs = new URLSearchParams({ companyId, report: "true", dryRun: "true" });
//       const json = await fetchJSON(apiURL(`/api/cron-debug/driver-docs/run?${qs.toString()}`), { credentials: "include" });
//       const payload = json?.result || json;
//       setReport(payload);
//       setRawJson(JSON.stringify(json, null, 2));
//       setOpen(true);
//     } catch (e) {
//       alert("Dry-run failed: " + String(e.message || e));
//     } finally { setLoading(false); }
//   };

//   // Respect window (ignoreWindow=false)
//   const handleRunNow = async (force = true) => {
//     if (!ensureCompany()) return;
//     try {
//       setLoading(true);
//       const json = await fetchJSON(apiURL("/api/cron-debug/driver-docs/run-now"), {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ companyId, report: true, force, ignoreWindow: false }),
//       });
//       const payload = json?.result || json;
//       setReport(payload);
//       setRawJson(JSON.stringify(json, null, 2));
//       setOpen(true);
//       alert("Executed now. Emails sent where applicable.");
//     } catch (e) {
//       alert("Run-now failed: " + String(e.message || e));
//     } finally { setLoading(false); }
//   };

//   // Admin override: ignore window (for emergency backfill)
//   const handleRunNowOverride = async () => {
//     if (!ensureCompany()) return;
//     try {
//       setLoading(true);
//       const json = await fetchJSON(apiURL("/api/cron-debug/driver-docs/run-now"), {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ companyId, report: true, force: true, ignoreWindow: true }),
//       });
//       const payload = json?.result || json;
//       setReport(payload);
//       setRawJson(JSON.stringify(json, null, 2));
//       setOpen(true);
//       alert("Executed (window override).");
//     } catch (e) {
//       alert("Run-now (override) failed: " + String(e.message || e));
//     } finally { setLoading(false); }
//   };

//   const handleEnableAndSendNow = async () => {
//     if (!ensureCompany()) return;
//     try {
//       setLoading(true);
//       await toggleCronJob({ companyId, feature: "driverDocumentsExpiration", enabled: true, updatedBy: userId }).unwrap();
//       const json = await fetchJSON(apiURL("/api/cron-debug/driver-docs/run-now"), {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ companyId, report: true, force: true, ignoreWindow: false }),
//       });
//       const payload = json?.result || json;
//       setReport(payload);
//       setRawJson(JSON.stringify(json, null, 2));
//       setOpen(true);
//       alert("Enabled and executed. Emails sent where applicable.");
//     } catch (err) {
//       console.error(err);
//       alert("Enable & Send Now failed: " + (err?.data?.message || err?.error || err?.message || "Unknown error"));
//     } finally { setLoading(false); }
//   };

//   return (
//     <div>
//       <h3>Document Expiry Cron Controls</h3>
//       <p>Company: {companyId || "-"}</p>

//       {/* Window info */}
//       <p style={{ margin: "6px 0", opacity: 0.9 }}>
//         Window: <strong>{cronLoading ? "…" : dailyTime}</strong> (TZ: {TZ_LABEL}) •{" "}
//         <span style={{ color: insideWindow ? "green" : "crimson" }}>
//           {insideWindow ? "Inside window" : "Outside window"}
//         </span>
//       </p>

//       <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
//         <button onClick={() => handleToggle(true)} disabled={isToggling || loading} style={styles.btnGreen}>
//           Enable Expiry Emails
//         </button>

//         <button onClick={() => handleToggle(false)} disabled={isToggling || loading} style={styles.btnRed}>
//           Disable Expiry Emails
//         </button>

//         <button onClick={handleEnableAndSendNow} disabled={isToggling || loading} style={styles.btnBlue}>
//           Enable &amp; Send Now
//         </button>

//         <button onClick={() => handleRunNow(true)} disabled={loading} style={styles.btn}>
//           Send Now (Respect Window)
//         </button>

//         <button onClick={handleRunNowOverride} disabled={loading} style={styles.btn}>
//           Send Now (Override Window)
//         </button>

//         <button onClick={handleDryRun} disabled={loading} style={styles.btn}>
//           {loading ? "Testing..." : "Test Run (Dry-Run)"}
//         </button>
//       </div>

//       {/* Modal */}
//       {open && (
//         <div style={styles.modalBackdrop} onClick={() => setOpen(false)}>
//           <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
//             <div style={styles.modalHeader}>
//               <div>
//                 <strong>Driver Documents Report</strong>
//                 <div style={{ fontSize: 12, opacity: 0.8 }}>
//                   Candidates: {report?.candidates ?? drivers.length} • Emails sent: {report?.emailsSent ?? 0}
//                 </div>
//                 <div style={{ fontSize: 12, opacity: 0.7 }}>
//                   Window: {dailyTime} ({TZ_LABEL})
//                   {report?.note === "outside_window" && (
//                     <span style={{ color: "crimson", marginLeft: 8 }}>
//                       Skipped (outside window)
//                     </span>
//                   )}
//                 </div>
//                 {report?.startedAt && (
//                   <div style={{ fontSize: 12, opacity: 0.7 }}>
//                     Started: {report.startedAt} {report.finishedAt ? `• Finished: ${report.finishedAt}` : ""}
//                   </div>
//                 )}
//               </div>
//               <div>
//                 <button
//                   onClick={async () => {
//                     try { await navigator.clipboard.writeText(rawJson || ""); alert("Copied!"); }
//                     catch { alert("Copy failed"); }
//                   }}
//                   style={{ ...styles.btn, marginRight: 8 }}
//                 >
//                   Copy JSON
//                 </button>
//                 <button onClick={() => setOpen(false)} style={styles.btnRed}>Close</button>
//               </div>
//             </div>

//             <div style={styles.modalBody}>
//               {drivers.length === 0 ? (
//                 <div>No drivers with expired documents.</div>
//               ) : (
//                 <table style={styles.table}>
//                   <thead>
//                     <tr>
//                       <th style={styles.th}>Emp #</th>
//                       <th style={styles.th}>Name</th>
//                       <th style={styles.th}>Email</th>
//                       <th style={styles.th}>Expired Docs</th>
//                       <th style={styles.th}>Email Sent</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {drivers.map((d, i) => (
//                       <tr key={i}>
//                         <td style={styles.td}>{d.employeeNumber || "-"}</td>
//                         <td style={styles.td}>{d.name || "-"}</td>
//                         <td style={styles.td}>{d.email || "-"}</td>
//                         <td style={styles.td}>
//                           {(d.expiredDocs || []).length === 0
//                             ? <span style={{ opacity: 0.6 }}>None</span>
//                             : (d.expiredDocs || []).map((k, idx) => (
//                                 <span key={idx} style={styles.tag}>{k}</span>
//                               ))}
//                         </td>
//                         <td style={styles.td}>{String(d.emailSent ?? "null")}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               )}

//               <div style={{ marginTop: 16 }}>
//                 <details>
//                   <summary style={{ cursor: "pointer" }}>Show Raw JSON</summary>
//                   <pre style={{ background: "#111827", color: "#e5e7eb", padding: 12, borderRadius: 8, overflow: "auto" }}>
//                     {rawJson}
//                   </pre>
//                 </details>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DocumentExpiryTester;



















import React from "react";
import { useSelector } from "react-redux";
import { 
  useToggleCronJobFeatureMutation, 
  useGetCronJobQuery,
  useRunDriverDocsNowMutation,       // ✅ new hook
} from "../../../redux/api/cronJobsApi";

const styles = {
  btnBlue: { 
    background: "#0d6efd", 
    color: "white", 
    padding: "8px 12px", 
    borderRadius: 6, 
    border: "none", 
    cursor: "pointer" 
  },
};

function isWithinTimeWindow(timeRange) {
  if (!timeRange || typeof timeRange !== "string") return false;
  const [start, end] = timeRange.split(/–|-/).map(t => t.trim());
  if (!start || !end) return false;

  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if ([sh, sm, eh, em].some(isNaN)) return false;

  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const st = sh * 60 + sm;
  const en = eh * 60 + em;

  if (en > st) return cur >= st && cur < en;
  return cur >= st || cur < en; // crosses midnight
}

const DocumentExpiryTester = () => {
  const companyId = useSelector((s) => s.auth?.user?.companyId);
  const userId = useSelector((s) => s.auth?.user?._id);

  const { data: cronData } = useGetCronJobQuery(companyId, { skip: !companyId });
  const [toggleCronJob, { isLoading: isToggling }] = useToggleCronJobFeatureMutation();
  const [runNow, { isLoading: isRunning }] = useRunDriverDocsNowMutation(); // ✅

  const timeWindow = cronData?.cronJob?.driverDocumentsExpiration?.timing?.dailyTime;
  const isInWindow = isWithinTimeWindow(timeWindow);

  const handleEnableAndSendNow = async () => {
    if (!companyId) return alert("Company ID missing");

    try {
      await toggleCronJob({
        companyId,
        feature: "driverDocumentsExpiration",
        enabled: true,
        updatedBy: userId,
      }).unwrap();

      const response = await runNow({ companyId, sendEmails: true }).unwrap();
      alert(`Success! Emails sent: ${response.emailsSent || 0}, Total candidates: ${response.totalCandidates || 0}`);
    } catch (err) {
      console.error(err);
      alert("Failed: " + (err?.data?.message || err?.error || err?.message || "Unknown error"));
    }
  };

  return (
    <div>
      <h3>Document Expiry Email Sender</h3>
      <p>Company: {companyId || "-"}</p>
      <p>Time Window: {timeWindow || "Not configured"}</p>
      <p style={{ color: isInWindow ? "green" : "red" }}>
        Status: {isInWindow ? "Within allowed time window" : "Outside time window"}
      </p>

      <button
        onClick={handleEnableAndSendNow}
        disabled={isToggling || isRunning}
        style={styles.btnBlue}
      >
        {isToggling || isRunning ? "Working..." : "Enable & Send Expiry Emails"}
      </button>
    </div>
  );
};

export default DocumentExpiryTester;
