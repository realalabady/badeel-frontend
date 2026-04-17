import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  MapPin,
  BookOpen,
  Monitor,
  User as UserIcon,
  Star,
  Mail,
  FileText,
  CheckCircle,
  Clock,
  GraduationCap,
  Globe,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../components/DashboardLayout";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function TeacherDetail() {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: "include" })
      .then((r) => r.json())
      .then(setUser)
      .catch(() => navigate("/login"));
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchTeacher = async () => {
      try {
        const res = await fetch(`${API}/teachers/${teacherId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error();
        setTeacher(await res.json());
      } catch {
        setTeacher(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [user, teacherId]);

  const sidebarItems = [
    {
      icon: GraduationCap,
      label: t("browseTeachers.title"),
      onClick: () => navigate("/teachers"),
    },
  ];

  if (!user) return null;

  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div className="space-y-6">
        {/* Back button */}
        <button
          onClick={() => navigate("/teachers")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          {t("teacherDetail.backToList")}
        </button>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        ) : !teacher ? (
          <div className="text-center py-12 text-muted-foreground">
            <UserIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t("teacherDetail.notFound")}</p>
          </div>
        ) : (
          <>
            {/* Header Card */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full p-4">
                  <UserIcon className="h-10 w-10 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold">
                      {teacher.name || t("browseTeachers.unknownTeacher")}
                    </h1>
                    {teacher.verification_status === "verified" && (
                      <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        <CheckCircle className="h-3 w-3" />
                        {t("teacherDetail.verified")}
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        teacher.availability === "available"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {teacher.availability === "available"
                        ? t("browseTeachers.available")
                        : t("browseTeachers.busy")}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1">
                    {teacher.specialization}
                  </p>
                  {teacher.average_rating && (
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">
                        {teacher.average_rating}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({teacher.reviews?.length || 0}{" "}
                        {t("reviews.totalReviews")})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bio */}
              {teacher.bio && (
                <div className="bg-card border rounded-lg p-5 md:col-span-2">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {t("teacherDetail.bio")}
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {teacher.bio}
                  </p>
                </div>
              )}

              {/* Teaching Details */}
              <div className="bg-card border rounded-lg p-5">
                <h3 className="font-semibold mb-3">
                  {t("teacherDetail.teachingInfo")}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4 shrink-0" />
                    <span className="font-medium text-foreground">
                      {t("teacherDetail.grades")}:
                    </span>
                    <span>{teacher.grades?.join("، ") || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="font-medium text-foreground">
                      {t("teacherDetail.cities")}:
                    </span>
                    <span>{teacher.cities?.join("، ") || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Monitor className="h-4 w-4 shrink-0" />
                    <span className="font-medium text-foreground">
                      {t("teacherDetail.teachingMode")}:
                    </span>
                    <span>
                      {[
                        teacher.remote_enabled && t("browseTeachers.remote"),
                        teacher.in_person_enabled &&
                          t("browseTeachers.inPerson"),
                      ]
                        .filter(Boolean)
                        .join(" / ")}
                    </span>
                  </div>
                  {teacher.region && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-4 w-4 shrink-0" />
                      <span className="font-medium text-foreground">
                        {t("teacherDetail.region")}:
                      </span>
                      <span>{teacher.region}</span>
                    </div>
                  )}
                  {teacher.education_stages?.length > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-4 w-4 shrink-0" />
                      <span className="font-medium text-foreground">
                        {t("teacherDetail.educationStages")}:
                      </span>
                      <span>{teacher.education_stages.join("، ")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact & Certificate */}
              <div className="bg-card border rounded-lg p-5">
                <h3 className="font-semibold mb-3">
                  {t("teacherDetail.contactInfo")}
                </h3>
                <div className="space-y-3 text-sm">
                  {teacher.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span>{teacher.email}</span>
                    </div>
                  )}
                  {teacher.certificate_url && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <a
                        href={teacher.certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary hover:underline"
                      >
                        {t("teacherDetail.viewCertificate")}
                      </a>
                    </div>
                  )}
                  {teacher.availability_schedule && (
                    <div className="mt-3">
                      <p className="font-medium text-foreground flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4" />
                        {t("teacherDetail.schedule")}
                      </p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        {Object.entries(teacher.availability_schedule).map(
                          ([day, times]) => (
                            <div key={day} className="flex justify-between bg-muted/50 rounded px-2 py-1">
                              <span className="font-medium">{day}</span>
                              <span className="text-muted-foreground">{times}</span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-card border rounded-lg p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Star className="h-4 w-4" />
                {t("teacherDetail.reviews")}
                {teacher.reviews?.length > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({teacher.reviews.length})
                  </span>
                )}
              </h3>
              {!teacher.reviews?.length ? (
                <p className="text-muted-foreground text-sm">
                  {t("reviews.noReviewYet")}
                </p>
              ) : (
                <div className="space-y-4">
                  {teacher.reviews.map((review) => (
                    <div
                      key={review.review_id}
                      className="border-b last:border-0 pb-4 last:pb-0"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3.5 w-3.5 ${
                                s <= review.rating
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString(
                            "ar-SA",
                          )}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">
                          {review.comment}
                        </p>
                      )}
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
