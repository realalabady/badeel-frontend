import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChart,
  FileText,
  BookOpen,
  Plus,
  User,
  Search,
  CreditCard,
  Calendar,
  Link2,
  CheckCircle,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../components/DashboardLayout";
import { RequestCard } from "../components/SharedComponents";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [guardianRequests, setGuardianRequests] = useState([]);
  const [loading, setLoading] = useState(true);
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

        const requestsResponse = await fetch(`${API}/requests`, {
          credentials: "include",
        });
        const requestsData = await requestsResponse.json();
        setRequests(requestsData.items || requestsData);

        const assignmentsResponse = await fetch(`${API}/assignments`, {
          credentials: "include",
        });
        const assignmentsData = await assignmentsResponse.json();
        setAssignments(assignmentsData.items || assignmentsData);

        // Fetch pending guardian link requests
        try {
          const guardianRes = await fetch(`${API}/students/guardian-requests`, {
            credentials: "include",
          });
          if (guardianRes.ok) {
            setGuardianRequests(await guardianRes.json());
          }
        } catch {}
      } catch (error) {
        console.error("Error fetching data:", error);
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
      icon: Plus,
      label: t("requests.createNew"),
      onClick: () => navigate("/requests/new"),
    },
    {
      icon: FileText,
      label: t("dashboard.myRequests"),
      onClick: () => navigate("/requests"),
    },
    {
      icon: BookOpen,
      label: t("dashboard.mySessions"),
      onClick: () => navigate("/assignments"),
    },
    {
      icon: Search,
      label: t("browseTeachers.title"),
      onClick: () => navigate("/teachers"),
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

  const handleGuardianResponse = async (linkId, action) => {
    try {
      const res = await fetch(
        `${API}/students/guardian-requests/${linkId}/respond`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ action }),
        },
      );
      if (res.ok) {
        setGuardianRequests((prev) => prev.filter((r) => r.link_id !== linkId));
      }
    } catch (err) {
      console.error("Error responding to guardian request:", err);
    }
  };

  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div className="fade-in" data-testid="student-dashboard">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {t("dashboard.studentTitle")}
          </h1>
          <p className="text-muted-foreground">
            {t("common.welcome")}, {user.name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-1">
              {t("dashboard.myRequests")}
            </p>
            <p className="text-3xl font-bold text-primary">{requests.length}</p>
          </div>
          <div className="bg-white border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-1">
              {t("dashboard.scheduledSessions")}
            </p>
            <p className="text-3xl font-bold text-secondary">
              {assignments.filter((a) => a.status === "scheduled").length}
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

        <div className="bg-white border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-primary mb-4">
            {t("dashboard.quickActions")}
          </h2>
          <button
            onClick={() => navigate("/requests/new")}
            className="btn-primary px-6 py-3 rounded-lg font-medium flex items-center gap-2"
            data-testid="create-request-btn"
          >
            <Plus className="w-5 h-5" />
            {t("requests.createNew")}
          </button>
        </div>

        {/* Guardian Link Requests */}
        {guardianRequests.length > 0 && (
          <div className="bg-white border border-amber-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              {t("guardian.guardianRequests")}
            </h2>
            <div className="space-y-3">
              {guardianRequests.map((req) => (
                <div
                  key={req.link_id}
                  className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-primary">
                      {req.guardian_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {req.guardian_email} — {t("guardian.wantsToLink")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleGuardianResponse(req.link_id, "approve")
                      }
                      className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {t("guardian.approveLink")}
                    </button>
                    <button
                      onClick={() =>
                        handleGuardianResponse(req.link_id, "reject")
                      }
                      className="px-4 py-2 rounded-lg text-sm border border-red-300 text-red-600 hover:bg-red-50 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      {t("guardian.rejectLink")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-primary">
              {t("dashboard.myRequests")}
            </h2>
            <button
              onClick={() => navigate("/requests")}
              className="text-secondary hover:underline text-sm font-medium"
            >
              {t("dashboard.viewAll")}
            </button>
          </div>

          {requests.length === 0 ? (
            <div className="bg-white border border-border rounded-lg p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {t("dashboard.noRequestsCreated")}
              </p>
              <button
                onClick={() => navigate("/requests/new")}
                className="btn-primary px-6 py-2 rounded-lg"
              >
                {t("dashboard.createFirstRequest")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.slice(0, 6).map((request) => (
                <RequestCard
                  key={request.request_id}
                  request={request}
                  onViewDetails={(id) => navigate(`/requests/${id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
