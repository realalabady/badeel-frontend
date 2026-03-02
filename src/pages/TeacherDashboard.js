import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BarChart, FileText, BookOpen, User } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { RequestCard } from "../components/SharedComponents";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function TeacherDashboard() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [assignments, setAssignments] = useState([]);
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
        
        const requestsResponse = await fetch(`${API}/requests`, { credentials: "include" });
        const requestsData = await requestsResponse.json();
        setRequests(requestsData.slice(0, 6));
        
        const assignmentsResponse = await fetch(`${API}/assignments`, { credentials: "include" });
        const assignmentsData = await assignmentsResponse.json();
        setAssignments(assignmentsData);
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
    { icon: FileText, label: "الطلبات المتاحة", onClick: () => navigate("/requests") },
    { icon: BookOpen, label: "جلساتي", onClick: () => navigate("/assignments") },
    { icon: User, label: "ملفي الشخصي", onClick: () => navigate("/profile") }
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
      <div className="fade-in" data-testid="teacher-dashboard">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">لوحة تحكم المعلم</h1>
          <p className="text-muted-foreground">مرحباً بك يا {user.name}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-1">الطلبات المتاحة</p>
            <p className="text-3xl font-bold text-primary">{requests.length}</p>
          </div>
          <div className="bg-white border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-1">جلساتي الحالية</p>
            <p className="text-3xl font-bold text-secondary">{assignments.filter(a => a.status !== 'completed').length}</p>
          </div>
          <div className="bg-white border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-1">جلسات مكتملة</p>
            <p className="text-3xl font-bold text-green-600">{assignments.filter(a => a.status === 'completed').length}</p>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-primary">الطلبات المتاحة</h2>
            <button
              onClick={() => navigate("/requests")}
              className="text-secondary hover:underline text-sm font-medium"
            >
              عرض الكل
            </button>
          </div>
          
          {requests.length === 0 ? (
            <div className="bg-white border border-border rounded-lg p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد طلبات متاحة حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request) => (
                <RequestCard
                  key={request.request_id}
                  request={request}
                  onViewDetails={(id) => navigate(`/requests/${id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
