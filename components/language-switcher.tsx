'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/app/context/language-context';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function LanguageSwitcher() {
  const { t, language, setLanguage } = useLanguage();

  // ✅ penting: tunggu client mount dulu
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ jangan render dynamic text saat SSR
  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="gap-2">
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">...</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          aria-label={t('common.language')}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{language.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuCheckboxItem
          checked={language === 'en'}
          onCheckedChange={() => setLanguage('en')}
        >
          English
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={language === 'id'}
          onCheckedChange={() => setLanguage('id')}
        >
          Bahasa Indonesia
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
