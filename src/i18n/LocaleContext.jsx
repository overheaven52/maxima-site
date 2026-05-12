import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const STORAGE_KEY = 'maxima-locale'

const LocaleContext = createContext({
  locale: 'ru',
  setLocale: () => {},
})

export const UI_STRINGS = {
  ru: {
    languageGroup: 'Выбор языка',
    openMenu: 'Открыть меню',
    closeMenu: 'Закрыть меню',
    backHome: 'На главную',
    nowLabel: 'Сейчас:',
    heroLeadAria: 'Главное предложение',
    contactFallback: 'Контакт',
    phonePrefix: 'Тел.:',
    privacy: 'Политика конфиденциальности',
    notFoundTitle: 'Страница не найдена',
    notFoundBody:
      'Похоже, вы перешли по ссылке, которой больше нет. Вернитесь на главную.',
    notFoundBack: 'На главную',
    notFoundBadge: '404',
    ctaFallback: 'Связаться',
    contactSectionEyebrow: 'Связаться с нами',
    contactSectionTitle: 'Работаем 24/7 во всех регионах',
    contactHoursFallback: 'Принимаем заказы в любое время суток.',
    labelPhone: 'Телефон',
    labelEmail: 'Email',
    labelAddress: 'Адрес',
    whatsappCta: 'Написать нам →',
  },
  kk: {
    languageGroup: 'Тілді таңдау',
    openMenu: 'Мәзірді ашу',
    closeMenu: 'Мәзірді жабу',
    backHome: 'Басты бетке',
    nowLabel: 'Қазір:',
    heroLeadAria: 'Негізгі ұсыныс',
    contactFallback: 'Байланыс',
    phonePrefix: 'Тел.:',
    privacy: 'Құпиялылық саясаты',
    notFoundTitle: 'Бет табылмады',
    notFoundBody:
      'Сілтеме ескірген сияқты. Басты бетке оралыңыз.',
    notFoundBack: 'Басты бетке',
    notFoundBadge: '404',
    ctaFallback: 'Байланысу',
    contactSectionEyebrow: 'Бізбен байланысу',
    contactSectionTitle: 'Барлық аймақтарда тәулік бойы жұмыс істейміз',
    contactHoursFallback: 'Тапсырыстарды тәулік бойы қабылдаймыз.',
    labelPhone: 'Телефон',
    labelEmail: 'Email',
    labelAddress: 'Мекенжай',
    whatsappCta: 'Бізге жазу →',
  },
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState('ru')

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY)
      if (v === 'kk' || v === 'ru') setLocaleState(v)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.lang = locale === 'kk' ? 'kk' : 'ru'
  }, [locale])

  const setLocale = useCallback((next) => {
    if (next !== 'ru' && next !== 'kk') return
    setLocaleState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale])

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}

export function useUiString(key) {
  const { locale } = useLocale()
  const table = UI_STRINGS[locale] || UI_STRINGS.ru
  return table[key] ?? UI_STRINGS.ru[key] ?? key
}
