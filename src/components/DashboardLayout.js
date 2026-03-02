import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogOut, Menu, X, GraduationCap } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function DashboardLayout({ children, user, sidebarItems }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };
  
  const getRoleLabel = (role) => {
    return t(`roles.${role}`);
  };
  
  return (
    <div className="min-h-screen bg-background" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top Bar */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
              data-testid="menu-toggle"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-primary">{t('brand.name')}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-primary">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{getRoleLabel(user?.role)}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">{t('common.logout')}</span>
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 ${i18n.language === 'ar' ? 'right-0' : 'left-0'} h-screen bg-white border-${i18n.language === 'ar' ? 'l' : 'r'} border-border
          w-64 transition-transform duration-300 z-30 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : (i18n.language === 'ar' ? 'translate-x-full' : '-translate-x-full')}
        `}>
          <nav className="p-4 space-y-2 mt-16 lg:mt-4">
            {sidebarItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setSidebarOpen(false);
                }}
                className={`sidebar-link w-full ${item.active ? 'active' : ''}`}
                data-testid={`sidebar-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
