'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Logo } from '@/components/ui/logo'
import { Mail, MapPin, Phone, Clock } from 'lucide-react'

export function Footer() {
  const t = useTranslations()
  const locale = useLocale()

  const quickLinks = [
    { href: `/${locale}`, label: t('nav.home') },
    { href: `/${locale}/products`, label: t('nav.products') },
    { href: `/${locale}/refrigerant-lookup`, label: t('nav.refrigerantLookup') },
    { href: `/${locale}/about`, label: t('nav.about') },
    { href: `/${locale}/contact`, label: t('nav.contact') },
  ]

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Logo size="lg" className="mb-4" />
            <p className="text-sm">
              {t('home.hero.subtitle')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5" />
                <div>
                  <p>{t('contact.phoneValue')}</p>
                  <p className="text-xs">{t('contact.fax')}</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5" />
                <a href={`mailto:${t('contact.emailValue')}`} className="hover:text-white">
                  {t('contact.emailValue')}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <p>{t('contact.addressValue')}</p>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5" />
                <p>{t('footer.hours')}</p>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('contact.hours')}</h3>
            <p className="text-sm">{t('contact.hoursWeekday')}</p>
            <p className="text-sm">{t('contact.hoursTime')}</p>
            <div className="mt-4">
              <p className="text-sm">{t('contact.line')}: {t('contact.lineValue')}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
} 