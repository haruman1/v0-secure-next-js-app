'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import id from '../../locales/id.json';
import en from '../../locales/en.json';

type Language = 'id' | 'en';

const messages = { id, en };

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

// helper ambil nested key: auth.login → json.auth.login
function getValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  /**
   * ✅ Ambil initial state dari localStorage (hanya di client)
   * Lazy initializer → tidak jalan saat SSR render.
   */
  const [language, setLanguage] = useState<Language>('id'); // SSR selalu id

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language | null;
    if (saved) setLanguage(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  /**
   * ✅ Translator function stabil
   */
  const t = (key: string): string => {
    const value = getValue(messages[language], key);
    return value ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
