'use client'

import {useLocale} from 'next-intl';
import {useRouter, usePathname} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Globe} from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: string) => {
    // Replace the locale in the pathname
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-gray-600" />
      <Button
        variant={locale === 'zh' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchLanguage('zh')}
      >
        中文
      </Button>
      <Button
        variant={locale === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchLanguage('en')}
      >
        EN
      </Button>
    </div>
  );
} 