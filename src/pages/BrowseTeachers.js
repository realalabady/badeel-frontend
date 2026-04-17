import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  BookOpen,
  Monitor,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../components/DashboardLayout";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function BrowseTeachers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [city, setCity] = useState("");
  const [grade, setGrade] = useState("");
  const [gateError, setGateError] = useState("");

  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: "include" })
      .then((r) => r.json())
      .then(setUser)
      .catch(() => navigate("/login"));
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    fetchTeachers();
  }, [user, page, specialization, city, grade]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, per_page: 12 });
      if (search) params.set("search", search);
      if (specialization) params.set("specialization", specialization);
      if (city) params.set("city", city);
      if (grade) params.set("grade", grade);

      const res = await fetch(`${API}/teachers?${params}`, {
        credentials: "include",
      });
      if (res.status === 403) {
        const d = await res.json();
        setGateError(d.detail || t("schoolSubscription.subscriptionRequired"));
        setTeachers([]);
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTeachers(data.items || []);
      setTotalPages(data.total_pages || 1);
    } catch {
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTeachers();
  };

  const sidebarItems = [
    {
      icon: GraduationCap,
      label: t("browseTeachers.title"),
      onClick: () => {},
      active: true,
    },
  ];

  if (!user) return null;

  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("browseTeachers.title")}</h1>

        {gateError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 font-medium mb-3">{t("schoolSubscription.subscriptionRequired")}</p>
            <button onClick={() => navigate("/school-admin")} className="btn-primary px-4 py-2 rounded-lg text-sm">
              {t("schoolSubscription.goToDashboard")}
            </button>
          </div>
        )}

        {!gateError && (
          <>
        {/* Search & Filters */}
        <div className="bg-card rounded-lg border p-4 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("browseTeachers.searchPlaceholder")}
                className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              {t("common.search")}
            </button>
          </form>

          <div className="flex flex-wrap gap-3">
            <select
              value={specialization}
              onChange={(e) => {
                setSpecialization(e.target.value);
                setPage(1);
              }}
              className="border rounded-md px-3 py-2 bg-background text-sm"
            >
              <option value="">{t("browseTeachers.allSpecializations")}</option>
              <option value="رياضيات">{t("browseTeachers.specs.math")}</option>
              <option value="علوم">{t("browseTeachers.specs.science")}</option>
              <option value="لغة عربية">
                {t("browseTeachers.specs.arabic")}
              </option>
              <option value="لغة إنجليزية">
                {t("browseTeachers.specs.english")}
              </option>
              <option value="فيزياء">
                {t("browseTeachers.specs.physics")}
              </option>
              <option value="كيمياء">
                {t("browseTeachers.specs.chemistry")}
              </option>
              <option value="أحياء">{t("browseTeachers.specs.biology")}</option>
              <option value="تاريخ">{t("browseTeachers.specs.history")}</option>
              <option value="جغرافيا">
                {t("browseTeachers.specs.geography")}
              </option>
            </select>

            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPage(1);
              }}
              className="border rounded-md px-3 py-2 bg-background text-sm"
            >
              <option value="">{t("browseTeachers.allCities")}</option>
              <option value="الرياض">
                {t("browseTeachers.cities.riyadh")}
              </option>
              <option value="جدة">{t("browseTeachers.cities.jeddah")}</option>
              <option value="الدمام">
                {t("browseTeachers.cities.dammam")}
              </option>
              <option value="مكة">{t("browseTeachers.cities.makkah")}</option>
              <option value="المدينة">
                {t("browseTeachers.cities.madinah")}
              </option>
            </select>

            <select
              value={grade}
              onChange={(e) => {
                setGrade(e.target.value);
                setPage(1);
              }}
              className="border rounded-md px-3 py-2 bg-background text-sm"
            >
              <option value="">{t("browseTeachers.allGrades")}</option>
              <option value="ابتدائي">
                {t("browseTeachers.grades.elementary")}
              </option>
              <option value="متوسط">{t("browseTeachers.grades.middle")}</option>
              <option value="ثانوي">{t("browseTeachers.grades.high")}</option>
              <option value="جامعي">
                {t("browseTeachers.grades.university")}
              </option>
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <UserIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t("browseTeachers.noResults")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((teacher) => (
              <div
                key={teacher.teacher_id}
                onClick={() => navigate(`/teachers/${teacher.teacher_id}`)}
                className="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <UserIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">
                      {teacher.name || t("browseTeachers.unknownTeacher")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {teacher.specialization}
                    </p>
                  </div>
                </div>

                {teacher.bio && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {teacher.bio}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{teacher.cities?.join(", ") || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{teacher.grades?.join(", ") || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Monitor className="h-3.5 w-3.5" />
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
                </div>

                <div className="mt-3 pt-3 border-t">
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
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-2 border rounded-md disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
              {t("common.back")}
            </button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-2 border rounded-md disabled:opacity-50"
            >
              {t("browseTeachers.next")}
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
