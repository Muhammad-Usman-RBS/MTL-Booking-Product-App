import { io } from "socket.io-client";

let socket;

function apiBaseToSocketOrigin(apiBase) {
    const u = (apiBase || "http://localhost:5000").replace(/\/+$/, "");
    return u.endsWith("/api") ? u.slice(0, -4) : u;
}

export function initSocket({ apiBase, employeeNumber, companyId, token }) {
    const origin = apiBaseToSocketOrigin(apiBase);

    if (socket?.connected) return socket;

    socket = io(origin, {
        path: "/socket.io",
        transports: ["websocket"],
        withCredentials: true,
        query: {
            employeeNumber: String(employeeNumber || ""),
            companyId: String(companyId || ""),
        },
        auth: token ? { token } : undefined,
        reconnection: true,
    });

    socket.on("connect", () => console.log("[SOCKET] connected", socket.id));
    socket.on("connect_error", (e) => console.warn("[SOCKET] connect_error", e?.message));

    return socket;
}

export function getSocket() {
    return socket;
}
