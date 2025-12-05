import { Server as IOServer } from "socket.io";
import { Server } from "http";
import environments from "./app/configurations/environments";
import jwt from "jsonwebtoken";
import { JWTCredentialProps } from "./app/types/utils.types";

export const initSocket = (server: Server) => {
  const io = new IOServer(server, {
    cors: {
      origin: environments.frontend_base_url || "*",
      methods: ["GET", "POST"],
    },
  });

  // auth middleware (expect token in query or Authorization header)
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        socket.handshake.headers["authorization"];
      if (!token) return next(new Error("Unauthorized"));

      const { credentialId, role } = jwt.verify(
        token as string,
        environments.jwt.access_secret
      ) as JWTCredentialProps;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (socket as any).user = { id: credentialId, role };
      return next();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (socket as any).user;
    if (!user) {
      socket.disconnect(true);
      return;
    }

    // join user room
    const room = `user:${user.id}`;
    socket.join(room);

    // optionally join role-based rooms
    if (user.role) {
      socket.join(`role:${user.role}`);
    }

    // handle client send ack (optional)
    socket.on("ping", () => {
      socket.emit("pong", { ts: Date.now() });
    });

    socket.on("disconnect", () => {
      // cleanup if needed
    });
  });
};
