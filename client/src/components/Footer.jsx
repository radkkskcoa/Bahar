import { Link } from 'react-router-dom';
import { ChefHat, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { FOOTER_LINKS, NAV_LINKS } from '../lib/nav.js';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';

export default function Footer() {
  const { brand, contact, settings } = useCatalog();
  const { t } = useI18n();

  return (
    <footer className="mt-16 border-t border-line bg-soft">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand text-white">
              <ChefHat className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-base font-extrabold">{brand.name}</span>
          </div>
          <p className="text-sm text-ink-muted">{brand.description}</p>
          {settings.brand?.demo_mode ? (
            <p className="rounded-xl border border-line bg-elevate px-3 py-2 text-[11px] text-ink-muted">
              {t('common.demoNotice')}
            </p>
          ) : null}
        </div>

        <nav className="space-y-2" aria-label="Menu links">
          <h3 className="text-sm font-bold uppercase tracking-wide text-lime">Menu</h3>
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="block text-sm text-ink-soft hover:text-white">
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <nav className="space-y-2" aria-label="Support links">
          <h3 className="text-sm font-bold uppercase tracking-wide text-lime">Support</h3>
          {FOOTER_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="block text-sm text-ink-soft hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-lime">Visit &amp; contact</h3>
          <p className="flex items-start gap-2 text-sm text-ink-soft">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
            {contact.address}
          </p>
          <p className="flex items-center gap-2 text-sm text-ink-soft">
            <Phone className="h-4 w-4 text-brand" aria-hidden="true" />
            {contact.phone}
          </p>
          <p className="flex items-center gap-2 text-sm text-ink-soft">
            <Mail className="h-4 w-4 text-brand" aria-hidden="true" />
            {contact.email}
          </p>
          <div className="space-y-1 text-xs text-ink-muted">
            <p className="flex items-center gap-2 font-semibold text-ink-soft">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              Opening hours
            </p>
            {(contact.hours ?? []).map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-line py-4">
        <div className="container-page flex flex-col items-center justify-between gap-2 text-xs text-ink-muted sm:flex-row">
          <p>© {new Date().getFullYear()} {brand.name}. Demonstration project.</p>
          <p>{settings.languages?.length ? `Available in ${settings.languages.join(' · ').toUpperCase()}` : null}</p>
        </div>
      </div>
    </footer>
  );
}
