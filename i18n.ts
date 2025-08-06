import {getRequestConfig} from 'next-intl/server';
import {routing} from './src/i18n/routing';
 
export default getRequestConfig(async ({requestLocale}) => {
  // This corresponds to the [locale] segment in src/app/[locale]
  let locale = await requestLocale;
  
  // Ensure that the incoming locale is valid
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
 
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});