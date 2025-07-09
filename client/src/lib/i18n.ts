// Basic internationalization setup for French and English
import { fr } from "./translations/fr";
import { en } from "./translations/en";

export const translations = {
  fr,
  en,
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof fr;

let currentLanguage: Language = "fr";

export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
  localStorage.setItem("churchflow_language", lang);
};

export const getLanguage = (): Language => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("churchflow_language") as Language;
    if (stored && translations[stored]) {
      currentLanguage = stored;
      return stored;
    }
  }
  return currentLanguage;
};

export const t = (key: string): string => {
  const lang = getLanguage();
  const currentLangTranslations = translations[lang] as any;
  const fallbackTranslations = translations.fr as any;
  
  return currentLangTranslations?.[key] || fallbackTranslations?.[key] || key;
};

// React hook for translations
import { useState, useEffect } from "react";

export const useTranslation = () => {
  const [language, setCurrentLanguage] = useState<Language>(getLanguage());

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    setCurrentLanguage(lang);
    // Force page reload to ensure all components re-render with new language
    window.location.reload();
  };

  useEffect(() => {
    const currentLang = getLanguage();
    setCurrentLanguage(currentLang);
  }, []);

  // Create a translation function that uses current state
  const translate = (key: string): string => {
    const currentLangTranslations = translations[language] as any;
    const fallbackTranslations = translations.fr as any;
    
    return currentLangTranslations?.[key] || fallbackTranslations?.[key] || key;
  };

  return {
    t: translate,
    language,
    changeLanguage,
  };
};
