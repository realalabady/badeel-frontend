import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../components/DashboardLayout";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CreateRequest() {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [formData, setFormData] = useState({
    service_type: "substitute",
    subject: "",
    grade: "",
    mode: "remote",
    city: "",
    date_time: "",
    notes: "",
    school_type: "",
    education_stage: "",
    coverage_start: "",
    coverage_end: "",
    coverage_duration: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API}/auth/me`, {
          credentials: "include",
        });
        const userData = await response.json();
        setUser(userData);

        // Auto-set service_type based on role
        if (userData.role === "student" || userData.role === "guardian") {
          setFormData((prev) => ({ ...prev, service_type: "private_lesson" }));
        } else if (userData.role === "school_admin") {
          setFormData((prev) => ({ ...prev, service_type: "substitute" }));
        }

        // Fetch school info for school admins
        if (userData.role === "school_admin") {
          const schoolsRes = await fetch(`${API}/schools`, {
            credentials: "include",
          });
          if (schoolsRes.ok) {
            const schoolsData = await schoolsRes.json();
            const mySchool = schoolsData.find(
              (s) => s.admin_user_id === userData.user_id,
            );
            if (mySchool) setSchool(mySchool);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Strip empty optional fields
      const payload = { ...formData };
      [
        "school_type",
        "education_stage",
        "coverage_start",
        "coverage_end",
        "coverage_duration",
        "grade",
        "date_time",
        "school_name",
      ].forEach((k) => {
        if (!payload[k]) delete payload[k];
      });

      const response = await fetch(`${API}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 403 && user?.role === "school_admin") {
          throw new Error(t("schoolSubscription.subscriptionRequired"));
        }
        throw new Error(data.detail || t("common.error"));
      }

      const data = await response.json();
      navigate(`/requests/${data.request_id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background"
        dir="rtl"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div
        className="max-w-3xl mx-auto fade-in"
        dir="rtl"
        data-testid="create-request-page"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {t("requests.createRequest")}
          </h1>
          <p className="text-muted-foreground">{t("requests.fillForm")}</p>
        </div>

        <div className="bg-white border border-border rounded-lg p-6 md:p-8">
          {error && (
            <div
              className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 mb-6 text-sm"
              data-testid="error-message"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service type — hidden for student/guardian/school_admin (auto-set) */}
            {user && !["student", "guardian", "school_admin"].includes(user.role) && (
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">
                {t("requests.serviceType")}
              </label>
              <select
                name="service_type"
                value={formData.service_type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right bg-white"
                required
                data-testid="service-type-select"
              >
                <option value="substitute">
                  {t("serviceTypes.substitute")}
                </option>
                <option value="remote_school">
                  {t("serviceTypes.remote_school")}
                </option>
                <option value="special_education">
                  {t("serviceTypes.special_education")}
                </option>
                <option value="private_lesson">
                  {t("serviceTypes.private_lesson")}
                </option>
              </select>
            </div>
            )}

            {/* School info banner for substitute requests */}
            {formData.service_type === "substitute" && school && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">
                    {t("substitute.schoolInfo")}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">
                      {t("school.name")}:{" "}
                    </span>
                    <span className="text-blue-600">{school.name}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">
                      {t("school.city")}:{" "}
                    </span>
                    <span className="text-blue-600">{school.city}</span>
                  </div>
                  {school.school_type && (
                    <div>
                      <span className="text-blue-700 font-medium">
                        {t("school.schoolType")}:{" "}
                      </span>
                      <span className="text-blue-600">
                        {t(`substitute.${school.school_type}`)}
                      </span>
                    </div>
                  )}
                  {school.education_stage && (
                    <div>
                      <span className="text-blue-700 font-medium">
                        {t("school.educationStage")}:{" "}
                      </span>
                      <span className="text-blue-600">
                        {t(`substitute.${school.education_stage}`)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-primary">
                {t("requests.subject")}
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right bg-white"
                required
                data-testid="subject-input"
              >
                <option value="">
                  {t("profile.specializationPlaceholder")}
                </option>
                {[
                  "math",
                  "arabic",
                  "english",
                  "science",
                  "physics",
                  "chemistry",
                  "biology",
                  "history",
                  "islamicStudies",
                ].map((key) => (
                  <option key={key} value={key}>
                    {t(`browseTeachers.specs.${key}`)}
                  </option>
                ))}
              </select>
            </div>

            {formData.service_type !== "substitute" && (
              <div>
                <label className="block text-sm font-medium mb-2 text-primary">
                  {t("requests.grade")}
                </label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right bg-white"
                  required
                  data-testid="grade-input"
                >
                  <option value="">{t("profile.gradesPlaceholder")}</option>
                  {["elementary", "middle", "high", "university"].map((key) => (
                    <option key={key} value={key}>
                      {t(`browseTeachers.grades.${key}`)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-primary">
                {t("requests.mode")}
              </label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right bg-white"
                required
                data-testid="mode-select"
              >
                <option value="remote">{t("modes.remote")}</option>
                <option value="in_person">{t("modes.in_person")}</option>
              </select>
            </div>

            {/* Substitute-specific fields */}
            {formData.service_type === "substitute" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-primary">
                      {t("substitute.coverageStart")} *
                    </label>
                    <input
                      type="date"
                      name="coverage_start"
                      value={formData.coverage_start}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-primary">
                      {t("substitute.coverageEnd")} *
                    </label>
                    <input
                      type="date"
                      name="coverage_end"
                      value={formData.coverage_end}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-primary">
                    {t("substitute.coverageDuration")}
                  </label>
                  <input
                    type="text"
                    name="coverage_duration"
                    value={formData.coverage_duration}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right"
                    placeholder={t("substitute.coverageDurationPlaceholder")}
                  />
                </div>
              </>
            )}

            {formData.service_type !== "substitute" &&
              formData.mode !== "remote" && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-primary">
                    {t("requests.cityOptional")}
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right"
                    placeholder={t("profile.citiesPlaceholder")}
                    data-testid="city-input"
                  />
                </div>
              )}

            {formData.service_type !== "substitute" && (
              <div>
                <label className="block text-sm font-medium mb-2 text-primary">
                  {t("requests.dateTime")}
                </label>
                <input
                  type="datetime-local"
                  name="date_time"
                  value={formData.date_time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right"
                  required
                  data-testid="datetime-input"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-primary">
                {t("requests.notes")}
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right"
                placeholder={t("requests.notesPlaceholder")}
                data-testid="notes-textarea"
              ></textarea>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="submit-request-btn"
              >
                {loading ? t("requests.sending") : t("requests.sendRequest")}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border-2 border-border hover:bg-accent rounded-lg font-medium transition-colors"
              >
                {t("common.cancel")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
