import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  X,
  XCircle,
  User as UserIcon,
  Award,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../components/DashboardLayout";
import { StatusBadge } from "../components/SharedComponents";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function RequestDetail() {
  const [user, setUser] = useState(null);
  const [request, setRequest] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [acceptingOffer, setAcceptingOffer] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchOffers = async () => {
    try {
      const offersRes = await fetch(`${API}/requests/${id}/offers`, {
        credentials: "include",
      });
      if (offersRes.ok) {
        const offersData = await offersRes.json();
        setOffers(offersData);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch(`${API}/auth/me`, {
          credentials: "include",
        });
        const userData = await userResponse.json();
        setUser(userData);

        const requestResponse = await fetch(`${API}/requests/${id}`, {
          credentials: "include",
        });
        const requestData = await requestResponse.json();
        setRequest(requestData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchOffers();
  }, [id]);

  const handleAcceptRequest = async () => {
    setAccepting(true);
    try {
      const response = await fetch(`${API}/requests/${id}/offer`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        // Redirect to profile setup if teacher profile is missing
        if (data.detail === "Teacher profile not found") {
          alert(t("requests.completeProfileFirst"));
          navigate("/profile");
          return;
        }
        throw new Error(data.detail || t("common.error"));
      }

      alert(t("requests.requestAccepted"));
      navigate("/assignments");
    } catch (error) {
      alert(error.message);
    } finally {
      setAccepting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!window.confirm(t("requestDetail.confirmCancel"))) return;
    setCancelling(true);
    try {
      const response = await fetch(`${API}/requests/${id}/cancel`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to cancel request");
      }

      setRequest((prev) => ({ ...prev, status: "cancelled" }));
    } catch (error) {
      alert(error.message);
    } finally {
      setCancelling(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    setAcceptingOffer(offerId);
    try {
      const response = await fetch(`${API}/offers/${offerId}/accept`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to accept offer");
      }

      setRequest((prev) => ({ ...prev, status: "accepted" }));
      fetchOffers();
    } catch (error) {
      alert(error.message);
    } finally {
      setAcceptingOffer(null);
    }
  };

  const sidebarItems = user
    ? [
        {
          icon: ArrowRight,
          label: t("common.back"),
          onClick: () => navigate(-1),
        },
      ]
    : [];

  if (loading || !user || !request) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background"
        dir="rtl"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const serviceTypeLabels = {
    substitute: t("serviceTypes.substitute"),
    remote_school: t("serviceTypes.remote_school"),
    special_education: t("serviceTypes.special_education"),
    private_lesson: t("serviceTypes.private_lesson"),
  };

  const modeLabels = {
    in_person: t("modes.in_person"),
    remote: t("modes.remote"),
  };

  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div
        className="max-w-3xl mx-auto fade-in"
        dir="rtl"
        data-testid="request-detail-page"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {t("requestDetail.title")}
          </h1>
        </div>

        <div className="bg-white border border-border rounded-lg p-6 md:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-primary mb-2">
                {request.subject}
              </h2>
              <p className="text-muted-foreground">{request.grade}</p>
            </div>
            <StatusBadge status={request.status} />
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">
                {t("requestDetail.serviceType")}:
              </span>
              <span className="font-medium text-primary">
                {serviceTypeLabels[request.service_type]}
              </span>
            </div>

            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">
                {t("requestDetail.mode")}:
              </span>
              <span className="font-medium text-primary">
                {modeLabels[request.mode]}
              </span>
            </div>

            {request.city && (
              <div className="flex justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">
                  {t("requestDetail.city")}:
                </span>
                <span className="font-medium text-primary">{request.city}</span>
              </div>
            )}

            {request.grade && (
              <div className="flex justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">
                  {t("requestDetail.grade")}:
                </span>
                <span className="font-medium text-primary">{request.grade}</span>
              </div>
            )}

            {request.service_type === "substitute" && (
              <>
                {request.coverage_duration && (
                  <div className="flex justify-between border-b border-border pb-3">
                    <span className="text-muted-foreground">
                      {t("requestDetail.coverageDuration")}:
                    </span>
                    <span className="font-medium text-primary">
                      {request.coverage_duration}
                    </span>
                  </div>
                )}
                {request.coverage_start && (
                  <div className="flex justify-between border-b border-border pb-3">
                    <span className="text-muted-foreground">
                      {t("requestDetail.coverageStart")}:
                    </span>
                    <span className="font-medium text-primary">
                      {new Date(request.coverage_start).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                )}
                {request.coverage_end && (
                  <div className="flex justify-between border-b border-border pb-3">
                    <span className="text-muted-foreground">
                      {t("requestDetail.coverageEnd")}:
                    </span>
                    <span className="font-medium text-primary">
                      {new Date(request.coverage_end).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                )}
                {request.school_type && (
                  <div className="flex justify-between border-b border-border pb-3">
                    <span className="text-muted-foreground">
                      {t("requestDetail.schoolType")}:
                    </span>
                    <span className="font-medium text-primary">
                      {request.school_type}
                    </span>
                  </div>
                )}
                {request.education_stage && (
                  <div className="flex justify-between border-b border-border pb-3">
                    <span className="text-muted-foreground">
                      {t("requestDetail.educationStage")}:
                    </span>
                    <span className="font-medium text-primary">
                      {request.education_stage}
                    </span>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">
                {t("requestDetail.dateTime")}:
              </span>
              <span className="font-medium text-primary">
                {new Date(request.date_time).toLocaleString("ar-SA")}
              </span>
            </div>

            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">
                {t("requestDetail.createdAt")}:
              </span>
              <span className="font-medium text-primary">
                {new Date(request.created_at).toLocaleDateString("ar-SA")}
              </span>
            </div>
          </div>

          {request.notes && (
            <div className="bg-accent rounded-lg p-4 mb-6">
              <h3 className="font-bold text-primary mb-2">
                {t("requestDetail.notes")}:
              </h3>
              <p className="text-muted-foreground">{request.notes}</p>
            </div>
          )}

          {/* Offers Section - visible to request owner when offers exist */}
          {offers.length > 0 && request.created_by_user_id === user.user_id && (
            <div className="mb-6">
              <h3 className="font-bold text-primary mb-3 text-lg">
                {t("offers.title")} ({offers.length})
              </h3>
              <div className="space-y-3">
                {offers.map((offer) => (
                  <div
                    key={offer.offer_id}
                    className="border border-border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-primary">
                          {offer.teacher_name}
                        </p>
                        {offer.teacher_specialization && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {offer.teacher_specialization}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {offer.status === "pending" &&
                      request.status === "offered" ? (
                        <button
                          onClick={() => handleAcceptOffer(offer.offer_id)}
                          disabled={acceptingOffer === offer.offer_id}
                          className="px-4 py-2 btn-primary rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                          {acceptingOffer === offer.offer_id
                            ? t("offers.accepting")
                            : t("offers.accept")}
                        </button>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            offer.status === "accepted"
                              ? "bg-green-100 text-green-700"
                              : offer.status === "declined"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {t(`offers.status_${offer.status}`)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {user.role === "teacher" &&
            (request.status === "new" || request.status === "offered") && (
              <button
                onClick={handleAcceptRequest}
                disabled={accepting}
                className="w-full btn-primary py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="accept-request-btn"
              >
                <CheckCircle className="w-5 h-5" />
                {accepting
                  ? t("requests.accepting")
                  : t("requests.acceptRequest")}
              </button>
            )}

          {request.created_by_user_id === user.user_id &&
            (request.status === "new" || request.status === "offered") && (
              <button
                onClick={handleCancelRequest}
                disabled={cancelling}
                className="w-full mt-3 py-3 rounded-lg font-medium flex items-center justify-center gap-2 border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="cancel-request-btn"
              >
                <XCircle className="w-5 h-5" />
                {cancelling
                  ? t("requestDetail.cancelling")
                  : t("requestDetail.cancelRequest")}
              </button>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
}
