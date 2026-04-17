import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../components/DashboardLayout";
import { AssignmentCard } from "../components/SharedComponents";
import { CardSkeleton } from "../components/LoadingSkeleton";
import EmptyState from "../components/EmptyState";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function MyAssignments() {
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
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

        const assignmentsResponse = await fetch(
          `${API}/assignments?page=${page}&per_page=12`,
          {
            credentials: "include",
          },
        );
        const assignmentsData = await assignmentsResponse.json();
        setAssignments(assignmentsData.items || assignmentsData);
        setTotalPages(assignmentsData.total_pages || 1);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);

  const sidebarItems = user
    ? [
        {
          icon: BookOpen,
          label: t("common.back"),
          onClick: () =>
            navigate(user.role === "teacher" ? "/teacher" : "/student"),
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

  const handleViewDetails = (assignmentId) => {
    navigate(`/assignments/${assignmentId}`);
  };

  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div className="fade-in" dir="rtl" data-testid="my-assignments-page">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {t("assignments.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("assignments.viewAndManage")}
          </p>
        </div>

        {assignments.length === 0 ? (
          <EmptyState icon={BookOpen} title={t("assignments.noAssignments")} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
              <AssignmentCard
                key={assignment.assignment_id}
                assignment={assignment}
                onViewDetails={handleViewDetails}
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
