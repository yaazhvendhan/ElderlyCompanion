import { useState, useCallback } from "react";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" ? Notification.permission : "default"
  );

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return false;
    }

    if (permission === "granted") {
      return true;
    }

    if (permission === "denied") {
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  }, [permission]);

  const showNotification = useCallback(
    (title: string, body: string, onClick?: () => void) => {
      if (permission !== "granted") {
        return;
      }

      const notification = new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "elderly-assistant",
        requireInteraction: true,
      });

      if (onClick) {
        notification.onclick = () => {
          window.focus();
          onClick();
          notification.close();
        };
      }

      // Auto close after 30 seconds
      setTimeout(() => {
        notification.close();
      }, 30000);
    },
    [permission]
  );

  return {
    permission,
    requestPermission,
    showNotification,
  };
}
