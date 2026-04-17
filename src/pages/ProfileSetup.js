import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  User,
  Save,
  BookOpen,
  Link2,
  CheckCircle,
  AlertCircle,
  Clock,
  Upload,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ProfileSetup() {
  const [user, setUser] = useState(null);
  const [teacherForm, setTeacherForm] = useState({
    specialization: "",
    grades: [],
    cities: [],
    availability: "",
    remote_enabled: true,
    in_person_enabled: true,
    bio: "",
    education_stages: [],
    certificate_url: "",
    availability_schedule: {},
    region: "",
  });
  const [studentForm, setStudentForm] = useState({
    age: "",
    grade: "",
    preferred_subjects: [],
    special_needs: "",
  });
  const [linkedStudent, setLinkedStudent] = useState(null);
  const [linkStatus, setLinkStatus] = useState("none"); // "none", "pending", "approved"
  const [linkEmail, setLinkEmail] = useState("");
  const [linking, setLinking] = useState(false);
  const [guardianForm, setGuardianForm] = useState({
    relationship: "",
    phone: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isNewProfile, setIsNewProfile] = useState(true);
  const [teacherVerificationStatus, setTeacherVerificationStatus] =
    useState(null);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch(`${API}/auth/me`, {
          credentials: "include",
        });
        const userData = await userResponse.json();
        setUser(userData);

        if (userData.role === "teacher") {
          try {
            const profileResponse = await fetch(`${API}/teachers/profile`, {
              credentials: "include",
            });
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              setIsNewProfile(false);
              setTeacherVerificationStatus(
                profileData.verification_status || "pending",
              );
              setTeacherForm({
                specialization: profileData.specialization || "",
                grades: profileData.grades || [],
                cities: profileData.cities || [],
                availability: profileData.availability || "",
                remote_enabled: profileData.remote_enabled !== false,
                in_person_enabled: profileData.in_person_enabled !== false,
                bio: profileData.bio || "",
                education_stages: profileData.education_stages || [],
                certificate_url: profileData.certificate_url || "",
                availability_schedule: profileData.availability_schedule || {},
                region: profileData.region || "",
              });
            }
          } catch (e) {
            // Profile doesn't exist yet
          }
        } else if (userData.role === "student") {
          try {
            const profileResponse = await fetch(`${API}/students/profile`, {
              credentials: "include",
            });
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              setIsNewProfile(false);
              setStudentForm({
                age: profileData.age || "",
                grade: profileData.grade || "",
                preferred_subjects: profileData.preferred_subjects || [],
                special_needs: profileData.special_needs || "",
              });
            }
          } catch (e) {
            // Profile doesn't exist yet
          }
        } else if (userData.role === "guardian") {
          // Fetch guardian profile
          try {
            const profileResponse = await fetch(`${API}/guardians/profile`, {
              credentials: "include",
            });
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              setIsNewProfile(false);
              setGuardianForm({
                relationship: profileData.relationship || "",
                phone: profileData.phone || "",
                notes: profileData.notes || "",
              });
            }
          } catch (e) {}

          // Fetch link status
          try {
            const linkRes = await fetch(`${API}/guardians/link/status`, {
              credentials: "include",
            });
            if (linkRes.ok) {
              const linkData = await linkRes.json();
              setLinkStatus(linkData.status);
              if (linkData.status === "approved") {
                setLinkedStudent({
                  name: linkData.student_name,
                  email: linkData.student_email,
                });
              }
            }
          } catch (e) {}
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleTeacherChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setTeacherForm({ ...teacherForm, [name]: checked });
    } else if (name === "grades" || name === "cities") {
      setTeacherForm({
        ...teacherForm,
        [name]: value
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v),
      });
    } else {
      setTeacherForm({ ...teacherForm, [name]: value });
    }
  };

  const [uploading, setUploading] = useState(false);

  const toggleEducationStage = (stage) => {
    setTeacherForm((prev) => ({
      ...prev,
      education_stages: prev.education_stages.includes(stage)
        ? prev.education_stages.filter((s) => s !== stage)
        : [...prev.education_stages, stage],
    }));
  };

  const toggleDay = (day) => {
    setTeacherForm((prev) => ({
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
      if (!res.ok) throw new Error(t("common.error"));
      const data = await res.json();
      setTeacherForm((prev) => ({ ...prev, certificate_url: data.url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    if (name === "preferred_subjects") {
      setStudentForm({
        ...studentForm,
        [name]: value
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v),
      });
    } else {
      setStudentForm({ ...studentForm, [name]: value });
    }
  };

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API}/teachers/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(teacherForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || t("common.error"));
      }

      setSuccess(t("profile.saved"));
      // Redirect to dashboard after first-time profile setup
      setTimeout(() => navigate(getDashboardPath()), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API}/students/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...studentForm,
          age: studentForm.age ? parseInt(studentForm.age) : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || t("common.error"));
      }

      setSuccess(t("profile.saved"));
      // Redirect to dashboard after first-time profile setup
      setTimeout(() => navigate(getDashboardPath()), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkStudent = async (e) => {
    e.preventDefault();
    setLinking(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API}/guardians/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ student_email: linkEmail }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || t("common.error"));
      }

      setLinkEmail("");
      setLinkStatus("pending");
      setSuccess(t("guardian.requestSent"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLinking(false);
    }
  };

  const handleGuardianSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API}/guardians/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(guardianForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || t("common.error"));
      }

      setSuccess(t("profile.saved"));
      setTimeout(() => navigate(getDashboardPath()), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDashboardPath = () => {
    if (!user) return "/";
    const map = {
      teacher: "/teacher",
      student: "/student",
      guardian: "/guardian",
      admin: "/admin",
      school_admin: "/school-admin",
    };
    return map[user.role] || "/";
  };

  const sidebarItems = user
    ? [
        {
          icon: User,
          label: t("common.back"),
          onClick: () => navigate(getDashboardPath()),
        },
      ]
    : [];

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div
        className="max-w-3xl mx-auto fade-in"
        dir={isRTL ? "rtl" : "ltr"}
        data-testid="profile-setup-page"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {t("profile.title")}
          </h1>
          <p className="text-muted-foreground">{t("profile.updateInfo")}</p>
        </div>

        {isNewProfile && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              {t("profile.completeProfileBanner")}
            </p>
          </div>
        )}

        {user.role === "teacher" &&
          teacherVerificationStatus === "pending" &&
          !isNewProfile && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 mb-6 flex items-center gap-3">
              <Clock className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">
                {t("profile.pendingApproval")}
              </p>
            </div>
          )}

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

          {/* Teacher Profile Form */}
          {user.role === "teacher" && (
            <form onSubmit={handleTeacherSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-primary">
                  {t("profile.specialization")}
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={teacherForm.specialization}
                  onChange={handleTeacherChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder={isRTL ? "مثلاً: رياضيات" : "e.g., Mathematics"}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-primary">
                  {t("profile.grades")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {["elementary", "middle", "high", "university"].map((key) => {
                    const selected = teacherForm.grades.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setTeacherForm((prev) => ({
                            ...prev,
                            grades: selected
                              ? prev.grades.filter((g) => g !== key)
                              : [...prev.grades, key],
                          }));
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          selected
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-foreground border-border hover:border-primary"
                        }`}
                      >
                        {t(`browseTeachers.grades.${key}`)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-primary">
                  {t("profile.cities")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {["riyadh", "jeddah", "dammam", "mecca", "medina"].map(
                    (key) => {
                      const selected = teacherForm.cities.includes(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setTeacherForm((prev) => ({
                              ...prev,
                              cities: selected
                                ? prev.cities.filter((c) => c !== key)
                                : [...prev.cities, key],
                            }));
                          }}
                          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                            selected
                              ? "bg-primary text-white border-primary"
                              : "bg-white text-foreground border-border hover:border-primary"
                          }`}
                        >
                          {t(`browseTeachers.cities.${key}`)}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-primary">
                  {t("profile.availability")}
                </label>
                <input
                  type="text"
                  name="availability"
                  value={teacherForm.availability}
                  onChange={handleTeacherChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder={
                    isRTL
                      ? "مثلاً: الأحد إلى الخميس 8ص - 3م"
                      : "e.g., Sun-Thu 8AM - 3PM"
                  }
                  required
                />
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="remote_enabled"
                    checked={teacherForm.remote_enabled}
                    onChange={handleTeacherChange}
                    className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-primary">
                    {t("profile.remoteEnabled")}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="in_person_enabled"
                    checked={teacherForm.in_person_enabled}
                    onChange={handleTeacherChange}
                    className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-primary">
                    {t("profile.inPersonEnabled")}
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-primary">
                  {t("profile.bio")}
                </label>
                <textarea
                  name="bio"
                  value={teacherForm.bio}
                  onChange={handleTeacherChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder={t("profile.bioPlaceholder")}
                ></textarea>
              </div>

              {/* Substitute Teaching Section */}
              <div className="border-t border-border pt-6 mt-6">
                <h3 className="text-lg font-semibold text-primary mb-4">
                  {t("substitute.profileSection")}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("substitute.profileSectionDesc")}
                </p>

                <div className="space-y-6">
                  {/* Education Stages */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-primary">
                      {t("substitute.educationStages")}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: "early_childhood", label: "earlyChildhood" },
                        { key: "primary", label: "primary" },
                        { key: "middle", label: "middle" },
                        { key: "secondary", label: "secondary" },
                        { key: "special_education", label: "specialEducation" },
                      ].map(({ key, label }) => {
                        const selected = teacherForm.education_stages.includes(key);
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => toggleEducationStage(key)}
                            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                              selected
                                ? "bg-primary text-white border-primary"
                                : "bg-white text-foreground border-border hover:border-primary"
                            }`}
                          >
                            {t(`substitute.${label}`)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Region */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-primary">
                      {t("substitute.region")}
                    </label>
                    <input
                      type="text"
                      name="region"
                      value={teacherForm.region}
                      onChange={handleTeacherChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder={t("substitute.regionPlaceholder")}
                    />
                  </div>

                  {/* Availability Schedule (Days) */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-primary">
                      {t("substitute.availabilitySchedule")}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["sunday", "monday", "tuesday", "wednesday", "thursday"].map((day) => {
                        const selected = teacherForm.availability_schedule[day];
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                              selected
                                ? "bg-primary text-white border-primary"
                                : "bg-white text-foreground border-border hover:border-primary"
                            }`}
                          >
                            {t(`substitute.${day}`)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Certificate Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-primary">
                      {t("substitute.certificate")}
                    </label>
                    {teacherForm.certificate_url ? (
                      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <a
                          href={teacherForm.certificate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex-1"
                        >
                          {t("common.view")}
                        </a>
                        <button
                          type="button"
                          onClick={() =>
                            setTeacherForm((prev) => ({ ...prev, certificate_url: "" }))
                          }
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          {t("common.delete")}
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                        <Upload className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {uploading ? t("common.loading") : t("substitute.uploadCertificate")}
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          onChange={handleCertificateUpload}
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="save-profile-btn"
              >
                <Save className="w-5 h-5" />
                {loading ? t("common.loading") : t("common.save")}
              </button>
            </form>
          )}

          {/* Guardian: Link Student Section */}
          {user.role === "guardian" && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Link2 className="w-5 h-5" />
                {t("guardian.linkStudent")}
              </h2>

              {linkStatus === "approved" && linkedStudent ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">
                      {linkedStudent.name}
                    </p>
                    <p className="text-sm text-green-600">
                      {linkedStudent.email}
                    </p>
                  </div>
                </div>
              ) : linkStatus === "pending" ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <p className="text-sm font-medium text-amber-800">
                    {t("guardian.pendingApproval")}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLinkStudent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-primary">
                      {t("guardian.studentEmail")}
                    </label>
                    <input
                      type="email"
                      value={linkEmail}
                      onChange={(e) => setLinkEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder={t("guardian.studentEmailPlaceholder")}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("guardian.linkHint")}
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={linking}
                    className="btn-primary px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    <Link2 className="w-4 h-4" />
                    {linking ? t("common.loading") : t("guardian.linkButton")}
                  </button>
                </form>
              )}

              <hr className="my-6 border-border" />
            </div>
          )}

          {/* Guardian Profile Form */}
          {user.role === "guardian" && (
            <form onSubmit={handleGuardianSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-primary">
                  {t("guardian.relationship")}
                </label>
                <select
                  name="relationship"
                  value={guardianForm.relationship}
                  onChange={(e) =>
                    setGuardianForm({
                      ...guardianForm,
                      relationship: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                  required
                >
                  <option value="">{t("guardian.selectRelationship")}</option>
                  <option value="father">{t("guardian.father")}</option>
                  <option value="mother">{t("guardian.mother")}</option>
                  <option value="other">{t("guardian.other")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-primary">
                  {t("guardian.phone")}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={guardianForm.phone}
                  onChange={(e) =>
                    setGuardianForm({ ...guardianForm, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder={t("guardian.phonePlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-primary">
                  {t("guardian.notes")}
                </label>
                <textarea
                  name="notes"
                  value={guardianForm.notes}
                  onChange={(e) =>
                    setGuardianForm({ ...guardianForm, notes: e.target.value })
                  }
                  rows="3"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder={t("guardian.notesPlaceholder")}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="save-profile-btn"
              >
                <Save className="w-5 h-5" />
                {loading ? t("common.loading") : t("common.save")}
              </button>
            </form>
          )}

          {/* Student Profile Form */}
          {user.role === "student" && (
            <form onSubmit={handleStudentSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-primary">
                  {t("profile.age")}
                </label>
                <input
                  type="number"
                  name="age"
                  value={studentForm.age}
                  onChange={(e) =>
                    setStudentForm({
                      ...studentForm,
                      age: e.target.value ? parseInt(e.target.value) : "",
                    })
                  }
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder={t("profile.agePlaceholder")}
                  min="5"
                  max="25"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-primary">
                  {t("profile.grade")}
                </label>
                <select
                  name="grade"
                  value={studentForm.grade}
                  onChange={handleStudentChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                  required
                >
                  <option value="">{t("profile.selectGrade")}</option>
                  <optgroup label={t("profile.primaryStage")}>
                    <option value="grade1p">{t("profile.grade1p")}</option>
                    <option value="grade2p">{t("profile.grade2p")}</option>
                    <option value="grade3p">{t("profile.grade3p")}</option>
                    <option value="grade4p">{t("profile.grade4p")}</option>
                    <option value="grade5p">{t("profile.grade5p")}</option>
                    <option value="grade6p">{t("profile.grade6p")}</option>
                  </optgroup>
                  <optgroup label={t("profile.middleStage")}>
                    <option value="grade1m">{t("profile.grade1m")}</option>
                    <option value="grade2m">{t("profile.grade2m")}</option>
                    <option value="grade3m">{t("profile.grade3m")}</option>
                  </optgroup>
                  <optgroup label={t("profile.highStage")}>
                    <option value="grade1s">{t("profile.grade1s")}</option>
                    <option value="grade2s">{t("profile.grade2s")}</option>
                    <option value="grade3s">{t("profile.grade3s")}</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-primary">
                  {t("profile.preferredSubjects")}
                </label>
                <input
                  type="text"
                  name="preferred_subjects"
                  value={studentForm.preferred_subjects.join(", ")}
                  onChange={handleStudentChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder={
                    isRTL
                      ? "مثلاً: رياضيات, علوم, إنجليزي"
                      : "e.g., Math, Science, English"
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-primary">
                  {t("profile.specialNeeds")}
                </label>
                <textarea
                  name="special_needs"
                  value={studentForm.special_needs}
                  onChange={handleStudentChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder={t("profile.specialNeedsPlaceholder")}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="save-profile-btn"
              >
                <Save className="w-5 h-5" />
                {loading ? t("common.loading") : t("common.save")}
              </button>
            </form>
          )}

          {/* Unsupported role */}
          {user.role !== "teacher" &&
            user.role !== "student" &&
            user.role !== "guardian" && (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {t("profile.noProfileNeeded")}
                </p>
              </div>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
}
