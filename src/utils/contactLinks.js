/** Нормализованная карточка контакта для UI */
export function normalizeContactLinks(contact) {
  if (!contact || typeof contact !== 'object') return null
  const arr = contact.links
  if (!Array.isArray(arr) || arr.length === 0) return null
  const out = []
  for (const x of arr) {
    if (!x || typeof x !== 'object') continue
    const text = String(x.text ?? x.value ?? '').trim()
    const href = String(x.href ?? '').trim()
    if (!text && !href) continue
    out.push({
      id: String(x.id || `cl-${out.length}`),
      label: String(x.label ?? '').trim(),
      text,
      href,
      icon: String(x.icon ?? '').trim(),
    })
  }
  return out.length > 0 ? out : null
}
