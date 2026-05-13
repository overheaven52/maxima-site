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
    rentTariffFallback: 'Тариф',
    rentPerDay: 'За сутки',
    rentCategoriesEyebrowFallback: 'Главные разделы',
    rentCategoryBadgeFallback: 'Аренда',
    rentWhatsappMachineFallback:
      'Здравствуйте, интересует аренда спецтехники',
    rentToMainSections: 'К главным разделам',
    rentMoreDetails: 'Подробнее',
    rentPricingTitle: 'Стоимость аренды',
    rentRentCta: 'Арендовать',
    rentBackToCategories: 'Вернуться к разделам',
    rentCloseBackdrop: 'Закрыть',
    rentCloseModal: 'Закрыть окно',
    rentCarouselPrev: 'Предыдущее фото',
    rentCarouselNext: 'Следующее фото',
    rentCarouselDots: 'Выбор фото',
    rentCarouselPhotoN: 'Фото',
    rentDetailEmpty:
      'Полное описание этой модели ещё не заполнено в админке. Напишите в WhatsApp — пришлём характеристики, габариты и условия аренды под ваш объект.',
    rentDetailBlocksTitle: 'Полное описание',
    rentSpecsTitle: 'Технические характеристики',
    rentPricesTitle: 'Стоимость аренды',
    rentWhatsappAsk: 'Запросить в WhatsApp',
    rentClose: 'Закрыть',
    rentSpecParam: 'Параметр',
    rentSecForWork: 'Для каких работ подходит',
    rentSecForWhom: 'Кому и для каких объектов',
    rentSecCoverage: 'Площадь и производительность',
    rentSecCapabilities: 'Возможности и режимы',
    rentSecHowItWorks: 'Как работает',
    rentSecDimensions: 'Размеры и параметры',
    rentSecNotes: 'Примечания',
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
    rentTariffFallback: 'Тарифтік жазба',
    rentPerDay: 'Бір тәулік',
    rentCategoriesEyebrowFallback: 'Негізгі бөлімдер',
    rentCategoryBadgeFallback: 'Жалға беру',
    rentWhatsappMachineFallback:
      'Сәлеметсіз бе, арнайы техниканы жалға алу қызықтырады',
    rentToMainSections: 'Негізгі бөлімдерге',
    rentMoreDetails: 'Толығырақ',
    rentPricingTitle: 'Жалға бағасы',
    rentRentCta: 'Жалға алу',
    rentBackToCategories: 'Бөлімдерге оралу',
    rentCloseBackdrop: 'Жабу',
    rentCloseModal: 'Терезені жабу',
    rentCarouselPrev: 'Алдыңғы фото',
    rentCarouselNext: 'Келесі фото',
    rentCarouselDots: 'Фото таңдау',
    rentCarouselPhotoN: 'Фото',
    rentDetailEmpty:
      'Осы модельдің толық сипаттамасы әлі админ-панельде толтырылмаған. WhatsApp арқылы жазыңыз — сипаттамаларды, габариттерді және нысаныңызға жалға беру шарттарын жібереміз.',
    rentDetailBlocksTitle: 'Толық сипаттама',
    rentSpecsTitle: 'Техникалық сипаттамалар',
    rentPricesTitle: 'Жалға бағасы',
    rentWhatsappAsk: 'WhatsApp арқылы сұрау',
    rentClose: 'Жабу',
    rentSpecParam: 'Параметр',
    rentSecForWork: 'Қандай жұмыстарға қолайлы',
    rentSecForWhom: 'Кімге және қандай нысандарға',
    rentSecCoverage: 'Алаң және өнімділік',
    rentSecCapabilities: 'Мүмкіндіктер мен режимдер',
    rentSecHowItWorks: 'Қалай жұмыс істейді',
    rentSecDimensions: 'Өлшемдер мен параметрлер',
    rentSecNotes: 'Қосымша',
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
