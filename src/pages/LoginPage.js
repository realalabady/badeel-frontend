import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GraduationCap, Mail, Lock } from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  
  const from = location.state?.from || "/";
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || t('common.error'));
      }
      
      const data = await response.json();
      const user = data.user;
      
      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin", { state: { user } });
      } else if (user.role === "school_admin") {
        navigate("/school-admin", { state: { user } });
      } else if (user.role === "teacher") {
        navigate("/teacher", { state: { user } });
      } else {
        navigate("/student", { state: { user } });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/student';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} data-testid="login-page">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-12 h-12 text-primary" />
            <span className="text-3xl font-bold text-primary">{t('brand.name')}</span>
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">{t('auth.loginTitle')}</h1>
          <p className="text-muted-foreground">{t('brand.tagline')}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-border p-8 shadow-sm">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 mb-6 text-sm" data-testid="error-message">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">{t('auth.email')}</label>
              <div className="relative">
                <Mail className={`absolute ${i18n.language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full ${i18n.language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}
                  placeholder="example@email.com"
                  required
                  data-testid="email-input"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">{t('auth.password')}</label>
              <div className="relative">
                <Lock className={`absolute ${i18n.language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full ${i18n.language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}
                  placeholder="••••••••"
                  required
                  data-testid="password-input"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="login-submit-btn"
            >
              {loading ? t('auth.loggingIn') : t('auth.loginButton')}
            </button>
          </form>
          
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-sm text-muted-foreground">{t('auth.orSeparator')}</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>
          
          <button
            onClick={handleGoogleLogin}
            className="w-full border-2 border-border hover:bg-accent py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            data-testid="google-login-btn"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('auth.googleLogin')}
          </button>
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            {t('auth.noAccount')}{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              {t('auth.signupLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
