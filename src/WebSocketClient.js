// import { io } from "socket.io-client";

// const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:8080";

// // Establish WebSocket connection
// const socket = io(SERVER_URL, {
//   path: "/socket.io", // ✅ Ensures correct Socket.io path
//   transports: ["websocket", "polling"], // ✅ WebSocket + polling fallback
//   withCredentials: true, // ✅ Allows cross-origin cookies & auth
//   reconnection: true,
//   reconnectionAttempts: 5, // ✅ Retry up to 5 times
//   reconnectionDelay: 3000, // ✅ Delay between retries
// });

// socket.on("connect", () => {
//   console.log("✅ WebSocket Connected:", socket.id);
// });

// socket.on("disconnect", () => {
//   console.warn("❌ WebSocket Disconnected. Attempting to reconnect...");
// });

// export default socket;
