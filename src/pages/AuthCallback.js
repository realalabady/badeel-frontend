import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AuthCallback() {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);
  const { t, i18n } = useTranslation();
  
  useEffect(() => {
    // Prevent duplicate processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;
    
    const processSession = async () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));
      const sessionId = params.get('session_id');
      
      if (!sessionId) {
        navigate('/login');
        return;
      }
      
      try {
        const response = await fetch(`${API}/auth/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ session_id: sessionId })
        });
        
        if (!response.ok) {
          throw new Error('Failed to exchange session');
        }
        
        const data = await response.json();
        const user = data.user;
        
        // Clear hash
        window.history.replaceState(null, '', window.location.pathname);
        
        // Redirect based on role
        if (user.role === "admin") {
          navigate("/admin", { state: { user }, replace: true });
        } else if (user.role === "school_admin") {
          navigate("/school-admin", { state: { user }, replace: true });
        } else if (user.role === "teacher") {
          navigate("/teacher", { state: { user }, replace: true });
        } else {
          navigate("/student", { state: { user }, replace: true });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login');
      }
    };
    
    processSession();
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    </div>
  );
}
