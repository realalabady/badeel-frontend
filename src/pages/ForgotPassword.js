import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, Key, Lock, ArrowRight, CheckCircle } from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = email, 2 = code + new password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || t("common.error"));
      }

      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError(t("forgotPassword.passwordMismatch"));
      return;
    }

    if (newPassword.length < 6) {
      setError(t("forgotPassword.passwordTooShort"));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, new_password: newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || t("common.error"));
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-background"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">
          {t("brand.name")}
        </Link>
        <LanguageSwitcher />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white border border-border rounded-lg p-8 shadow-sm">
            {success ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-primary mb-2">
                  {t("forgotPassword.successTitle")}
                </h1>
                <p className="text-muted-foreground mb-6">
                  {t("forgotPassword.successMessage")}
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="btn-primary w-full py-3 rounded-lg font-medium"
                >
                  {t("forgotPassword.goToLogin")}
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Key className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-primary mb-2">
                    {t("forgotPassword.title")}
                  </h1>
                  <p className="text-muted-foreground">
                    {step === 1
                      ? t("forgotPassword.step1Description")
                      : t("forgotPassword.step2Description")}
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 mb-4 text-sm">
                    {error}
                  </div>
                )}

                {step === 1 ? (
                  <form onSubmit={handleSendCode} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-primary">
                        {t("auth.email")}
                      </label>
                      <div className="relative">
                        <Mail
                          className={`absolute top-3 w-5 h-5 text-muted-foreground ${
                            isRTL ? "right-3" : "left-3"
                          }`}
                        />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full px-10 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                            isRTL ? "pr-10" : "pl-10"
                          }`}
                          placeholder={t("auth.emailPlaceholder")}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full btn-primary py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        t("common.loading")
                      ) : (
                        <>
                          {t("forgotPassword.sendCode")}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-primary">
                        {t("forgotPassword.code")}
                      </label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-center text-2xl tracking-widest"
                        placeholder="000000"
                        maxLength={6}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("forgotPassword.codeHint")}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-primary">
                        {t("forgotPassword.newPassword")}
                      </label>
                      <div className="relative">
                        <Lock
                          className={`absolute top-3 w-5 h-5 text-muted-foreground ${
                            isRTL ? "right-3" : "left-3"
                          }`}
                        />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={`w-full px-10 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                            isRTL ? "pr-10" : "pl-10"
                          }`}
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-primary">
                        {t("forgotPassword.confirmPassword")}
                      </label>
                      <div className="relative">
                        <Lock
                          className={`absolute top-3 w-5 h-5 text-muted-foreground ${
                            isRTL ? "right-3" : "left-3"
                          }`}
                        />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full px-10 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                            isRTL ? "pr-10" : "pl-10"
                          }`}
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full btn-primary py-3 rounded-lg font-medium disabled:opacity-50"
                    >
                      {loading
                        ? t("common.loading")
                        : t("forgotPassword.resetPassword")}
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full text-primary text-sm hover:underline"
                    >
                      {t("forgotPassword.resendCode")}
                    </button>
                  </form>
                )}

                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="text-primary hover:underline text-sm"
                  >
                    {t("forgotPassword.backToLogin")}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
