"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { id } from "@/locales/id";
import { en } from "@/locales/en";

type Language = "id" | "en";
type Translations = typeof id;

interface I18nContextType {
  lang: Language;
  t: (key: string) => string;
  setLang: (lang: Language) => void;
  mounted: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("id");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedLang = localStorage.getItem(
      "gradtracker_lang",
    ) as Language | null;
    if (storedLang === "id" || storedLang === "en") {
      setLang(storedLang);
    } else {
      // Auto detect from browser
      const browserLang = navigator.language.toLowerCase();
      const detected = browserLang.startsWith("id") ? "id" : "en";
      setLang(detected);
    }
    setMounted(true);
  }, []);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("gradtracker_lang", newLang);
  };

  const getTranslation = (key: string): string => {
    const dict = lang === "id" ? id : en;
    const keys = key.split(".");
    let result: any = dict;
    for (const k of keys) {
      if (result[k] === undefined) {
        return key; // return key if not found
      }
      result = result[k];
    }
    return result as string;
  };

  return (
    <I18nContext.Provider
      value={{
        lang,
        t: getTranslation,
        setLang: handleSetLang,
        mounted,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
