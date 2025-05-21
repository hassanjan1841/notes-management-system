import React, { useState, useEffect, useRef } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { initializeSocket } from "@/services/socketService";
import { Socket } from "socket.io-client";

// Notification type definition
interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: "note_created" | "note_updated" | "note_deleted" | "user_updated";
}

const NotificationsDropdown: React.FC = () => {
  const { user, socketConnected } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to add a new notification
  const addNotification = (message: string, type: Notification["type"]) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      read: false,
      type,
    };

    setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]); // Keep max 10 notifications
  };

  // Initialize socket when user is authenticated
  useEffect(() => {
    if (!user) return;

    const socket = initializeSocket(user.id);
    setSocketInstance(socket);

    // For demo - add a test notification after component mounts
    setTimeout(() => {
      addNotification("Welcome to the Notes App!", "user_updated");
    }, 1000);
  }, [user]);

  // Set up socket listeners for notifications
  useEffect(() => {
    if (!socketInstance) return;

    // Set up listeners for note events with correct backend event names
    socketInstance.on("note_created", (data) => {
      const { note } = data;
      addNotification(`New note created: ${note.title}`, "note_created");
    });

    socketInstance.on("note_updated", (data) => {
      const { note } = data;
      addNotification(`Note updated: ${note.title}`, "note_updated");
    });

    socketInstance.on("note_deleted", (data) => {
      const { noteId } = data;
      addNotification(`Note deleted`, "note_deleted");
    });

    socketInstance.on("user_updated", (data) => {
      const { name } = data;
      addNotification(`Profile updated: ${name}`, "user_updated");
    });

    return () => {
      // Clean up listeners when component unmounts
      socketInstance.off("note_created");
      socketInstance.off("note_updated");
      socketInstance.off("note_deleted");
      socketInstance.off("user_updated");
    };
  }, [socketInstance]);

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "note_created":
        return "📝";
      case "note_updated":
        return "✏️";
      case "note_deleted":
        return "🗑️";
      case "user_updated":
        return "👤";
      default:
        return "🔔";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1 rounded-full text-gray-400 hover:text-white focus:outline-none"
      >
        <BellIcon className="h-6 w-6" />
        {socketConnected && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50">
          <div className="rounded-md ring-1 ring-black ring-opacity-5">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-900">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="py-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-2 hover:bg-gray-50 transition cursor-pointer ${
                        !notification.read ? "bg-blue-50" : ""
                      }`}
                      onClick={() => {
                        // Mark this notification as read
                        setNotifications((prev) =>
                          prev.map((n) =>
                            n.id === notification.id ? { ...n, read: true } : n
                          )
                        );
                      }}
                    >
                      <div className="flex">
                        <span className="mr-2">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.timestamp.toLocaleTimeString()} ·{" "}
                            {notification.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No new notifications
                </div>
              )}
            </div>
            <div className="px-4 py-2 border-t border-gray-100 text-xs text-center text-gray-500">
              {socketConnected
                ? "Real-time notifications active"
                : "Notifications disconnected"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
