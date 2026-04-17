import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../components/DashboardLayout";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ScheduleCalendar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, assignRes] = await Promise.all([
          fetch(`${API}/auth/me`, { credentials: "include" }),
          fetch(`${API}/assignments?per_page=100`, { credentials: "include" }),
        ]);
        if (!userRes.ok) throw new Error();
        setUser(await userRes.json());
        if (assignRes.ok) {
          const data = await assignRes.json();
          setAssignments(data.items || data);
        }
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startingDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getAssignmentsForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return assignments.filter((a) => a.created_at?.startsWith(dateStr));
  };

  const monthName = currentDate.toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
    month: "long",
    year: "numeric",
  });

  const dayNames = isRTL
    ? ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const statusColors = {
    scheduled: "bg-blue-500",
    in_progress: "bg-yellow-500",
    completed: "bg-green-500",
    cancelled: "bg-red-400",
  };

  const sidebarItems = [
    {
      icon: CalendarIcon,
      label: t("schedule.title"),
      onClick: () => {},
      active: true,
    },
  ];

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const days = [];
  for (let i = 0; i < startingDay; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) days.push(d);

  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("schedule.title")}</h1>

        {/* Calendar Header */}
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-accent rounded-md"
            >
              {isRTL ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
            <h2 className="text-lg font-semibold">{monthName}</h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-accent rounded-md"
            >
              {isRTL ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-20"></div>;
              }

              const dayAssignments = getAssignmentsForDate(day);
              const isToday =
                day === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();

              return (
                <div
                  key={day}
                  className={`h-20 border rounded-md p-1 ${
                    isToday ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <span
                    className={`text-xs font-medium ${isToday ? "text-primary" : "text-foreground"}`}
                  >
                    {day}
                  </span>
                  <div className="space-y-0.5 mt-0.5">
                    {dayAssignments.slice(0, 2).map((a) => (
                      <button
                        key={a.assignment_id}
                        onClick={() =>
                          navigate(`/assignments/${a.assignment_id}`)
                        }
                        className={`w-full text-[10px] text-white rounded px-1 py-0.5 truncate text-start ${
                          statusColors[a.status] || "bg-gray-400"
                        }`}
                      >
                        {a.teacher_name ||
                          a.student_name ||
                          t("schedule.session")}
                      </button>
                    ))}
                    {dayAssignments.length > 2 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{dayAssignments.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-blue-500"></span>
            {t("schedule.scheduled")}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-yellow-500"></span>
            {t("schedule.inProgress")}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-green-500"></span>
            {t("schedule.completed")}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-400"></span>
            {t("schedule.cancelled")}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
