import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle, X } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { StatusBadge } from "../components/SharedComponents";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function RequestDetail() {
  const [user, setUser] = useState(null);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch(`${API}/auth/me`, { credentials: "include" });
        const userData = await userResponse.json();
        setUser(userData);
        
        const requestResponse = await fetch(`${API}/requests/${id}`, { credentials: "include" });
        const requestData = await requestResponse.json();
        setRequest(requestData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const handleAcceptRequest = async () => {
    setAccepting(true);
    try {
      const response = await fetch(`${API}/requests/${id}/offer`, {
        method: "POST",
        credentials: "include"
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "فشل قبول الطلب");
      }
      
      alert("تم قبول الطلب بنجاح!");
      navigate("/assignments");
    } catch (error) {
      alert(error.message);
    } finally {
      setAccepting(false);
    }
  };
  
  const sidebarItems = user ? [
    { icon: ArrowRight, label: "عودة", onClick: () => navigate(-1) }
  ] : [];
  
  if (loading || !user || !request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const serviceTypeLabels = {
    substitute: "معلم بديل",
    remote_school: "مدرسة عن بعد",
    special_education: "تعليم شامل"
  };
  
  const modeLabels = {
    in_person: "حضوري",
    remote: "عن بعد"
  };
  
  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div className="max-w-3xl mx-auto fade-in" dir="rtl" data-testid="request-detail-page">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">تفاصيل الطلب</h1>
        </div>
        
        <div className="bg-white border border-border rounded-lg p-6 md:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-primary mb-2">{request.subject}</h2>
              <p className="text-muted-foreground">{request.grade}</p>
            </div>
            <StatusBadge status={request.status} />
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">نوع الخدمة:</span>
              <span className="font-medium text-primary">{serviceTypeLabels[request.service_type]}</span>
            </div>
            
            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">طريقة التعليم:</span>
              <span className="font-medium text-primary">{modeLabels[request.mode]}</span>
            </div>
            
            {request.city && (
              <div className="flex justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">المدينة:</span>
                <span className="font-medium text-primary">{request.city}</span>
              </div>
            )}
            
            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">التاريخ والوقت:</span>
              <span className="font-medium text-primary">
                {new Date(request.date_time).toLocaleString('ar-SA')}
              </span>
            </div>
            
            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">تاريخ الإنشاء:</span>
              <span className="font-medium text-primary">
                {new Date(request.created_at).toLocaleDateString('ar-SA')}
              </span>
            </div>
          </div>
          
          {request.notes && (
            <div className="bg-accent rounded-lg p-4 mb-6">
              <h3 className="font-bold text-primary mb-2">ملاحظات:</h3>
              <p className="text-muted-foreground">{request.notes}</p>
            </div>
          )}
          
          {user.role === "teacher" && (request.status === "new" || request.status === "offered") && (
            <button
              onClick={handleAcceptRequest}
              disabled={accepting}
              className="w-full btn-primary py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="accept-request-btn"
            >
              <CheckCircle className="w-5 h-5" />
              {accepting ? "جاري القبول..." : "قبول الطلب"}
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
