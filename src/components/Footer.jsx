import { useContent } from '../content/ContentContext.jsx'
import { normalizeContactLinks } from '../utils/contactLinks.js'

export default function Footer() {
  const content = useContent()
  const footer = content.footer || {}
  const contact = content.contact || {}
  const site = content.site || {}
  const linkCards = normalizeContactLinks(contact)
  const footerLinks =
    linkCards?.filter((item) => item.id !== 'ig-main' && item.id !== 'tt-main') ??
    null

  return (
    <footer className="border-t border-white/5 bg-[#040c1c] text-slate-400 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="text-lg font-bold text-slate-100">{site.brandName || 'MAXIMA'}</div>
          <p className="mt-2 text-sm">{footer.tagline}</p>
        </div>
        <div className="text-sm space-y-1">
          {footerLinks ? (
            <>
              {footerLinks.slice(0, 8).map((item) => (
                <div key={item.id}>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="inline-block py-1.5 break-words hover:text-cyan-300"
                      target={/^https?:/i.test(item.href) ? '_blank' : undefined}
                      rel={/^https?:/i.test(item.href) ? 'noreferrer' : undefined}
                    >
                      {item.label ? `${item.label}: ` : ''}
                      {item.text || item.href}
                    </a>
                  ) : (
                    <span>
                      {item.label ? `${item.label}: ` : ''}
                      {item.text}
                    </span>
                  )}
                </div>
              ))}
            </>
          ) : (
            <>
              {contact.phone && <div>Тел.: {contact.phone}</div>}
              {contact.email && <div>Email: {contact.email}</div>}
              {contact.address && <div>{contact.address}</div>}
            </>
          )}
          {contact.workingHours && <div className="text-cyan-300/80">{contact.workingHours}</div>}
        </div>
        <div className="text-sm flex flex-wrap md:justify-end gap-x-4 gap-y-2">
          {contact.whatsappUrl && (
            <a
              href={contact.whatsappUrl}
              className="inline-flex items-center min-h-11 py-2 hover:text-cyan-300 touch-manip"
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          )}
          {contact.instagramUrl && (
            <a
              href={contact.instagramUrl}
              className="inline-flex items-center min-h-11 py-2 hover:text-cyan-300 touch-manip"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
          )}
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 text-xs flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <span className="break-words">{footer.copyright}</span>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {footer.showPrivacyLink && (
              <a href={footer.privacyHref} className="inline-flex min-h-10 items-center py-1 hover:text-cyan-300 touch-manip">
                Политика конфиденциальности
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
