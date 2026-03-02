import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CreateRequest() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    service_type: "substitute",
    subject: "",
    grade: "",
    mode: "remote",
    city: "",
    date_time: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API}/auth/me`, { credentials: "include" });
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`${API}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "فشل إنشاء الطلب");
      }
      
      const data = await response.json();
      navigate(`/requests/${data.request_id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const sidebarItems = user ? [
    { icon: ArrowRight, label: "عودة", onClick: () => navigate(-1) }
  ] : [];
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div className="max-w-3xl mx-auto fade-in" dir="rtl" data-testid="create-request-page">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">إنشاء طلب تعليمي</h1>
          <p className="text-muted-foreground">قم بملء النموذج أدناه لطلب معلم</p>
        </div>
        
        <div className="bg-white border border-border rounded-lg p-6 md:p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 mb-6 text-sm" data-testid="error-message">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">نوع الخدمة</label>
              <select
                name="service_type"
                value={formData.service_type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right bg-white"
                required
                data-testid="service-type-select"
              >
                <option value="substitute">معلم بديل</option>
                <option value="remote_school">مدرسة عن بعد</option>
                <option value="special_education">تعليم شامل</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">المادة</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right"
                placeholder="مثلاً: الرياضيات"
                required
                data-testid="subject-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">الصف</label>
              <input
                type="text"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right"
                placeholder="مثلاً: الصف العاشر"
                required
                data-testid="grade-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">طريقة التعليم</label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right bg-white"
                required
                data-testid="mode-select"
              >
                <option value="remote">عن بعد</option>
                <option value="in_person">حضوري</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">المدينة (إذا كان حضوري)</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right"
                placeholder="مثلاً: الرياض"
                data-testid="city-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">التاريخ والوقت</label>
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
            
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">ملاحظات إضافية</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right"
                placeholder="أي معلومات إضافية تريد ذكرها..."
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
                {loading ? "جاري الإنشاء..." : "إرسال الطلب"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border-2 border-border hover:bg-accent rounded-lg font-medium transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
