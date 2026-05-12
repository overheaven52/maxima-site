/**
 * Глубокое слияние базового контента с частичными переводами.
 * Массивы объектов с полем id сливаются по id; остальные массивы при наличии
 * в переводе заменяются целиком.
 */
export function mergeLocalized(base, over) {
  if (over === undefined) return base
  if (base === undefined || base === null) return over

  if (Array.isArray(base) && Array.isArray(over)) {
    if (over.length === 0) return base
    const sample = base[0]
    if (
      sample &&
      typeof sample === 'object' &&
      sample.id != null &&
      over.every((x) => x && typeof x === 'object' && x.id != null)
    ) {
      const map = new Map(over.map((item) => [item.id, item]))
      return base.map((item) => {
        const o = map.get(item.id)
        return o ? mergeLocalized(item, o) : item
      })
    }
    return over
  }

  if (
    typeof base === 'object' &&
    typeof over === 'object' &&
    !Array.isArray(base) &&
    !Array.isArray(over)
  ) {
    const out = { ...base }
    for (const key of Object.keys(over)) {
      if (Object.prototype.hasOwnProperty.call(base, key)) {
        out[key] = mergeLocalized(base[key], over[key])
      } else {
        out[key] = over[key]
      }
    }
    return out
  }

  return over
}
