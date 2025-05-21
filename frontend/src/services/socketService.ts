import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

let socket: Socket | null = null;

export const initializeSocket = (userId: string) => {
  if (
    socket &&
    socket.connected &&
    socket.auth &&
    (socket.auth as any).userId === userId
  ) {
    return socket;
  }
  if (
    socket &&
    socket.connected &&
    socket.auth &&
    (socket.auth as any).userId !== userId
  ) {
    socket.disconnect();
    socket = null;
  }
  if (socket && !socket.connected) {
    socket.disconnect();
    socket = null;
  }

  const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

  socket = io(socketUrl);

  socket.on("connect", () => {
    console.log(
      `[SocketService] Socket connected successfully. Socket ID: ${socket?.id}, UserID: ${userId}`
    );
  });

  socket.on("disconnect", () => {
    console.log(`[SocketService] Socket disconnected. UserID: ${userId}`);
  });

  socket.on("error", (error) => {
    console.error(
      `[SocketService] Socket error occurred. Error: ${error}, UserID: ${userId}`
    );
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const useSocket = (userId: string | undefined) => {
  const [isConnected, setIsConnected] = useState(socket?.connected || false);

  useEffect(() => {
    if (!userId) {
      if (socket && socket.connected) disconnectSocket();
      setIsConnected(false);
      return;
    }

    const currentSocket = initializeSocket(userId);
    setIsConnected(currentSocket.connected);

    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onConnectError = () => {
      setIsConnected(false);
    };

    currentSocket.on("connect", onConnect);
    currentSocket.on("disconnect", onDisconnect);
    currentSocket.on("error", onConnectError);

    currentSocket.on("note_created", (data) => {
      const { note } = data;
      toast.success(`New note created: ${note.title}`);
    });

    currentSocket.on("note_updated", (data) => {
      const { note } = data;
      toast.success(`Note updated: ${note.title}`);
    });

    currentSocket.on("note_deleted", () => {
      toast.success(`Note deleted successfully`);
    });

    currentSocket.on("user_updated", (data) => {
      if (data && data.name) {
        toast.success(`Profile updated: ${data.name}`);
      } else {
        toast.success(`Profile updated successfully`);
      }
    });

    return () => {
      currentSocket.off("connect", onConnect);
      currentSocket.off("disconnect", onDisconnect);
      currentSocket.off("connect_error", onConnectError);
      currentSocket.off("note_created");
      currentSocket.off("note_updated");
      currentSocket.off("note_deleted");
      currentSocket.off("user_updated");
    };
  }, [userId]);

  return { isConnected, socketInstance: socket };
};
