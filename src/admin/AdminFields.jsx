import { useState } from 'react'
import { api } from '../api/client.js'

const IMAGE_SIZE_HINT =
  'Рекомендуемые размеры: горизонтальные 1600×900, квадратные 1200×1200, вертикальные 1080×1350. Формат JPG/PNG/WebP, вес до ~1–2 МБ.'

export function TextField({ label, value, onChange, placeholder, hint }) {
  return (
    <label className="block">
      <div className="text-sm text-slate-300">{label}</div>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="mt-1 w-full min-h-11 rounded-lg bg-black/30 border border-white/10 focus:border-cyan-400/60 outline-none px-3 py-2.5 text-base text-white"
      />
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </label>
  )
}

export function TextArea({ label, value, onChange, placeholder, rows = 4, hint }) {
  return (
    <label className="block">
      <div className="text-sm text-slate-300">{label}</div>
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 focus:border-cyan-400/60 outline-none px-3 py-2.5 text-base text-white resize-y"
      />
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </label>
  )
}

export function CheckboxField({ label, value, onChange, hint }) {
  return (
    <label className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-5 h-5 min-w-5 shrink-0 accent-cyan-400"
      />
      <div>
        <div className="text-sm text-slate-300">{label}</div>
        {hint && <div className="text-xs text-slate-500">{hint}</div>}
      </div>
    </label>
  )
}

export function ImagesListField({ label, value, onChange, hint }) {
  const items = Array.isArray(value) ? value : []
  const fullHint = hint ? `${hint} ${IMAGE_SIZE_HINT}` : IMAGE_SIZE_HINT
  return (
    <ListEditor
      label={label}
      items={items}
      onChange={onChange}
      makeNew={() => ({ id: `img-${Date.now()}`, url: '', alt: '' })}
      hint={fullHint}
      renderItem={(row, set) => (
        <div className="space-y-3">
          <ImageField label="Фото" value={row.url} onChange={(v) => set({ ...row, url: v })} />
          <TextField label="Подпись (alt)" value={row.alt} onChange={(v) => set({ ...row, alt: v })} />
        </div>
      )}
    />
  )
}

export function ImageField({ label, value, onChange, hint }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fullHint = hint ? `${hint} ${IMAGE_SIZE_HINT}` : IMAGE_SIZE_HINT

  async function handleFile(file) {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const { url } = await api.upload(file)
      onChange(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="text-sm text-slate-300">{label}</div>
      <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="w-full max-w-[120px] aspect-square sm:w-24 sm:h-24 sm:max-w-none sm:aspect-auto rounded-lg bg-black/30 border border-white/10 grid place-items-center overflow-hidden shrink-0">
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-slate-600 text-xs">нет фото</span>
          )}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="URL картинки"
            className="rounded-lg bg-black/30 border border-white/10 focus:border-cyan-400/60 outline-none px-3 py-2.5 text-white text-base w-full min-w-0"
          />
          <label className="inline-flex items-center gap-2 text-sm text-cyan-300 cursor-pointer touch-manip">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <span className="inline-flex items-center justify-center min-h-11 px-4 rounded-lg border border-cyan-400/40 bg-cyan-500/10 hover:bg-cyan-500/20 transition">
              {busy ? 'Загрузка…' : 'Загрузить файл'}
            </span>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-slate-400 hover:text-red-300 text-xs"
              >
                Очистить
              </button>
            )}
          </label>
        </div>
      </div>
      {error && <div className="mt-1 text-xs text-red-300">{error}</div>}
      <div className="mt-1 text-xs text-slate-500">{fullHint}</div>
    </div>
  )
}

export function ListEditor({ label, items = [], onChange, renderItem, makeNew, hint }) {
  function update(index, next) {
    const copy = [...items]
    copy[index] = next
    onChange(copy)
  }

  function remove(index) {
    const copy = [...items]
    copy.splice(index, 1)
    onChange(copy)
  }

  function move(index, dir) {
    const target = index + dir
    if (target < 0 || target >= items.length) return
    const copy = [...items]
    ;[copy[index], copy[target]] = [copy[target], copy[index]]
    onChange(copy)
  }

  function add() {
    onChange([...items, makeNew()])
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div className="text-sm text-slate-300">{label}</div>
        <button
          type="button"
          onClick={add}
          className="text-sm w-full sm:w-auto min-h-11 px-4 rounded-lg border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 transition touch-manip"
        >
          + добавить
        </button>
      </div>
      {hint && <div className="text-xs text-slate-500 mb-2">{hint}</div>}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 pt-14 sm:pt-4 relative">
            <div className="absolute right-2 top-2 sm:right-3 sm:top-3 flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="min-w-10 min-h-10 rounded-lg text-sm text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-30 touch-manip"
                title="Вверх"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="min-w-10 min-h-10 rounded-lg text-sm text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-30 touch-manip"
                title="Вниз"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="min-w-10 min-h-10 rounded-lg text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200 touch-manip"
                title="Удалить"
              >
                ✕
              </button>
            </div>
            <div className="sm:pr-20">{renderItem(item, (next) => update(i, next), i)}</div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-sm text-slate-500 py-4 text-center border border-dashed border-white/10 rounded-xl">
            Список пуст. Нажмите «добавить».
          </div>
        )}
      </div>
    </div>
  )
}

export function FieldGroup({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 md:p-6 space-y-4">
      {title && (
        <header>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
        </header>
      )}
      {children}
    </section>
  )
}
