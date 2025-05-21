import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { BellIcon } from "@heroicons/react/24/outline";

const NotificationsIndicator: React.FC = () => {
  const { socketConnected } = useAuth();

  return (
    <div className="relative">
      <BellIcon
        className={`h-6 w-6 ${
          socketConnected ? "text-green-500" : "text-gray-400"
        }`}
      />
      {socketConnected && (
        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white" />
      )}
      <span className="sr-only">
        {socketConnected
          ? "Real-time notifications active"
          : "Notifications disconnected"}
      </span>
    </div>
  );
};

export default NotificationsIndicator;
