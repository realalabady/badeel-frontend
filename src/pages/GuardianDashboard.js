import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChart,
  FileText,
  BookOpen,
  User,
  Users,
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle,
  Link2,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../components/DashboardLayout";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function GuardianDashboard() {
  const [user, setUser] = useState(null);
  const [childData, setChildData] = useState(null);
  const [linkStatus, setLinkStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        if (location.state?.user) {
          setUser(location.state.user);
        } else {
          const userRes = await fetch(`${API}/auth/me`, {
            credentials: "include",
          });
          const userData = await userRes.json();
          setUser(userData);
        }

        // Get link status
        const linkRes = await fetch(`${API}/guardians/link/status`, {
          credentials: "include",
        });
        if (linkRes.ok) {
          const linkData = await linkRes.json();
          setLinkStatus(linkData);
        }

        // Get child activity
        const activityRes = await fetch(`${API}/guardians/child/activity`, {
          credentials: "include",
        });
        if (activityRes.ok) {
          const activityData = await activityRes.json();
          if (activityData.linked) {
            setChildData(activityData);
          }
        }
      } catch (error) {
        console.error("Error fetching guardian data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.state]);

  const sidebarItems = [
    {
      icon: BarChart,
      label: t("nav.dashboard"),
      onClick: () => {},
      active: true,
    },
    {
      icon: User,
      label: t("nav.profile"),
      onClick: () => navigate("/profile"),
    },
  ];

  if (loading || !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background"
        dir="rtl"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const requests = childData?.requests || [];
  const assignments = childData?.assignments || [];
  const student = childData?.student || {};
  const scheduledCount = assignments.filter(
    (a) => a.status === "scheduled",
  ).length;
  const completedCount = assignments.filter(
    (a) => a.status === "completed",
  ).length;

  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div className="fade-in" data-testid="guardian-dashboard">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {t("guardian.dashboardTitle")}
          </h1>
          <p className="text-muted-foreground">
            {t("common.welcome")}, {user.name}
          </p>
        </div>

        {/* No child linked */}
        {!childData && (
          <div className="bg-white border border-amber-200 rounded-lg p-8 text-center">
            <Link2 className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-primary mb-2">
              {t("guardian.noChildLinked")}
            </h2>
            <p className="text-muted-foreground mb-4">
              {t("guardian.noChildLinkedDesc")}
            </p>
            {linkStatus?.status === "pending" && (
              <div className="flex items-center justify-center gap-2 text-amber-600 mb-4">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {t("guardian.pendingApproval")}
                </span>
              </div>
            )}
            <button
              onClick={() => navigate("/profile")}
              className="btn-primary px-6 py-3 rounded-lg font-medium"
            >
              {t("guardian.goToProfile")}
            </button>
          </div>
        )}

        {/* Child is linked — show monitoring dashboard */}
        {childData && (
          <>
            {/* Child Info Card */}
            <div className="bg-white border border-border rounded-lg p-6 mb-8">
              <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t("guardian.childInfo")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("auth.name")}
                  </p>
                  <p className="font-medium text-primary">{student.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("auth.email")}
                  </p>
                  <p className="font-medium text-primary">{student.email}</p>
                </div>
                {student.grade && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("guardian.grade")}
                    </p>
                    <p className="font-medium text-primary">
                      {t(`grades.${student.grade}`, student.grade)}
                    </p>
                  </div>
                )}
                {student.age && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("guardian.age")}
                    </p>
                    <p className="font-medium text-primary">{student.age}</p>
                  </div>
                )}
              </div>
              {student.subjects && student.subjects.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    {t("guardian.subjects")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {student.subjects.map((subj) => (
                      <span
                        key={subj}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {subj}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-1">
                  {t("guardian.totalRequests")}
                </p>
                <p className="text-3xl font-bold text-primary">
                  {requests.length}
                </p>
              </div>
              <div className="bg-white border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-1">
                  {t("guardian.scheduledSessions")}
                </p>
                <p className="text-3xl font-bold text-secondary">
                  {scheduledCount}
                </p>
              </div>
              <div className="bg-white border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-1">
                  {t("guardian.completedSessions")}
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {completedCount}
                </p>
              </div>
            </div>

            {/* Child Requests */}
            <div className="bg-white border border-border rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t("guardian.childRequests")}
              </h2>
              {requests.length === 0 ? (
                <div className="text-center py-6">
                  <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    {t("guardian.noChildRequests")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.slice(0, 10).map((req) => (
                    <div
                      key={req.request_id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-primary truncate">
                          {req.subject}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {req.description?.slice(0, 80)}
                          {req.description?.length > 80 ? "..." : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ms-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            req.status === "new"
                              ? "bg-blue-100 text-blue-700"
                              : req.status === "assigned"
                                ? "bg-green-100 text-green-700"
                                : req.status === "completed"
                                  ? "bg-gray-100 text-gray-700"
                                  : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {t(`status.${req.status}`, req.status)}
                        </span>
                        <button
                          onClick={() =>
                            navigate(`/requests/${req.request_id}`)
                          }
                          className="text-sm text-secondary hover:underline whitespace-nowrap"
                        >
                          {t("guardian.viewRequest")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Child Sessions */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {t("guardian.childSessions")}
              </h2>
              {assignments.length === 0 ? (
                <div className="text-center py-6">
                  <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    {t("guardian.noChildSessions")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.slice(0, 10).map((a) => (
                    <div
                      key={a.assignment_id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() =>
                        navigate(`/assignments/${a.assignment_id}`)
                      }
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-primary truncate">
                          {a.subject ||
                            a.request_subject ||
                            t("guardian.childSessions")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {a.teacher_name && `${a.teacher_name}`}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          a.status === "scheduled"
                            ? "bg-blue-100 text-blue-700"
                            : a.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : a.status === "in_progress"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {a.status === "scheduled" && (
                          <Calendar className="w-3 h-3 inline me-1" />
                        )}
                        {a.status === "completed" && (
                          <CheckCircle className="w-3 h-3 inline me-1" />
                        )}
                        {t(`status.${a.status}`, a.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
