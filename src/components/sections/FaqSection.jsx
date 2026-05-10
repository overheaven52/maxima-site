import { useState } from 'react'
import { useContent } from '../../content/ContentContext.jsx'

export default function FaqSection() {
  const content = useContent()
  const faq = content.faq || {}
  const items = faq.items || []
  const [openId, setOpenId] = useState(items[0]?.id || null)

  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="text-center">
          {faq.eyebrow && (
            <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-cyan-300/80">
              {faq.eyebrow}
            </p>
          )}
          <h2 className="mt-3 text-3xl md:text-5xl font-bold">{faq.heading}</h2>
          {faq.description && (
            <p className="mt-4 text-slate-300/90 leading-relaxed">
              {faq.description}
            </p>
          )}
        </div>

        {items.length > 0 && (
          <div className="mt-10 space-y-3">
            {items.map((item) => {
              const isOpen = openId === item.id
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border bg-white/[0.03] transition ${
                    isOpen
                      ? 'border-cyan-400/40 bg-cyan-500/5'
                      : 'border-white/10 hover:border-cyan-400/30'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="w-full text-left px-5 md:px-6 py-4 flex items-center justify-between gap-4"
                  >
                    <span className="font-medium text-white text-base md:text-lg">
                      {item.question}
                    </span>
                    <span
                      className={`grid place-items-center w-8 h-8 rounded-full border border-cyan-400/30 text-cyan-300 transition-transform ${
                        isOpen ? 'rotate-45' : ''
                      }`}
                      aria-hidden
                    >
                      +
                    </span>
                  </button>
                  {isOpen && item.answer && (
                    <div className="px-5 md:px-6 pb-5 text-slate-300/90 leading-relaxed">
                      {item.answer}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
