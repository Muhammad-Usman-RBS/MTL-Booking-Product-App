import { io } from "socket.io-client";

let socket;
let currentEmpKey = null;
let currentCompanyId = null;
function apiBaseToSocketOrigin(apiBase) {
    const u = (apiBase || "http://localhost:5000").replace(/\/+$/, "");
    return u.endsWith("/api") ? u.slice(0, -4) : u;
}

export function initSocket({ apiBase, employeeNumber, companyId, token }) {
    const origin = apiBaseToSocketOrigin(apiBase);
    const empKey = String(employeeNumber || "");
    const coKey = String(companyId || "");
    
    const keyChanged = currentEmpKey !== empKey || currentCompanyId !== coKey;
    if (socket?.connected && !keyChanged) return socket;
    if (socket?.connected && keyChanged) {
      try { socket.disconnect(); } catch {}
      socket = null;
    }
    socket = io(origin, {
        path: "/socket.io",
        transports: ["websocket"],
        withCredentials: true,
        query: {
          employeeNumber: empKey,   // admin = _id, driver = employeeNumber
          companyId: coKey,
        },
        auth: token ? { token } : undefined,
        reconnection: true,
      });
    
      currentEmpKey = empKey;
      currentCompanyId = coKey;
    
      socket.on("connect");
      socket.on("connect_error", (e) =>
        console.warn("[SOCKET] connect_error", e?.message)
      );
    
      return socket;
    }
    
    export function getSocket() {
      return socket;
    }
    