import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Save } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ProfileSetup() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    specialization: "",
    grades: [],
    cities: [],
    availability: "",
    remote_enabled: true,
    in_person_enabled: true,
    bio: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch(`${API}/auth/me`, { credentials: "include" });
        const userData = await userResponse.json();
        setUser(userData);
        
        if (userData.role === "teacher") {
          try {
            const profileResponse = await fetch(`${API}/teachers/profile`, { credentials: "include" });
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              setFormData({
                specialization: profileData.specialization || "",
                grades: profileData.grades || [],
                cities: profileData.cities || [],
                availability: profileData.availability || "",
                remote_enabled: profileData.remote_enabled !== false,
                in_person_enabled: profileData.in_person_enabled !== false,
                bio: profileData.bio || ""
              });
            }
          } catch (e) {
            // Profile doesn't exist yet
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchData();
  }, []);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (name === "grades" || name === "cities") {
      setFormData({ ...formData, [name]: value.split(",").map(v => v.trim()).filter(v => v) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await fetch(`${API}/teachers/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "فشل حفظ الملف الشخصي");
      }
      
      setSuccess("تم حفظ الملف الشخصي بنجاح!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const sidebarItems = user ? [
    { icon: User, label: "عودة لللوحة", onClick: () => navigate("/teacher") }
  ] : [];
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (user.role !== "teacher") {
    return (
      <DashboardLayout user={user} sidebarItems={[]}>
        <div className="max-w-3xl mx-auto text-center py-12">
          <p className="text-muted-foreground">هذه الصفحة متاحة للمعلمين فقط</p>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div className="max-w-3xl mx-auto fade-in" dir="rtl" data-testid="profile-setup-page">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">ملفي الشخصي</h1>
          <p className="text-muted-foreground">قم بتحديث معلوماتك الشخصية</p>
        </div>
        
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
              <label className="block text-sm font-medium mb-2 text-primary">التخصص</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right"
                placeholder="مثلاً: رياضيات"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">الصفوف (مفصولة بفواصل)</label>
              <input
                type="text"
                name="grades"
                value={formData.grades.join(", ")}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right"
                placeholder="مثلاً: العاشر, الحادي عشر, الثاني عشر"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">المدن (مفصولة بفواصل)</label>
              <input
                type="text"
                name="cities"
                value={formData.cities.join(", ")}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right"
                placeholder="مثلاً: الرياض, جدة, الدمام"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">التوفر</label>
              <input
                type="text"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right"
                placeholder="مثلاً: الأحد إلى الخميس 8ص - 3م"
                required
              />
            </div>
            
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="remote_enabled"
                  checked={formData.remote_enabled}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-primary">تعليم عن بعد</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="in_person_enabled"
                  checked={formData.in_person_enabled}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-primary">تعليم حضوري</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">نبذة عني</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right"
                placeholder="اكتب نبذة مختصرة عنك..."
              ></textarea>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="save-profile-btn"
            >
              <Save className="w-5 h-5" />
              {loading ? "جاري الحفظ..." : "حفظ الملف الشخصي"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
