import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Filter } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { RequestCard } from "../components/SharedComponents";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function MyRequests() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch(`${API}/auth/me`, { credentials: "include" });
        const userData = await userResponse.json();
        setUser(userData);
        
        const requestsResponse = await fetch(`${API}/requests`, { credentials: "include" });
        const requestsData = await requestsResponse.json();
        setRequests(requestsData);
        setFilteredRequests(requestsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  useEffect(() => {
    if (filterStatus === "all") {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter(r => r.status === filterStatus));
    }
  }, [filterStatus, requests]);
  
  const sidebarItems = user ? [
    { icon: FileText, label: "عودة لللوحة", onClick: () => navigate(user.role === "teacher" ? "/teacher" : user.role === "admin" ? "/admin" : user.role === "school_admin" ? "/school-admin" : "/student") }
  ] : [];
  
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div className="fade-in" dir="rtl" data-testid="my-requests-page">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {user.role === "teacher" ? "الطلبات المتاحة" : "طلباتي"}
          </h1>
          <p className="text-muted-foreground">
            {user.role === "teacher" ? "عرض وقبول الطلبات التعليمية" : "متابعة حالة طلباتك التعليمية"}
          </p>
        </div>
        
        <div className="bg-white border border-border rounded-lg p-4 mb-6 flex items-center gap-4">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <label className="text-sm font-medium text-primary">تصفية:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary text-right bg-white"
            data-testid="filter-status-select"
          >
            <option value="all">الكل</option>
            <option value="new">جديد</option>
            <option value="offered">معروض</option>
            <option value="accepted">مقبول</option>
            <option value="assigned">معيّن</option>
            <option value="in_progress">جاري</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغى</option>
          </select>
          <span className="mr-auto text-sm text-muted-foreground">
            {filteredRequests.length} طلب
          </span>
        </div>
        
        {filteredRequests.length === 0 ? (
          <div className="bg-white border border-border rounded-lg p-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">لا توجد طلبات</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request.request_id}
                request={request}
                onViewDetails={(id) => navigate(`/requests/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
