import React from "react";
import socket from "@/services/socketService";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

const NotificationTest: React.FC = () => {
  const { user, socketConnected } = useAuth();

  const emitTestEvent = (eventType: string, data: any) => {
    if (!socket) {
      toast.error("Socket is not available");
      return;
    }

    // Send event to yourself (for testing)
    // In a real app, these events would come from the backend
    socket.emit(eventType, data);
    toast.success(`Test ${eventType} event emitted`);
  };

  if (!user) {
    return (
      <p className="text-center text-gray-500">
        Please log in to test notifications
      </p>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h2 className="text-lg font-medium mb-3">Test Notifications</h2>
      <p className="text-sm text-gray-600 mb-3">
        Socket status: {socketConnected ? "Connected" : "Disconnected"}
      </p>

      <div className="space-y-2">
        <button
          onClick={() =>
            emitTestEvent("note_created", { note: { title: "Test Note" } })
          }
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
          disabled={!socketConnected}
        >
          Test Note Created
        </button>

        <button
          onClick={() =>
            emitTestEvent("note_updated", { note: { title: "Updated Note" } })
          }
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 w-full"
          disabled={!socketConnected}
        >
          Test Note Updated
        </button>

        <button
          onClick={() =>
            emitTestEvent("note_deleted", { noteId: "123", userId: user.id })
          }
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 w-full"
          disabled={!socketConnected}
        >
          Test Note Deleted
        </button>

        <button
          onClick={() => emitTestEvent("user_updated", { name: user.name })}
          className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 w-full"
          disabled={!socketConnected}
        >
          Test Profile Updated
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Note: In a production app, these events would be emitted by the server.
      </p>
    </div>
  );
};

export default NotificationTest;
