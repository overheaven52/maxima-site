/**
 * Нормализует фото из `images[]` и устаревших полей `imageUrl` / `imageAlt`.
 * Если массив `images` непустой — используется только он (imageUrl не подмешивается).
 */
export function getContentImages(obj, fallbackAlt = '') {
  if (!obj || typeof obj !== 'object') return []

  const raw = obj.images
  if (Array.isArray(raw) && raw.length > 0) {
    const out = []
    for (const entry of raw) {
      if (entry == null) continue
      if (typeof entry === 'string') {
        const u = entry.trim()
        if (u) out.push({ url: u, alt: fallbackAlt })
        continue
      }
      const url = String(entry.url || entry.imageUrl || '').trim()
      if (!url) continue
      const alt = String(entry.alt ?? entry.imageAlt ?? '').trim() || fallbackAlt
      out.push({ url, alt })
    }
    if (out.length > 0) return out
  }

  const single = String(obj.imageUrl || '').trim()
  if (single) {
    const alt = String(obj.imageAlt || '').trim() || fallbackAlt
    return [{ url: single, alt }]
  }
  return []
}

export function hasContentImages(obj) {
  return getContentImages(obj).length > 0
}

/**
 * Фото для модального окна аренды техники: если в `detail.gallery` есть снимки —
 * только они (карусель в «развёрнутом описании»), иначе обычная галерея карточки `images` / `imageUrl`.
 */
export function getRentMachineModalImages(machine) {
  if (!machine || typeof machine !== 'object') return []
  const alt = String(machine.name || '').trim()
  const raw = machine.detail?.gallery
  if (Array.isArray(raw) && raw.length > 0) {
    const onlyGallery = getContentImages({ images: raw, imageUrl: '' }, alt)
    if (onlyGallery.length > 0) return onlyGallery
  }
  return getContentImages(machine, alt)
}
