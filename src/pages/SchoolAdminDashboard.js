import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChart,
  Users,
  FileText,
  BookOpen,
  Plus,
  Building2,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../components/DashboardLayout";
import { StatsCard } from "../components/SharedComponents";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PLANS = [
  { id: "basic", limit: 5 },
  { id: "advance", limit: 10 },
  { id: "pro", limit: -1 },
];

export default function SchoolAdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [substituteRequests, setSubstituteRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("basic");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [subscribing, setSubscribing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (location.state?.user) {
          setUser(location.state.user);
        } else {
          const userResponse = await fetch(`${API}/auth/me`, {
            credentials: "include",
          });
          const userData = await userResponse.json();
          setUser(userData);
        }

        const [statsRes, subRes, mySubRes] = await Promise.all([
          fetch(`${API}/reports/stats`, { credentials: "include" }),
          fetch(`${API}/requests?service_type=substitute`, { credentials: "include" }),
          fetch(`${API}/school-subscriptions/mine`, { credentials: "include" }),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubstituteRequests((subData.items || subData).slice(0, 5));
        }
        if (mySubRes.ok) {
          const mySub = await mySubRes.json();
          setSubscription(mySub);
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
      const res = await fetch(`${API}/school-subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan: selectedPlan, billing_cycle: billingCycle }),
      });
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
        setShowSubscribe(false);
      }
    } catch {}
    setSubscribing(false);
  };

  const isSubActive = subscription?.status === "active" && subscription?.payment_status === "paid";

  const sidebarItems = [
    {
      icon: BarChart,
      label: t("nav.dashboard"),
      onClick: () => {},
      active: true,
    },
    {
      icon: Building2,
      label: t("school.setup"),
      onClick: () => navigate("/school-setup"),
    },
    {
      icon: FileText,
      label: t("nav.requests"),
      onClick: () => navigate("/requests"),
    },
    {
      icon: Plus,
      label: t("requests.createNew"),
      onClick: () => navigate("/requests/new"),
    },
    {
      icon: Users,
      label: t("nav.teachers"),
      onClick: () => navigate("/teachers"),
    },
    {
      icon: Briefcase,
      label: t("substitute.substituteRequests"),
      onClick: () => navigate("/requests/new"),
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

  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div className="fade-in" data-testid="school-admin-dashboard">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {t("dashboard.schoolAdminTitle")}
          </h1>
          <p className="text-muted-foreground">
            {t("common.welcome")}, {user.name}
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title={t("dashboard.totalRequests")}
              value={stats.total_requests}
              icon={FileText}
              color="primary"
            />
            <StatsCard
              title={t("dashboard.availableTeachers")}
              value={stats.active_teachers}
              icon={Users}
              color="secondary"
            />
            <StatsCard
              title={t("dashboard.pendingRequests")}
              value={stats.pending_requests}
              icon={BookOpen}
              color="warning"
            />
          </div>
        )}

        {/* Subscription Card */}
        <div className="bg-white border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {t("schoolSubscription.title")}
          </h2>
          {subscription && subscription.status ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full font-medium">
                  {t(`schoolSubscription.plans.${subscription.plan}`)}
                </span>
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${subscription.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {t(`schoolSubscription.${subscription.status}`)}
                </span>
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${subscription.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {t(`schoolSubscription.${subscription.payment_status}`)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{t("schoolSubscription.billing")}: {t(`schoolSubscription.${subscription.billing_cycle}`)}</p>
                <p>
                  {t("schoolSubscription.usage")}:{" "}
                  {subscription.request_limit === -1
                    ? `${subscription.requests_used} (${t("schoolSubscription.unlimited")})`
                    : `${subscription.requests_used} / ${subscription.request_limit}`}
                </p>
                <p>{t("schoolSubscription.expires")}: {subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString("ar-SA") : ""}</p>
              </div>
              {subscription.payment_status === "unpaid" && (
                <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                  <AlertTriangle className="w-4 h-4" />
                  {t("schoolSubscription.paymentRequired")}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">{t("schoolSubscription.noSubscription")}</p>
              <button onClick={() => setShowSubscribe(true)} className="btn-primary px-6 py-2 rounded-lg">
                {t("schoolSubscription.subscribe")}
              </button>
            </div>
          )}
        </div>

        {/* Subscribe Modal */}
        {showSubscribe && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-lg p-6">
              <h3 className="text-lg font-bold text-primary mb-4">{t("schoolSubscription.choosePlan")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`border-2 rounded-lg p-4 text-center transition-colors ${selectedPlan === plan.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                  >
                    <h4 className="font-bold text-primary">{t(`schoolSubscription.plans.${plan.id}`)}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan.limit === -1 ? t("schoolSubscription.unlimited") : `${plan.limit} ${t("schoolSubscription.requestsPerMonth")}`}
                    </p>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium ${billingCycle === "monthly" ? "border-primary bg-primary/5 text-primary" : "border-border"}`}
                >
                  {t("schoolSubscription.monthly")}
                </button>
                <button
                  onClick={() => setBillingCycle("annual")}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium ${billingCycle === "annual" ? "border-primary bg-primary/5 text-primary" : "border-border"}`}
                >
                  {t("schoolSubscription.annual")}
                </button>
              </div>
              <div className="flex gap-3">
                <button onClick={handleSubscribe} disabled={subscribing} className="flex-1 btn-primary py-2 rounded-lg text-sm disabled:opacity-50">
                  {subscribing ? t("common.loading") : t("schoolSubscription.subscribe")}
                </button>
                <button onClick={() => setShowSubscribe(false)} className="flex-1 border border-border py-2 rounded-lg text-sm">
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-primary mb-4">
            {t("dashboard.quickActions")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/requests/new")}
              className="btn-primary p-4 rounded-lg text-right flex items-center justify-between group"
              data-testid="create-request-btn"
            >
              <div>
                <h3 className="font-bold mb-1">{t("requests.createNew")}</h3>
                <p className="text-sm text-white/80">
                  {t("requests.fillForm")}
                </p>
              </div>
              <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={() => navigate("/requests")}
              className="btn-secondary p-4 rounded-lg text-right flex items-center justify-between group"
            >
              <div>
                <h3 className="font-bold mb-1">
                  {t("dashboard.viewAllRequests")}
                </h3>
                <p className="text-sm text-primary/80">
                  {t("dashboard.manageRequests")}
                </p>
              </div>
              <FileText className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {substituteRequests.length > 0 && (
          <div className="bg-white border border-border rounded-lg p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                {t("substitute.substituteRequests")}
              </h2>
            </div>
            <div className="space-y-3">
              {substituteRequests.map((req) => (
                <div
                  key={req.request_id}
                  onClick={() => navigate(`/requests/${req.request_id}`)}
                  className="border border-border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-primary">
                        {req.subject}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {req.education_stage &&
                          t(`substitute.${req.education_stage}`)}{" "}
                        · {req.coverage_duration}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        req.status === "new"
                          ? "bg-green-100 text-green-700"
                          : req.status === "assigned"
                            ? "bg-blue-100 text-blue-700"
                            : req.status === "completed"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {req.status === "new" && <Clock className="w-3 h-3" />}
                      {req.status === "assigned" && (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      {req.status === "completed" && (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      {req.status === "cancelled" && (
                        <XCircle className="w-3 h-3" />
                      )}
                      {t(`status.${req.status}`)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
