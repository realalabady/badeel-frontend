import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChart,
  FileText,
  BookOpen,
  User,
  CreditCard,
  Calendar,
  Briefcase,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../components/DashboardLayout";
import { RequestCard } from "../components/SharedComponents";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function TeacherDashboard() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activeTab, setActiveTab] = useState("regular");
  const [subscription, setSubscription] = useState(null);
  const [subRequests, setSubRequests] = useState([]);
  const [subscribing, setSubscribing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let userData;
        if (location.state?.user) {
          userData = location.state.user;
        } else {
          const userResponse = await fetch(`${API}/auth/me`, {
            credentials: "include",
          });
          userData = await userResponse.json();
        }
        setUser(userData);

        // Regular data
        const [requestsRes, assignmentsRes] = await Promise.all([
          fetch(`${API}/requests`, { credentials: "include" }),
          fetch(`${API}/assignments`, { credentials: "include" }),
        ]);

        const requestsData = await requestsRes.json();
        setRequests((requestsData.items || requestsData).slice(0, 6));

        const assignmentsData = await assignmentsRes.json();
        setAssignments(assignmentsData.items || assignmentsData);

        // Substitute data
        try {
          const subRes = await fetch(`${API}/substitute/subscription`, {
            credentials: "include",
          });
          if (subRes.ok) {
            const subData = await subRes.json();
            setSubscription(subData);

            if (subData.status === "active") {
              const subReqRes = await fetch(`${API}/substitute/requests`, {
                credentials: "include",
              });
              if (subReqRes.ok) {
                const subReqData = await subReqRes.json();
                setSubRequests(subReqData.items || []);
              }
            }
          }
        } catch (e) {
          // No subscription
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

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
      label: t("dashboard.availableRequests"),
      onClick: () => navigate("/requests"),
    },
    {
      icon: BookOpen,
      label: t("dashboard.mySessions"),
      onClick: () => navigate("/assignments"),
    },
    {
      icon: CreditCard,
      label: t("payments.title"),
      onClick: () => navigate("/payments"),
    },
    {
      icon: Calendar,
      label: t("schedule.title"),
      onClick: () => navigate("/schedule"),
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

  const subStatus = subscription?.status || "none";
  const regularRequests = requests.filter((r) => r.service_type !== "substitute");
  const subActiveCount = assignments.filter(
    (a) => a.status !== "completed" && a.status !== "cancelled",
  ).length;
  const subCompletedCount = assignments.filter(
    (a) => a.status === "completed",
  ).length;

  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div className="fade-in" data-testid="teacher-dashboard">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {t("dashboard.teacherTitle")}
          </h1>
          <p className="text-muted-foreground">
            {t("common.welcome")}, {user.name}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("regular")}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "regular"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-primary"
            }`}
          >
            {t("dashboard.regularTab")}
          </button>
          <button
            onClick={() => setActiveTab("substitute")}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "substitute"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-primary"
            }`}
          >
            <Briefcase className="w-4 h-4 inline-block me-1" />
            {t("dashboard.substituteTab")}
          </button>
        </div>

        {/* ========== REGULAR TAB ========== */}
        {activeTab === "regular" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-1">
                  {t("dashboard.availableRequests")}
                </p>
                <p className="text-3xl font-bold text-primary">{regularRequests.length}</p>
              </div>
              <div className="bg-white border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-1">
                  {t("dashboard.currentSessions")}
                </p>
                <p className="text-3xl font-bold text-secondary">
                  {assignments.filter((a) => a.status !== "completed").length}
                </p>
              </div>
              <div className="bg-white border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-1">
                  {t("dashboard.completedSessions")}
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {assignments.filter((a) => a.status === "completed").length}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-primary">
                  {t("dashboard.availableRequests")}
                </h2>
                <button
                  onClick={() => navigate("/requests")}
                  className="text-secondary hover:underline text-sm font-medium"
                >
                  {t("dashboard.viewAll")}
                </button>
              </div>

              {regularRequests.length === 0 ? (
                <div className="bg-white border border-border rounded-lg p-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {t("dashboard.noRequests")}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularRequests.map((request) => (
                    <RequestCard
                      key={request.request_id}
                      request={request}
                      onViewDetails={(id) => navigate(`/requests/${id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ========== SUBSTITUTE TAB ========== */}
        {activeTab === "substitute" && (
          <>
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
                  {(subStatus === "none" || subStatus === "inactive") && (
                    <Briefcase className="w-6 h-6 text-primary" />
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
                              {new Date(subscription.expires_at).toLocaleDateString("ar-SA")}
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white border border-border rounded-lg p-6">
                    <p className="text-sm text-muted-foreground mb-1">
                      {t("substitute.availableRequests")}
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      {subRequests.length}
                    </p>
                  </div>
                  <div className="bg-white border border-border rounded-lg p-6">
                    <p className="text-sm text-muted-foreground mb-1">
                      {t("substitute.activeAssignments")}
                    </p>
                    <p className="text-3xl font-bold text-secondary">
                      {subActiveCount}
                    </p>
                  </div>
                  <div className="bg-white border border-border rounded-lg p-6">
                    <p className="text-sm text-muted-foreground mb-1">
                      {t("substitute.completedAssignments")}
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {subCompletedCount}
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-primary mb-4">
                    {t("substitute.availableRequests")}
                  </h2>
                  {subRequests.length === 0 ? (
                    <div className="bg-white border border-border rounded-lg p-8 text-center">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {t("substitute.noRequests")}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {subRequests.slice(0, 6).map((request) => (
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
                            {request.coverage_start && (
                              <p>
                                {t("substitute.coverageStart")}:{" "}
                                {new Date(
                                  request.coverage_start,
                                ).toLocaleDateString("ar-SA")}
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
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
