import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  User as UserIcon,
  MapPin,
  BookOpen,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../components/DashboardLayout";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function TeacherVerification() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, teachersRes] = await Promise.all([
          fetch(`${API}/auth/me`, { credentials: "include" }),
          fetch(`${API}/teachers/pending`, { credentials: "include" }),
        ]);
        if (!userRes.ok) throw new Error();
        setUser(await userRes.json());
        if (teachersRes.ok) setTeachers(await teachersRes.json());
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleVerify = async (teacherId, status) => {
    setProcessing(teacherId);
    try {
      const res = await fetch(
        `${API}/teachers/${teacherId}/verify?status=${status}`,
        {
          method: "PUT",
          credentials: "include",
        },
      );
      if (res.ok) {
        setTeachers((prev) => prev.filter((t) => t.teacher_id !== teacherId));
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setProcessing(null);
    }
  };

  const sidebarItems = [
    {
      icon: ShieldCheck,
      label: t("verification.title"),
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

  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("verification.title")}</h1>
        <p className="text-muted-foreground">{t("verification.description")}</p>

        {teachers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShieldCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t("verification.noPending")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {teachers.map((teacher) => (
              <div
                key={teacher.teacher_id}
                className="bg-card border rounded-lg p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="bg-primary/10 rounded-full p-2">
                      <UserIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">
                        {teacher.name || teacher.user_id}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {teacher.email}
                      </p>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{teacher.specialization}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{teacher.cities?.join(", ")}</span>
                        </div>
                        <p className="text-muted-foreground">
                          {t("verification.grades")}:{" "}
                          {teacher.grades?.join(", ")}
                        </p>
                        {teacher.bio && (
                          <p className="text-muted-foreground italic">
                            "{teacher.bio}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() =>
                        handleVerify(teacher.teacher_id, "verified")
                      }
                      disabled={processing === teacher.teacher_id}
                      className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {t("verification.approve")}
                    </button>
                    <button
                      onClick={() =>
                        handleVerify(teacher.teacher_id, "rejected")
                      }
                      disabled={processing === teacher.teacher_id}
                      className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      {t("verification.reject")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
