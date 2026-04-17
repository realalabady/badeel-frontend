import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Filter } from "lucide-react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../components/DashboardLayout";
import { RequestCard } from "../components/SharedComponents";
import { CardSkeleton } from "../components/LoadingSkeleton";
import EmptyState from "../components/EmptyState";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function MyRequests() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch(`${API}/auth/me`, {
          credentials: "include",
        });
        const userData = await userResponse.json();
        setUser(userData);

        const requestsResponse = await fetch(
          `${API}/requests?page=${page}&per_page=12`,
          { credentials: "include" },
        );
        const requestsData = await requestsResponse.json();
        setRequests(requestsData.items || requestsData);
        setFilteredRequests(requestsData.items || requestsData);
        setTotalPages(requestsData.total_pages || 1);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);

  useEffect(() => {
    if (filterStatus === "all") {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter((r) => r.status === filterStatus));
    }
  }, [filterStatus, requests]);

  const sidebarItems = user
    ? [
        {
          icon: FileText,
          label: t("common.back"),
          onClick: () =>
            navigate(
              user.role === "teacher"
                ? "/teacher"
                : user.role === "admin"
                  ? "/admin"
                  : user.role === "school_admin"
                    ? "/school-admin"
                    : "/student",
            ),
        },
      ]
    : [];

  if (loading || !user) {
    return (
      <DashboardLayout user={{ name: "", role: "" }} sidebarItems={[]}>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div className="fade-in" dir="rtl" data-testid="my-requests-page">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {user.role === "teacher"
              ? t("dashboard.availableRequests")
              : t("dashboard.myRequests")}
          </h1>
          <p className="text-muted-foreground">
            {user.role === "teacher"
              ? t("dashboard.manageRequests")
              : t("dashboard.manageRequests")}
          </p>
        </div>

        <div className="bg-white border border-border rounded-lg p-4 mb-6 flex items-center gap-4">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <label className="text-sm font-medium text-primary">
            {t("requests.filterBy")}
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary text-right bg-white"
            data-testid="filter-status-select"
          >
            <option value="all">{t("common.all")}</option>
            <option value="new">{t("status.new")}</option>
            <option value="offered">{t("status.offered")}</option>
            <option value="accepted">{t("status.accepted")}</option>
            <option value="assigned">{t("status.assigned")}</option>
            <option value="in_progress">{t("status.in_progress")}</option>
            <option value="completed">{t("status.completed")}</option>
            <option value="cancelled">{t("status.cancelled")}</option>
          </select>
          <span className="mr-auto text-sm text-muted-foreground">
            {filteredRequests.length} {t("requests.requestsCount")}
          </span>
        </div>

        {filteredRequests.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={t("requests.noRequests")}
            description={
              user.role !== "teacher" ? t("requests.createFirst") : undefined
            }
            action={
              user.role !== "teacher" ? (
                <button
                  onClick={() => navigate("/requests/new")}
                  className="btn-primary px-6 py-2 rounded-lg text-sm"
                >
                  {t("requests.createNew")}
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request.request_id}
                request={request}
                onViewDetails={(id) => navigate(`/requests/${id}`)}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 hover:bg-accent"
            >
              ←
            </button>
            <span className="text-sm text-muted-foreground px-4">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 hover:bg-accent"
            >
              →
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
