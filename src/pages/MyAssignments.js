import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { AssignmentCard } from "../components/SharedComponents";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function MyAssignments() {
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch(`${API}/auth/me`, { credentials: "include" });
        const userData = await userResponse.json();
        setUser(userData);
        
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
  }, []);
  
  const sidebarItems = user ? [
    { icon: BookOpen, label: "عودة لللوحة", onClick: () => navigate(user.role === "teacher" ? "/teacher" : "/student") }
  ] : [];
  
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const handleViewDetails = (assignmentId) => {
    // For simplicity, showing assignment details inline
    alert(`عرض تفاصيل الجلسة: ${assignmentId}`);
  };
  
  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div className="fade-in" dir="rtl" data-testid="my-assignments-page">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">جلساتي التعليمية</h1>
          <p className="text-muted-foreground">عرض وإدارة جلساتك</p>
        </div>
        
        {assignments.length === 0 ? (
          <div className="bg-white border border-border rounded-lg p-12 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">لا توجد جلسات حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
              <AssignmentCard
                key={assignment.assignment_id}
                assignment={assignment}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
