import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };
  
  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
      data-testid="language-switcher"
      title={i18n.language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
    >
      <Globe className="w-5 h-5 text-primary" />
      <span className="text-sm font-medium text-primary">
        {i18n.language === 'ar' ? 'EN' : 'ع'}
      </span>
    </button>
  );
}
