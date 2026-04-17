import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChart,
  Users,
  GraduationCap,
  CheckCircle,
  FileText,
  BookOpen,
  ShieldCheck,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  Award,
  XCircle,
  User as UserIcon,
  Trash2,
  Building2,
  CreditCard,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../components/DashboardLayout";
import { StatsCard } from "../components/SharedComponents";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [pendingSubs, setPendingSubs] = useState([]);
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [expandedSub, setExpandedSub] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [adminRequests, setAdminRequests] = useState([]);
  const [reqPage, setReqPage] = useState(1);
  const [reqTotal, setReqTotal] = useState(0);
  const [reqStatusFilter, setReqStatusFilter] = useState("");
  const [schoolSubs, setSchoolSubs] = useState([]);
  const [schoolSubFilter, setSchoolSubFilter] = useState("");
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

        const [statsRes, subsRes, teachersRes] = await Promise.all([
          fetch(`${API}/reports/stats`, { credentials: "include" }),
          fetch(`${API}/admin/subscriptions?status=pending`, { credentials: "include" }),
          fetch(`${API}/teachers/pending`, { credentials: "include" }),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (subsRes.ok) setPendingSubs(await subsRes.json());
        if (teachersRes.ok) setPendingTeachers(await teachersRes.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.state]);

  const fetchAdminRequests = async (page = 1, status = "") => {
    try {
      const params = new URLSearchParams({ page, per_page: 10 });
      if (status) params.append("status", status);
      const res = await fetch(`${API}/admin/requests?${params}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAdminRequests(data.items || []);
        setReqTotal(data.total_pages || 0);
      }
    } catch {}
  };

  const fetchSchoolSubs = async (status = "") => {
    try {
      const url = status ? `${API}/admin/school-subscriptions?status=${status}` : `${API}/admin/school-subscriptions`;
      const res = await fetch(url, { credentials: "include" });
      if (res.ok) setSchoolSubs(await res.json());
    } catch {}
  };

  useEffect(() => {
    if (activeTab === "requests") fetchAdminRequests(reqPage, reqStatusFilter);
  }, [activeTab, reqPage, reqStatusFilter]);

  useEffect(() => {
    if (activeTab === "schoolSubs") fetchSchoolSubs(schoolSubFilter);
  }, [activeTab, schoolSubFilter]);

  const handleDeleteRequest = async (reqId) => {
    if (!window.confirm(t("adminRequests.confirmDelete"))) return;
    try {
      await fetch(`${API}/admin/requests/${reqId}`, { method: "DELETE", credentials: "include" });
      setAdminRequests((prev) => prev.filter((r) => r.request_id !== reqId));
    } catch {}
  };

  const handleUpdateRequestStatus = async (reqId, newStatus) => {
    try {
      await fetch(`${API}/admin/requests/${reqId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      setAdminRequests((prev) =>
        prev.map((r) => (r.request_id === reqId ? { ...r, status: newStatus } : r)),
      );
    } catch {}
  };

  const handleUpdateSchoolSub = async (subId, field, value) => {
    try {
      await fetch(`${API}/admin/school-subscriptions/${subId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ [field]: value }),
      });
      setSchoolSubs((prev) =>
        prev.map((s) => (s.subscription_id === subId ? { ...s, [field]: value } : s)),
      );
    } catch {}
  };

  const handleVerifyTeacher = async (teacherId, status) => {
    setProcessing(teacherId);
    try {
      const res = await fetch(
        `${API}/teachers/${teacherId}/verify?status=${status}`,
        { method: "PUT", credentials: "include" },
      );
      if (res.ok) {
        setPendingTeachers((prev) =>
          prev.filter((t) => t.teacher_id !== teacherId),
        );
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setProcessing(null);
    }
  };

  const pendingCount = pendingTeachers.length + pendingSubs.length;

  const sidebarItems = [
    {
      icon: BarChart,
      label: t("nav.dashboard"),
      onClick: () => setActiveTab("overview"),
      active: activeTab === "overview",
    },
    {
      icon: FileText,
      label: t("adminRequests.title"),
      onClick: () => setActiveTab("requests"),
      active: activeTab === "requests",
    },
    {
      icon: Building2,
      label: t("schoolSubscription.adminTitle"),
      onClick: () => setActiveTab("schoolSubs"),
      active: activeTab === "schoolSubs",
    },
    {
      icon: Users,
      label: t("nav.users"),
      onClick: () => navigate("/admin/users"),
    },
    {
      icon: ShieldCheck,
      label: `${t("dashboard.pendingApprovals")}${pendingCount > 0 ? ` (${pendingCount})` : ""}`,
      onClick: () => setActiveTab("approvals"),
      active: activeTab === "approvals",
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
      <div className="fade-in" data-testid="admin-dashboard">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {t("dashboard.adminTitle")}
          </h1>
          <p className="text-muted-foreground">
            {t("common.welcome")}, {user.name}
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title={t("dashboard.totalRequests")}
              value={stats.total_requests}
              icon={FileText}
              color="primary"
            />
            <StatsCard
              title={t("dashboard.completedSessions")}
              value={stats.completed_sessions}
              icon={CheckCircle}
              color="success"
            />
            <StatsCard
              title={t("dashboard.activeTeachers")}
              value={stats.active_teachers}
              icon={Users}
              color="secondary"
            />
            <StatsCard
              title={t("dashboard.activeStudents")}
              value={stats.active_students}
              icon={GraduationCap}
              color="warning"
            />
          </div>
        )}

        {/* ====== OVERVIEW TAB ====== */}
        {activeTab === "overview" && (
          <>
            <div className="bg-white border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold text-primary mb-4">
                {t("dashboard.overview")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t("dashboard.welcomeMessage")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => setActiveTab("requests")} className="btn-primary p-4 rounded-lg text-right flex items-center justify-between group">
                  <div>
                    <h3 className="font-bold mb-1">{t("adminRequests.title")}</h3>
                    <p className="text-sm text-white/80">{t("dashboard.manageRequests")}</p>
                  </div>
                  <FileText className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
                <button onClick={() => navigate("/admin/users")} className="btn-secondary p-4 rounded-lg text-right flex items-center justify-between group">
                  <div>
                    <h3 className="font-bold mb-1">{t("nav.users")}</h3>
                    <p className="text-sm text-primary/80">{t("userManagement.subtitle")}</p>
                  </div>
                  <Users className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            {pendingCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6 cursor-pointer" onClick={() => setActiveTab("approvals")}>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-yellow-700" />
                  <span className="font-semibold text-yellow-800">
                    {t("dashboard.pendingApprovals")} ({pendingCount})
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {/* ====== REQUESTS TAB ====== */}
        {activeTab === "requests" && (
          <div className="bg-white border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t("adminRequests.title")}
            </h2>
            <div className="mb-4">
              <select
                value={reqStatusFilter}
                onChange={(e) => { setReqStatusFilter(e.target.value); setReqPage(1); }}
                className="px-4 py-2 border border-border rounded-lg bg-white text-sm"
              >
                <option value="">{t("common.all")}</option>
                {["new", "offered", "assigned", "completed", "cancelled"].map((s) => (
                  <option key={s} value={s}>{t(`status.${s}`)}</option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-start text-sm font-medium text-primary">{t("adminRequests.subject")}</th>
                    <th className="px-4 py-3 text-start text-sm font-medium text-primary">{t("adminRequests.type")}</th>
                    <th className="px-4 py-3 text-start text-sm font-medium text-primary">{t("adminRequests.status")}</th>
                    <th className="px-4 py-3 text-start text-sm font-medium text-primary">{t("adminRequests.date")}</th>
                    <th className="px-4 py-3 text-start text-sm font-medium text-primary">{t("userManagement.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {adminRequests.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">{t("adminRequests.noRequests")}</td></tr>
                  ) : adminRequests.map((r) => (
                    <tr key={r.request_id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <button onClick={() => navigate(`/requests/${r.request_id}`)} className="font-medium text-primary hover:underline">
                          {r.subject}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm">{t(`serviceType.${r.service_type}`, r.service_type)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={r.status}
                          onChange={(e) => handleUpdateRequestStatus(r.request_id, e.target.value)}
                          className="px-2 py-1 text-xs border border-border rounded-lg bg-white"
                        >
                          {["new", "offered", "assigned", "completed", "cancelled"].map((s) => (
                            <option key={s} value={s}>{t(`status.${s}`)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString("ar-SA") : ""}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDeleteRequest(r.request_id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {reqTotal > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button disabled={reqPage <= 1} onClick={() => setReqPage(reqPage - 1)} className="px-3 py-1 border border-border rounded text-sm disabled:opacity-50">←</button>
                <span className="text-sm">{reqPage} / {reqTotal}</span>
                <button disabled={reqPage >= reqTotal} onClick={() => setReqPage(reqPage + 1)} className="px-3 py-1 border border-border rounded text-sm disabled:opacity-50">→</button>
              </div>
            )}
          </div>
        )}

        {/* ====== SCHOOL SUBS TAB ====== */}
        {activeTab === "schoolSubs" && (
          <div className="bg-white border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {t("schoolSubscription.adminTitle")}
            </h2>
            <div className="mb-4">
              <select
                value={schoolSubFilter}
                onChange={(e) => setSchoolSubFilter(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg bg-white text-sm"
              >
                <option value="">{t("common.all")}</option>
                <option value="active">{t("schoolSubscription.active")}</option>
                <option value="inactive">{t("schoolSubscription.inactive")}</option>
                <option value="expired">{t("schoolSubscription.expired")}</option>
              </select>
            </div>
            {schoolSubs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">{t("schoolSubscription.noSubs")}</p>
            ) : (
              <div className="space-y-4">
                {schoolSubs.map((sub) => (
                  <div key={sub.subscription_id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-primary">{sub.school_name || sub.school_id}</h3>
                        <p className="text-sm text-muted-foreground">{sub.admin_name} • {sub.admin_email}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">
                            {t(`schoolSubscription.plans.${sub.plan}`)}
                          </span>
                          <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                            {t(`schoolSubscription.${sub.billing_cycle}`)}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                            {sub.request_limit === -1 ? t("schoolSubscription.unlimited") : `${sub.requests_used}/${sub.request_limit}`}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("schoolSubscription.expires")}: {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString("ar-SA") : ""}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <select
                          value={sub.status}
                          onChange={(e) => handleUpdateSchoolSub(sub.subscription_id, "status", e.target.value)}
                          className="px-2 py-1 text-xs border border-border rounded-lg bg-white"
                        >
                          <option value="active">{t("schoolSubscription.active")}</option>
                          <option value="inactive">{t("schoolSubscription.inactive")}</option>
                          <option value="expired">{t("schoolSubscription.expired")}</option>
                        </select>
                        <select
                          value={sub.payment_status}
                          onChange={(e) => handleUpdateSchoolSub(sub.subscription_id, "payment_status", e.target.value)}
                          className={`px-2 py-1 text-xs border rounded-lg ${sub.payment_status === "paid" ? "border-green-300 text-green-700 bg-green-50" : "border-red-300 text-red-700 bg-red-50"}`}
                        >
                          <option value="paid">{t("schoolSubscription.paid")}</option>
                          <option value="unpaid">{t("schoolSubscription.unpaid")}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ====== APPROVALS TAB ====== */}
        {activeTab === "approvals" && (
          <div className="bg-white border border-border rounded-lg p-6 mt-6">
            <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              {t("dashboard.pendingApprovals")}
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            </h2>

            {/* Pending Teacher Verifications */}
            {pendingTeachers.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  {t("verification.title")} ({pendingTeachers.length})
                </h3>
                <div className="space-y-3">
                  {pendingTeachers.map((teacher) => (
                    <div
                      key={teacher.teacher_id}
                      className="border border-border rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="bg-primary/10 rounded-full p-2">
                            <UserIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-primary">
                              {teacher.name || teacher.user_id}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {teacher.email}
                            </p>
                            <div className="mt-2 space-y-1 text-sm">
                              {teacher.specialization && (
                                <div className="flex items-center gap-2">
                                  <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>{teacher.specialization}</span>
                                </div>
                              )}
                              {teacher.cities?.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>{teacher.cities.join(", ")}</span>
                                </div>
                              )}
                              {teacher.grades?.length > 0 && (
                                <p className="text-muted-foreground">
                                  {t("verification.grades")}: {teacher.grades.join(", ")}
                                </p>
                              )}
                              {teacher.bio && (
                                <p className="text-muted-foreground italic">"{teacher.bio}"</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleVerifyTeacher(teacher.teacher_id, "verified")}
                            disabled={processing === teacher.teacher_id}
                            className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {t("verification.approve")}
                          </button>
                          <button
                            onClick={() => handleVerifyTeacher(teacher.teacher_id, "rejected")}
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
              </div>
            )}

            {/* Pending Subscription Requests */}
            {pendingSubs.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {t("substitute.subscriptionRequests")} ({pendingSubs.length})
                </h3>
                <div className="space-y-3">
                  {pendingSubs.map((sub) => (
                <div
                  key={sub.subscription_id}
                  className="border border-border rounded-lg overflow-hidden"
                >
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() =>
                      setExpandedSub(
                        expandedSub === sub.subscription_id
                          ? null
                          : sub.subscription_id,
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-primary">
                          {sub.teacher_name || sub.user_id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {sub.teacher_email} •{" "}
                          {new Date(sub.requested_at).toLocaleDateString(
                            "ar-SA",
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await fetch(
                              `${API}/admin/subscriptions/${sub.subscription_id}/approve`,
                              {
                                method: "POST",
                                credentials: "include",
                              },
                            );
                            setPendingSubs((prev) =>
                              prev.filter(
                                (s) =>
                                  s.subscription_id !== sub.subscription_id,
                              ),
                            );
                          }}
                          className="btn-primary px-4 py-2 rounded-lg text-sm"
                        >
                          {t("substitute.approve")}
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await fetch(
                              `${API}/admin/subscriptions/${sub.subscription_id}/reject`,
                              {
                                method: "POST",
                                credentials: "include",
                              },
                            );
                            setPendingSubs((prev) =>
                              prev.filter(
                                (s) =>
                                  s.subscription_id !== sub.subscription_id,
                              ),
                            );
                          }}
                          className="border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm"
                        >
                          {t("substitute.reject")}
                        </button>
                      </div>
                      {expandedSub === sub.subscription_id ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {expandedSub === sub.subscription_id && (
                    <div className="border-t border-border bg-muted/10 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Contact Info */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                            {t("profile.contactInfo")}
                          </h4>
                          {sub.teacher_email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span>{sub.teacher_email}</span>
                            </div>
                          )}
                          {sub.teacher_phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span>{sub.teacher_phone}</span>
                            </div>
                          )}
                          {(sub.city || sub.region) && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span>
                                {[sub.city, sub.region]
                                  .filter(Boolean)
                                  .join("، ")}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Specializations & Stages */}
                        <div className="space-y-2">
                          {sub.specializations &&
                            sub.specializations.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                                  {t("substitute.specializations")}
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                  {sub.specializations.map((s) => (
                                    <span
                                      key={s}
                                      className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                                    >
                                      {t(`browseTeachers.specs.${s}`, s)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          {sub.education_stages &&
                            sub.education_stages.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                                  {t("substitute.educationStages")}
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                  {sub.education_stages.map((s) => (
                                    <span
                                      key={s}
                                      className="bg-secondary/10 text-secondary text-xs px-2 py-1 rounded-full"
                                    >
                                      {t(`substitute.${s}`, s)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>

                        {/* Availability & Certificate */}
                        <div className="space-y-2">
                          {sub.availability_mode && (
                            <div>
                              <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                                {t("substitute.availabilityMode")}
                              </h4>
                              <span className="text-sm">
                                {t(
                                  `substitute.${sub.availability_mode}`,
                                  sub.availability_mode,
                                )}
                              </span>
                            </div>
                          )}
                          {sub.certificate_url && (
                            <div>
                              <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                                {t("substitute.certificate")}
                              </h4>
                              <a
                                href={sub.certificate_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Award className="w-4 h-4" />
                                {t("common.view")}
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Bio */}
                        {sub.bio && (
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                              {t("substitute.bio")}
                            </h4>
                            <p className="text-sm text-foreground">{sub.bio}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
                </div>
              </div>
            )}

            {pendingCount === 0 && (
              <p className="text-center text-muted-foreground py-8">{t("dashboard.noPendingApprovals")}</p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
