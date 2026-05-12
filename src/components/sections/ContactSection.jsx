import { useContent } from '../../content/ContentContext.jsx'
import { useUiString } from '../../i18n/LocaleContext.jsx'
import { normalizeContactLinks } from '../../utils/contactLinks.js'



function isWhatsAppHref(href) {

  return /wa\.me|whatsapp\.com/i.test(href || '')

}



function LinkCard({ item }) {
  const contactFallback = useUiString('contactFallback')
  const isWa = isWhatsAppHref(item.href)

  const isExternal = /^https?:\/\//i.test(item.href)

  const body = (

    <>

      {item.icon && <div className="text-2xl mb-1">{item.icon}</div>}

      <div className="text-xs uppercase tracking-wider text-slate-400">
        {item.label || contactFallback}
      </div>

      <div

        className={`mt-1 text-base font-semibold break-words ${item.href ? 'text-cyan-200 group-hover:text-cyan-100' : 'text-slate-200'}`}

      >

        {item.text || item.href}

      </div>

    </>

  )



  if (item.href) {

    return (

      <a

        href={item.href}

        target={isExternal ? '_blank' : undefined}

        rel={isExternal ? 'noreferrer' : undefined}

        className={[

          'group block rounded-2xl border p-5 text-left transition',

          isWa

            ? 'border-cyan-400/40 bg-cyan-500/10 hover:bg-cyan-500/15'

            : 'border-white/10 bg-white/[0.04] hover:border-cyan-400/30',

        ].join(' ')}

      >

        {body}

      </a>

    )

  }



  return (

    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left">

      {body}

    </div>

  )

}



export default function ContactSection() {
  const contactEyebrow = useUiString('contactSectionEyebrow')
  const contactTitle = useUiString('contactSectionTitle')
  const contactHoursFallback = useUiString('contactHoursFallback')
  const labelPhone = useUiString('labelPhone')
  const labelEmail = useUiString('labelEmail')
  const labelAddress = useUiString('labelAddress')
  const whatsappCta = useUiString('whatsappCta')

  const content = useContent()

  const contact = content.contact || {}

  const linkCards = normalizeContactLinks(contact)
  const contactLinkCards =
    linkCards?.filter((item) => item.id !== 'ig-main' && item.id !== 'tt-main') ?? null

  return (

    <section id="contact" className="py-20 md:py-28 bg-gradient-to-b from-transparent to-[#040c1c]">

      <div className="max-w-5xl mx-auto px-4 md:px-6">

        <div className="neon-card rounded-3xl border border-cyan-400/30 bg-white/[0.03] p-8 md:p-12 text-center">

          <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-cyan-300/80">

            {contactEyebrow}

          </p>

          <h2 className="mt-3 text-3xl md:text-5xl font-bold">{contactTitle}</h2>

          <p className="mt-4 text-slate-300/90 max-w-2xl mx-auto">

            {contact.workingHours || contactHoursFallback}

          </p>



          <div

            className={[

              'mt-8 grid gap-4 max-w-4xl mx-auto text-left',

              contactLinkCards && contactLinkCards.length > 2 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2',

            ].join(' ')}

          >

            {contactLinkCards && contactLinkCards.length > 0 ? (

              contactLinkCards.map((item) => <LinkCard key={item.id} item={item} />)

            ) : (

              <>

                {contact.phone && (

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

                    <div className="text-xs uppercase tracking-wider text-slate-400">{labelPhone}</div>

                    <a

                      href={`tel:${contact.phone.replace(/\s+/g, '')}`}

                      className="mt-1 block text-lg font-semibold text-cyan-200 hover:text-cyan-100"

                    >

                      {contact.phone}

                    </a>

                  </div>

                )}

                {contact.email && (

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

                    <div className="text-xs uppercase tracking-wider text-slate-400">{labelEmail}</div>

                    <a

                      href={`mailto:${contact.email}`}

                      className="mt-1 block text-lg font-semibold text-cyan-200 hover:text-cyan-100 break-all"

                    >

                      {contact.email}

                    </a>

                  </div>

                )}

                {contact.address && (

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

                    <div className="text-xs uppercase tracking-wider text-slate-400">{labelAddress}</div>

                    <div className="mt-1 text-base text-slate-200">{contact.address}</div>

                  </div>

                )}

                {contact.whatsappUrl && (

                  <a

                    href={contact.whatsappUrl}

                    target="_blank"

                    rel="noreferrer"

                    className="rounded-2xl border border-cyan-400/40 bg-cyan-500/10 p-5 hover:bg-cyan-500/15 transition"

                  >

                    <div className="text-xs uppercase tracking-wider text-cyan-300/80">WhatsApp</div>

                    <div className="mt-1 text-lg font-semibold text-cyan-200">{whatsappCta}</div>

                  </a>

                )}

              </>

            )}

          </div>

        </div>

      </div>

    </section>

  )

}


