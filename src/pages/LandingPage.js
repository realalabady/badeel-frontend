import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  Users,
  GraduationCap,
  CheckCircle,
  Menu,
  X,
} from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function LandingPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-background"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-primary">
              {t("brand.name")}
            </span>
          </div>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 text-primary hover:bg-accent rounded-lg transition-colors"
              data-testid="header-login-btn"
            >
              {t("nav.login")}
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="btn-primary px-6 py-2 rounded-lg"
              data-testid="header-signup-btn"
            >
              {t("nav.signup")}
            </button>
          </div>
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 hover:bg-accent rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white px-4 py-4 space-y-3">
            <LanguageSwitcher />
            <button
              onClick={() => {
                navigate("/login");
                setMobileMenuOpen(false);
              }}
              className="w-full text-start px-4 py-2 text-primary hover:bg-accent rounded-lg transition-colors"
            >
              {t("nav.login")}
            </button>
            <button
              onClick={() => {
                navigate("/signup");
                setMobileMenuOpen(false);
              }}
              className="w-full btn-primary px-4 py-2 rounded-lg"
            >
              {t("nav.signup")}
            </button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section
        className="hero-gradient text-white py-24 relative overflow-hidden"
        data-testid="hero-section"
      >
        {/* Decorative circles */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 right-10 w-20 h-20 bg-white/10 rounded-full"></div>
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-start">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t("landing.heroTitle")}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl">
              {t("landing.heroSubtitle")}
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="btn-secondary px-8 py-3 rounded-lg text-lg font-medium"
              data-testid="hero-cta-btn"
            >
              {t("landing.getStarted")}
            </button>
          </div>
          {/* Hero Illustration */}
          <div className="flex-1 flex justify-center">
            <svg
              viewBox="0 0 400 300"
              className="w-full max-w-md"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Desk */}
              <rect
                x="80"
                y="200"
                width="240"
                height="12"
                rx="6"
                fill="white"
                fillOpacity="0.2"
              />
              {/* Laptop */}
              <rect
                x="140"
                y="140"
                width="120"
                height="60"
                rx="8"
                fill="white"
                fillOpacity="0.3"
              />
              <rect
                x="148"
                y="148"
                width="104"
                height="44"
                rx="4"
                fill="white"
                fillOpacity="0.15"
              />
              <rect
                x="120"
                y="200"
                width="160"
                height="8"
                rx="4"
                fill="white"
                fillOpacity="0.25"
              />
              {/* Person 1 - Teacher */}
              <circle
                cx="120"
                cy="100"
                r="20"
                fill="white"
                fillOpacity="0.35"
              />
              <rect
                x="105"
                y="120"
                width="30"
                height="40"
                rx="10"
                fill="white"
                fillOpacity="0.25"
              />
              {/* Person 2 - Student */}
              <circle cx="280" cy="110" r="18" fill="white" fillOpacity="0.3" />
              <rect
                x="267"
                y="128"
                width="26"
                height="36"
                rx="8"
                fill="white"
                fillOpacity="0.2"
              />
              {/* Book */}
              <rect
                x="60"
                y="170"
                width="30"
                height="40"
                rx="3"
                fill="white"
                fillOpacity="0.2"
                transform="rotate(-10 60 170)"
              />
              {/* Graduation cap */}
              <polygon
                points="300,70 330,85 300,100 270,85"
                fill="white"
                fillOpacity="0.3"
              />
              <rect
                x="296"
                y="60"
                width="8"
                height="15"
                fill="white"
                fillOpacity="0.3"
              />
              {/* Connection lines */}
              <path
                d="M140 110 Q200 60 260 110"
                stroke="white"
                strokeOpacity="0.2"
                strokeWidth="2"
                strokeDasharray="6 4"
                fill="none"
              />
              {/* Stars */}
              <circle cx="50" cy="60" r="3" fill="white" fillOpacity="0.4" />
              <circle cx="350" cy="50" r="2" fill="white" fillOpacity="0.3" />
              <circle
                cx="320"
                cy="160"
                r="2.5"
                fill="white"
                fillOpacity="0.35"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        className="py-16 md:py-24 bg-white"
        data-testid="services-section"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
            {t("landing.servicesTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className="card-hover bg-white border border-border rounded-xl p-8 text-center"
              data-testid="service-substitute"
            >
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary">
                {t("landing.service1Title")}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t("landing.service1Desc")}
              </p>
            </div>

            <div
              className="card-hover bg-white border border-border rounded-xl p-8 text-center"
              data-testid="service-remote-school"
            >
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary">
                {t("landing.service2Title")}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t("landing.service2Desc")}
              </p>
            </div>

            <div
              className="card-hover bg-white border border-border rounded-xl p-8 text-center"
              data-testid="service-inclusive"
            >
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary">
                {t("landing.service3Title")}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t("landing.service3Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="py-16 md:py-24 bg-accent"
        data-testid="features-section"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
            {t("landing.whyTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2 text-primary">
                  {t("landing.feature1Title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("landing.feature1Desc")}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2 text-primary">
                  {t("landing.feature2Title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("landing.feature2Desc")}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2 text-primary">
                  {t("landing.feature3Title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("landing.feature3Desc")}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2 text-primary">
                  {t("landing.feature4Title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("landing.feature4Desc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-16 bg-primary text-white"
        data-testid="cta-section"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t("landing.ctaTitle")}
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            {t("landing.ctaSubtitle")}
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="btn-secondary px-8 py-3 rounded-lg text-lg font-medium"
            data-testid="cta-signup-btn"
          >
            {t("landing.ctaButton")}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground space-y-2">
          <div className="flex justify-center gap-4 text-sm">
            <a href="/terms" className="hover:text-primary transition-colors">
              {t("terms.title")}
            </a>
            <span>&middot;</span>
            <a href="/privacy" className="hover:text-primary transition-colors">
              {t("privacy.title")}
            </a>
          </div>
          <p>{t("landing.footer")}</p>
        </div>
      </footer>
    </div>
  );
}
