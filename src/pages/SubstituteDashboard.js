import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChart,
  FileText,
  BookOpen,
  User,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Briefcase,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../components/DashboardLayout";
import { RequestCard } from "../components/SharedComponents";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function SubstituteDashboard() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [requests, setRequests] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const fetchData = async () => {
    try {
      // Get user
      if (location.state?.user) {
        setUser(location.state.user);
      } else {
        const userRes = await fetch(`${API}/auth/me`, {
          credentials: "include",
        });
        const userData = await userRes.json();
        setUser(userData);
      }

      // Get subscription status
      const subRes = await fetch(`${API}/substitute/subscription`, {
        credentials: "include",
      });
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscription(subData);

        // If active, fetch substitute requests and assignments
        if (subData.status === "active") {
          const [reqRes, assignRes] = await Promise.all([
            fetch(`${API}/substitute/requests`, { credentials: "include" }),
            fetch(`${API}/assignments`, { credentials: "include" }),
          ]);

          if (reqRes.ok) {
            const reqData = await reqRes.json();
            setRequests(reqData.items || []);
          }
          if (assignRes.ok) {
            const assignData = await assignRes.json();
            // Filter to show only substitute-related assignments
            setAssignments(assignData.items || assignData || []);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [location.state]);

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const res = await fetch(`${API}/substitute/subscribe`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setSubscription({ status: data.status });
      }
    } catch (err) {
      console.error("Subscribe error:", err);
    } finally {
      setSubscribing(false);
    }
  };

  const sidebarItems = [
    {
      icon: BarChart,
      label: t("nav.dashboard"),
      onClick: () => {},
      active: true,
    },
    {
      icon: FileText,
      label: t("substitute.availableRequests"),
      onClick: () => navigate("/requests"),
    },
    {
      icon: BookOpen,
      label: t("substitute.myAssignments"),
      onClick: () => navigate("/assignments"),
    },
    {
      icon: User,
      label: t("substitute.profile"),
      onClick: () => navigate("/substitute/profile"),
    },
    {
      icon: CreditCard,
      label: t("substitute.subscriptionStatus"),
      onClick: () => {},
    },
    {
      icon: ArrowLeft,
      label: t("substitute.backToTeacher"),
      onClick: () => navigate("/teacher"),
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

  const subStatus = subscription?.status || "none";
  const activeCount = assignments.filter(
    (a) => a.status !== "completed" && a.status !== "cancelled",
  ).length;
  const completedCount = assignments.filter(
    (a) => a.status === "completed",
  ).length;

  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div className="fade-in" data-testid="substitute-dashboard">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {t("substitute.dashboardTitle")}
          </h1>
          <p className="text-muted-foreground">
            {t("common.welcome")}, {user.name}
          </p>
        </div>

        {/* Subscription Status Card */}
        <div
          className={`border rounded-lg p-6 mb-8 ${
            subStatus === "active"
              ? "bg-green-50 border-green-200"
              : subStatus === "pending"
                ? "bg-amber-50 border-amber-200"
                : subStatus === "expired"
                  ? "bg-red-50 border-red-200"
                  : "bg-white border-border"
          }`}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {subStatus === "active" && (
                <CheckCircle className="w-6 h-6 text-green-600" />
              )}
              {subStatus === "pending" && (
                <Clock className="w-6 h-6 text-amber-600" />
              )}
              {subStatus === "expired" && (
                <AlertCircle className="w-6 h-6 text-red-600" />
              )}
              {subStatus === "none" && (
                <Briefcase className="w-6 h-6 text-primary" />
              )}
              {subStatus === "inactive" && (
                <AlertCircle className="w-6 h-6 text-gray-500" />
              )}

              <div>
                <h2 className="text-lg font-bold text-primary">
                  {t("substitute.subscriptionStatus")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {subStatus === "none" && t("substitute.subscribeDesc")}
                  {subStatus === "pending" && t("substitute.pendingMessage")}
                  {subStatus === "active" && (
                    <>
                      {t("substitute.activeMessage")}
                      {subscription?.expires_at && (
                        <span className="ms-2">
                          — {t("substitute.expiresAt")}:{" "}
                          {new Date(subscription.expires_at).toLocaleDateString(
                            "ar-SA",
                          )}
                        </span>
                      )}
                    </>
                  )}
                  {subStatus === "expired" && t("substitute.statusExpired")}
                  {subStatus === "inactive" && t("substitute.statusInactive")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  subStatus === "active"
                    ? "bg-green-100 text-green-700"
                    : subStatus === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : subStatus === "expired"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                }`}
              >
                {t(
                  `substitute.status${subStatus.charAt(0).toUpperCase() + subStatus.slice(1)}`,
                )}
              </span>

              {(subStatus === "none" ||
                subStatus === "expired" ||
                subStatus === "inactive") && (
                <button
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className="btn-primary px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  {subscribing
                    ? t("substitute.subscribing")
                    : subStatus === "expired"
                      ? t("substitute.renewSubscription")
                      : t("substitute.subscribe")}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content — only if active subscription */}
        {subStatus === "active" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-1">
                  {t("substitute.availableRequests")}
                </p>
                <p className="text-3xl font-bold text-primary">
                  {requests.length}
                </p>
              </div>
              <div className="bg-white border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-1">
                  {t("substitute.activeAssignments")}
                </p>
                <p className="text-3xl font-bold text-secondary">
                  {activeCount}
                </p>
              </div>
              <div className="bg-white border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-1">
                  {t("substitute.completedAssignments")}
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {completedCount}
                </p>
              </div>
            </div>

            {/* Available Substitute Requests */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">
                {t("substitute.availableRequests")}
              </h2>
              {requests.length === 0 ? (
                <div className="bg-white border border-border rounded-lg p-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {t("substitute.noRequests")}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {requests.slice(0, 6).map((request) => (
                    <div
                      key={request.request_id}
                      className="bg-white border border-border rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() =>
                        navigate(`/requests/${request.request_id}`)
                      }
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-primary">
                          {t(
                            `browseTeachers.specs.${request.subject}`,
                            request.subject,
                          )}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === "new"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {t(
                            `requests.status.${request.status}`,
                            request.status,
                          )}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {request.education_stage && (
                          <p>
                            {t("substitute.educationStage")}:{" "}
                            {t(
                              `substitute.${request.education_stage}`,
                              request.education_stage,
                            )}
                          </p>
                        )}
                        {request.city && (
                          <p>
                            {t("substitute.city")}: {request.city}
                          </p>
                        )}
                        {request.mode && (
                          <p>
                            {t("requests.mode")}: {t(`modes.${request.mode}`)}
                          </p>
                        )}
                        {request.coverage_start && (
                          <p>
                            {t("substitute.coverageStart")}:{" "}
                            {new Date(
                              request.coverage_start,
                            ).toLocaleDateString("ar-SA")}
                          </p>
                        )}
                        {request.school_type && (
                          <p>
                            {t("substitute.schoolType")}:{" "}
                            {t(
                              `substitute.${request.school_type}`,
                              request.school_type,
                            )}
                          </p>
                        )}
                      </div>
                      <button
                        className="mt-3 text-sm text-secondary hover:underline font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/requests/${request.request_id}`);
                        }}
                      >
                        {t("substitute.viewDetails")}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Assignments */}
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">
                {t("substitute.myAssignments")}
              </h2>
              {assignments.length === 0 ? (
                <div className="bg-white border border-border rounded-lg p-8 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {t("substitute.noAssignments")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.slice(0, 10).map((a) => (
                    <div
                      key={a.assignment_id}
                      className="bg-white border border-border rounded-lg p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() =>
                        navigate(`/assignments/${a.assignment_id}`)
                      }
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-primary truncate">
                          {a.request_subject ||
                            a.subject ||
                            t("substitute.myAssignments")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {a.student_name && a.student_name}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          a.status === "scheduled"
                            ? "bg-blue-100 text-blue-700"
                            : a.status === "in_progress"
                              ? "bg-amber-100 text-amber-700"
                              : a.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {t(`requests.status.${a.status}`, a.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Prompt to complete substitute profile if active but no profile */}
        {subStatus === "active" && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <User className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-blue-800 mb-3">
              {t("substitute.profileDesc")}
            </p>
            <button
              onClick={() => navigate("/substitute/profile")}
              className="btn-primary px-6 py-2 rounded-lg text-sm font-medium"
            >
              {t("substitute.profile")}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
