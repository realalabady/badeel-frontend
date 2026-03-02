import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BarChart, Users, FileText, BookOpen, Plus } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { StatsCard } from "../components/SharedComponents";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function SchoolAdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (location.state?.user) {
          setUser(location.state.user);
        } else {
          const userResponse = await fetch(`${API}/auth/me`, { credentials: "include" });
          const userData = await userResponse.json();
          setUser(userData);
        }
        
        const statsResponse = await fetch(`${API}/reports/stats`, { credentials: "include" });
        const statsData = await statsResponse.json();
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [location.state]);
  
  const sidebarItems = [
    { icon: BarChart, label: "لوحة التحكم", onClick: () => {}, active: true },
    { icon: FileText, label: "الطلبات", onClick: () => navigate("/requests") },
    { icon: Plus, label: "طلب جديد", onClick: () => navigate("/requests/new") },
    { icon: Users, label: "المعلمين", onClick: () => {} }
  ];
  
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }
  
  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div className="fade-in" data-testid="school-admin-dashboard">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">لوحة تحكم المدرسة</h1>
          <p className="text-muted-foreground">مرحباً بك يا {user.name}</p>
        </div>
        
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="إجمالي الطلبات"
              value={stats.total_requests}
              icon={FileText}
              color="primary"
            />
            <StatsCard
              title="المعلمين المتاحين"
              value={stats.active_teachers}
              icon={Users}
              color="secondary"
            />
            <StatsCard
              title="الطلبات المعلقة"
              value={stats.pending_requests}
              icon={BookOpen}
              color="warning"
            />
          </div>
        )}
        
        <div className="bg-white border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-primary mb-4">إجراءات سريعة</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/requests/new")}
              className="btn-primary p-4 rounded-lg text-right flex items-center justify-between group"
              data-testid="create-request-btn"
            >
              <div>
                <h3 className="font-bold mb-1">إنشاء طلب جديد</h3>
                <p className="text-sm text-white/80">طلب معلم بديل أو خدمة تعليمية</p>
              </div>
              <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
            
            <button
              onClick={() => navigate("/requests")}
              className="btn-secondary p-4 rounded-lg text-right flex items-center justify-between group"
            >
              <div>
                <h3 className="font-bold mb-1">عرض الطلبات</h3>
                <p className="text-sm text-primary/80">متابعة حالة الطلبات</p>
              </div>
              <FileText className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
