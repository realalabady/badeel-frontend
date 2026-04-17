import { useTranslation } from "react-i18next";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <BackArrow className="w-4 h-4" />
          {t("common.back")}
        </button>

        <h1 className="text-3xl font-bold text-primary mb-8">
          {t("privacy.title")}
        </h1>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold text-primary">
              {t("privacy.collection.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("privacy.collection.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary">
              {t("privacy.usage.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("privacy.usage.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary">
              {t("privacy.sharing.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("privacy.sharing.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary">
              {t("privacy.security.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("privacy.security.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary">
              {t("privacy.rights.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("privacy.rights.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary">
              {t("privacy.contact.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("privacy.contact.content")}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
