import { io } from "socket.io-client";

export const initializeSocketConnection = () => {
    const socket = io(
        import.meta.env.DEV
            ? "http://localhost:3000"
            : window.location.origin,
        {
            withCredentials: true,
        }
    );

    socket.on("connect", () => {
        console.log("Connected to Socket.IO server");
    });

    return socket;
};