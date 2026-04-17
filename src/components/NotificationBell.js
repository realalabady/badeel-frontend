import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bell, Check, CheckCheck } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function NotificationBell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API}/notifications`, {
        credentials: "include",
      });
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch {}
  };

  const markRead = async (id) => {
    try {
      await fetch(`${API}/notifications/${id}/read`, {
        method: "PUT",
        credentials: "include",
      });
      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === id ? { ...n, is_read: true } : n,
        ),
      );
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API}/notifications/read-all`, {
        method: "PUT",
        credentials: "include",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {}
  };

  const handleClick = (notif) => {
    if (!notif.is_read) markRead(notif.notification_id);
    if (notif.link) {
      navigate(notif.link);
      setOpen(false);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t("notifications.justNow");
    if (mins < 60) return `${mins} ${t("notifications.minutesAgo")}`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ${t("notifications.hoursAgo")}`;
    const days = Math.floor(hours / 24);
    return `${days} ${t("notifications.daysAgo")}`;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-accent rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full mt-2 end-0 w-80 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold text-sm">
              {t("notifications.title")}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3 h-3" />
                {t("notifications.markAllRead")}
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                {t("notifications.empty")}
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.notification_id}
                  onClick={() => handleClick(notif)}
                  className={`w-full text-start px-4 py-3 hover:bg-accent/50 transition-colors border-b last:border-b-0 ${
                    !notif.is_read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!notif.is_read && (
                      <span className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0"></span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${!notif.is_read ? "font-semibold" : ""}`}
                      >
                        {notif.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {notif.message}
                      </p>
                      <p className="text-[11px] text-muted-foreground/70 mt-1">
                        {timeAgo(notif.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
