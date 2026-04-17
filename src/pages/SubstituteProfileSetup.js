import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Save, CheckCircle, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../components/DashboardLayout";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SPECIALIZATION_KEYS = [
  "math",
  "arabic",
  "english",
  "science",
  "physics",
  "chemistry",
  "biology",
  "history",
  "islamicStudies",
];

const STAGE_KEYS = [
  "earlyChildhood",
  "primary",
  "middle",
  "secondary",
  "specialEducation",
];

const STAGE_VALUES = {
  earlyChildhood: "early_childhood",
  primary: "primary",
  middle: "middle",
  secondary: "secondary",
  specialEducation: "special_education",
};

const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday"];

export default function SubstituteProfileSetup() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    specializations: [],
    education_stages: [],
    city: "",
    region: "",
    availability_mode: "both",
    availability_schedule: {},
    bio: "",
    certificate_url: "",
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch(`${API}/auth/me`, {
          credentials: "include",
        });
        const userData = await userRes.json();
        setUser(userData);

        // Load existing profile if any
        const profileRes = await fetch(`${API}/substitute/profile`, {
          credentials: "include",
        });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setFormData({
            specializations: profile.specializations || [],
            education_stages: profile.education_stages || [],
            city: profile.city || "",
            region: profile.region || "",
            availability_mode: profile.availability_mode || "both",
            availability_schedule: profile.availability_schedule || {},
            bio: profile.bio || "",
            certificate_url: profile.certificate_url || "",
          });
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };
    fetchData();
  }, []);

  const toggleArrayItem = (field, value) => {
    setFormData((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  const toggleDay = (day) => {
    setFormData((prev) => ({
      ...prev,
      availability_schedule: {
        ...prev.availability_schedule,
        [day]: !prev.availability_schedule[day],
      },
    }));
  };

  const handleCertificateUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API}/files/upload`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || t("common.error"));
      }
      const data = await res.json();
      setFormData((prev) => ({ ...prev, certificate_url: data.url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.certificate_url) {
      setError(t("substitute.certificateRequired"));
      return;
    }
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch(`${API}/substitute/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || t("common.error"));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
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
          onClick: () => navigate("/substitute"),
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
      <div className="max-w-3xl mx-auto fade-in" dir="rtl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {t("substitute.profile")}
          </h1>
          <p className="text-muted-foreground">{t("substitute.profileDesc")}</p>
        </div>

        <div className="bg-white border border-border rounded-lg p-6 md:p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 mb-6 text-sm">
              {error}
            </div>
          )}
          {saved && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 mb-6 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {t("substitute.profileSaved")}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Specializations */}
            <div>
              <label className="block text-sm font-medium mb-3 text-primary">
                {t("substitute.specializations")}
              </label>
              <div className="flex flex-wrap gap-2">
                {SPECIALIZATION_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleArrayItem("specializations", key)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      formData.specializations.includes(key)
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-primary border-border hover:border-primary"
                    }`}
                  >
                    {t(`browseTeachers.specs.${key}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Education Stages */}
            <div>
              <label className="block text-sm font-medium mb-3 text-primary">
                {t("substitute.educationStages")}
              </label>
              <div className="flex flex-wrap gap-2">
                {STAGE_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      toggleArrayItem("education_stages", STAGE_VALUES[key])
                    }
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      formData.education_stages.includes(STAGE_VALUES[key])
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-primary border-border hover:border-primary"
                    }`}
                  >
                    {t(`substitute.${key}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* City & Region */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-primary">
                  {t("substitute.city")}
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right"
                  placeholder={t("profile.citiesPlaceholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-primary">
                  {t("substitute.region")}
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) =>
                    setFormData({ ...formData, region: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right"
                />
              </div>
            </div>

            {/* Availability Mode */}
            <div>
              <label className="block text-sm font-medium mb-3 text-primary">
                {t("substitute.availabilityMode")}
              </label>
              <div className="flex flex-wrap gap-2">
                {["in_person", "remote", "both"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, availability_mode: mode })
                    }
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      formData.availability_mode === mode
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-primary border-border hover:border-primary"
                    }`}
                  >
                    {t(
                      `substitute.${mode === "in_person" ? "inPerson" : mode === "remote" ? "remote" : "both"}`,
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Schedule */}
            <div>
              <label className="block text-sm font-medium mb-3 text-primary">
                {t("substitute.availabilitySchedule")}
              </label>
              <div className="flex flex-wrap gap-2">
                {DAY_KEYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      formData.availability_schedule[day]
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-primary border-border hover:border-primary"
                    }`}
                  >
                    {t(`substitute.${day}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Certificate Upload (Required) */}
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">
                {t("substitute.certificate")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                {formData.certificate_url ? (
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      {t("substitute.certificateUploaded")}
                    </span>
                    <a
                      href={`${BACKEND_URL}${formData.certificate_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-secondary hover:underline"
                    >
                      {t("substitute.viewCertificate")}
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          certificate_url: "",
                        }))
                      }
                      className="text-sm text-red-500 hover:underline"
                    >
                      {t("common.delete")}
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">
                      {t("substitute.uploadCertificate")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("substitute.certificateFormats")}
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={handleCertificateUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading && (
                      <div className="mt-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
                      </div>
                    )}
                  </label>
                )}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">
                {t("substitute.bio")}
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows="4"
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right"
                placeholder={t("substitute.bioPlaceholder")}
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary py-3 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? t("common.loading") : t("substitute.saveProfile")}
              </button>
              <button
                type="button"
                onClick={() => navigate("/substitute")}
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
