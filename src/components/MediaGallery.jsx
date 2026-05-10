import { getContentImages } from '../utils/contentImages.js'

function SquareMosaic({ items }) {
  const n = items.length
  if (n === 1) {
    return (
      <img src={items[0].url} alt={items[0].alt} className="w-full h-full object-cover min-h-0" />
    )
  }
  if (n === 2) {
    return (
      <div className="grid grid-cols-2 gap-0.5 w-full h-full min-h-0">
        {items.map((im, i) => (
          <img key={i} src={im.url} alt={im.alt} className="w-full h-full object-cover min-h-0" />
        ))}
      </div>
    )
  }
  if (n === 3) {
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-0.5 w-full h-full min-h-0">
        <img
          src={items[0].url}
          alt={items[0].alt}
          className="row-span-2 w-full h-full object-cover min-h-0"
        />
        <img src={items[1].url} alt={items[1].alt} className="w-full h-full object-cover min-h-0" />
        <img src={items[2].url} alt={items[2].alt} className="w-full h-full object-cover min-h-0" />
      </div>
    )
  }
  const four = items.slice(0, 4)
  return (
    <div className="relative grid grid-cols-2 grid-rows-2 gap-0.5 w-full h-full min-h-0">
      {four.map((im, i) => (
        <img key={i} src={im.url} alt={im.alt} className="w-full h-full object-cover min-h-0" />
      ))}
      {items.length > 4 && (
        <div className="absolute inset-0 bg-black/55 flex items-center justify-center text-white text-sm font-bold pointer-events-none">
          +{items.length - 4}
        </div>
      )}
    </div>
  )
}

/**
 * @param {object} props
 * @param {object} props.entity — объект с `images` и/или `imageUrl`
 * @param {string} [props.fallbackAlt]
 * @param {'wide' | 'square' | 'banner' | 'inline' | 'strip'} [props.variant]
 * @param {string} [props.className]
 */
export default function MediaGallery({ entity, fallbackAlt = '', variant = 'wide', className = '' }) {
  const items = getContentImages(entity, fallbackAlt)
  if (!items.length) return null

  if (variant === 'square') {
    return (
      <div className={`w-full h-full min-h-0 ${className}`}>
        <SquareMosaic items={items} />
      </div>
    )
  }

  if (variant === 'banner') {
    if (items.length === 1) {
      return (
        <img
          src={items[0].url}
          alt={items[0].alt}
          className={`absolute inset-0 h-full w-full object-cover ${className}`}
        />
      )
    }
    return (
      <div
        className={`absolute inset-0 flex overflow-x-auto snap-x snap-mandatory scroll-smooth ${className}`}
      >
        {items.map((im, i) => (
          <img
            key={i}
            src={im.url}
            alt={im.alt}
            className="min-w-full h-full object-cover snap-center shrink-0"
          />
        ))}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap gap-3 justify-center ${className}`}>
        {items.map((im, i) => (
          <img
            key={i}
            src={im.url}
            alt={im.alt}
            className="rounded-2xl max-w-full max-h-[min(70vh,520px)] w-auto object-cover border border-white/10"
          />
        ))}
      </div>
    )
  }

  if (variant === 'strip') {
    return (
      <div
        className={`flex gap-2 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth pb-1 touch-pan-x ${className}`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {items.map((im, i) => (
          <img
            key={i}
            src={im.url}
            alt={im.alt}
            className="h-28 w-44 shrink-0 snap-center rounded-xl object-cover border border-white/10"
          />
        ))}
      </div>
    )
  }

  // wide
  if (items.length === 1) {
    return (
      <img
        src={items[0].url}
        alt={items[0].alt}
        className={`w-full h-full object-cover ${className}`}
      />
    )
  }
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}>
      {items.map((im, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden border border-white/10 bg-[#0b1d3a] aspect-[4/3]"
        >
          <img src={im.url} alt={im.alt} className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  )
}
