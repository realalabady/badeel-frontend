import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, Save, ArrowRight } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function SchoolSetup() {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    contact_email: "",
    school_type: "",
    education_stage: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetchingSchool, setFetchingSchool] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const userResponse = await fetch(`${API}/auth/me`, {
          credentials: "include",
        });
        const userData = await userResponse.json();
        setUser(userData);

        // Check for existing school
        const schoolsResponse = await fetch(`${API}/schools`, {
          credentials: "include",
        });
        if (schoolsResponse.ok) {
          const schoolsData = await schoolsResponse.json();
          // Find school belonging to this admin
          const mySchool = schoolsData.find(
            (s) => s.admin_user_id === userData.user_id,
          );
          if (mySchool) {
            setSchool(mySchool);
            setFormData({
              name: mySchool.name || "",
              city: mySchool.city || "",
              contact_email: mySchool.contact_email || "",
              school_type: mySchool.school_type || "",
              education_stage: mySchool.education_stage || "",
            });
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setFetchingSchool(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API}/schools`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || t("common.error"));
      }

      const newSchool = await response.json();
      setSchool(newSchool);
      setSuccess(t("school.saved"));
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
          onClick: () => navigate("/school-admin"),
        },
      ]
    : [];

  if (!user || fetchingSchool) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user.role !== "school_admin") {
    return (
      <DashboardLayout user={user} sidebarItems={[]}>
        <div
          className="max-w-3xl mx-auto text-center py-12"
          dir={isRTL ? "rtl" : "ltr"}
        >
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{t("school.onlyForAdmins")}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div
        className="max-w-3xl mx-auto fade-in"
        dir={isRTL ? "rtl" : "ltr"}
        data-testid="school-setup-page"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {t("school.setup")}
          </h1>
          <p className="text-muted-foreground">
            {school ? t("school.updateInfo") : t("school.createNew")}
          </p>
        </div>

        {/* Existing School Info */}
        {school && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-8 h-8 text-green-600" />
              <div>
                <h2 className="text-lg font-semibold text-green-800">
                  {school.name}
                </h2>
                <p className="text-sm text-green-600">
                  {t("school.registered")}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-700 font-medium">
                  {t("school.city")}:
                </span>
                <span className="text-green-600 mr-2">{school.city}</span>
              </div>
              <div>
                <span className="text-green-700 font-medium">
                  {t("school.email")}:
                </span>
                <span className="text-green-600 mr-2">
                  {school.contact_email || "-"}
                </span>
              </div>
              {school.school_type && (
                <div>
                  <span className="text-green-700 font-medium">
                    {t("school.schoolType")}:
                  </span>
                  <span className="text-green-600 mr-2">
                    {t(`substitute.${school.school_type}`)}
                  </span>
                </div>
              )}
              {school.education_stage && (
                <div>
                  <span className="text-green-700 font-medium">
                    {t("school.educationStage")}:
                  </span>
                  <span className="text-green-600 mr-2">
                    {t(`substitute.${school.education_stage}`)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* School Form (only show if no school exists) */}
        {!school && (
          <div className="bg-white border border-border rounded-lg p-6 md:p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 mb-6 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 mb-6 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-primary">
                  {t("school.name")} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder={t("school.namePlaceholder")}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-primary">
                  {t("school.city")} *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder={t("school.cityPlaceholder")}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-primary">
                  {t("school.email")}
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder={t("school.emailPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-primary">
                  {t("school.schoolType")} *
                </label>
                <select
                  name="school_type"
                  value={formData.school_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                  required
                >
                  <option value="">{t("substitute.selectSchoolType")}</option>
                  <option value="government">
                    {t("substitute.government")}
                  </option>
                  <option value="private">{t("substitute.private")}</option>
                  <option value="special_education">
                    {t("substitute.specialEdSchool")}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-primary">
                  {t("school.educationStage")} *
                </label>
                <select
                  name="education_stage"
                  value={formData.education_stage}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                  required
                >
                  <option value="">{t("substitute.selectStage")}</option>
                  <option value="early_childhood">
                    {t("substitute.earlyChildhood")}
                  </option>
                  <option value="primary">{t("substitute.primary")}</option>
                  <option value="middle">{t("substitute.middle")}</option>
                  <option value="secondary">{t("substitute.secondary")}</option>
                  <option value="special_education">
                    {t("substitute.specialEducation")}
                  </option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="save-school-btn"
              >
                <Save className="w-5 h-5" />
                {loading ? t("common.loading") : t("school.register")}
              </button>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
