import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, Users, GraduationCap, CheckCircle } from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function LandingPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-primary">{t('brand.name')}</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button onClick={() => navigate('/login')} className="px-6 py-2 text-primary hover:bg-accent rounded-lg transition-colors" data-testid="header-login-btn">
              {t('nav.login')}
            </button>
            <button onClick={() => navigate('/signup')} className="btn-primary px-6 py-2 rounded-lg" data-testid="header-signup-btn">
              {t('nav.signup')}
            </button>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="hero-gradient text-white py-24" data-testid="hero-section">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t('landing.heroTitle')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            {t('landing.heroSubtitle')}
          </p>
          <button onClick={() => navigate('/signup')} className="btn-secondary px-8 py-3 rounded-lg text-lg font-medium" data-testid="hero-cta-btn">
            {t('landing.getStarted')}
          </button>
        </div>
      </section>
      
      {/* Services Section */}
      <section className="py-16 md:py-24 bg-white" data-testid="services-section">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
            {t('landing.servicesTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-hover bg-white border border-border rounded-xl p-8 text-center" data-testid="service-substitute">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary">{t('landing.service1Title')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('landing.service1Desc')}
              </p>
            </div>
            
            <div className="card-hover bg-white border border-border rounded-xl p-8 text-center" data-testid="service-remote-school">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary">{t('landing.service2Title')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('landing.service2Desc')}
              </p>
            </div>
            
            <div className="card-hover bg-white border border-border rounded-xl p-8 text-center" data-testid="service-inclusive">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary">{t('landing.service3Title')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('landing.service3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 md:py-24 bg-accent" data-testid="features-section">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
            {t('landing.whyTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2 text-primary">{t('landing.feature1Title')}</h3>
                <p className="text-muted-foreground">{t('landing.feature1Desc')}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2 text-primary">{t('landing.feature2Title')}</h3>
                <p className="text-muted-foreground">{t('landing.feature2Desc')}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2 text-primary">{t('landing.feature3Title')}</h3>
                <p className="text-muted-foreground">{t('landing.feature3Desc')}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2 text-primary">{t('landing.feature4Title')}</h3>
                <p className="text-muted-foreground">{t('landing.feature4Desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary text-white" data-testid="cta-section">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('landing.ctaTitle')}
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            {t('landing.ctaSubtitle')}
          </p>
          <button onClick={() => navigate('/signup')} className="btn-secondary px-8 py-3 rounded-lg text-lg font-medium" data-testid="cta-signup-btn">
            {t('landing.ctaButton')}
          </button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>{t('landing.footer')}</p>
        </div>
      </footer>
    </div>
  );
}
