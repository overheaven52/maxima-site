# MAXIMA — сайт + админ-панель

Чистый реврайт. SSR (server-side rendering) на Express + React + Vite. Контент,
SEO и набор разделов хранятся в одном JSON и редактируются через админку — код
трогать не нужно.

## Что внутри

- **SSR-рендер**: каждая страница приходит к Google/Yandex/WhatsApp уже с
  готовыми `<title>`, `<meta>`, Open Graph, JSON-LD и текстом. Это решает
  проблему «сайт на React сложно продвигать».
- **Динамические страницы**: новый раздел / новая страница добавляется в
  админке (вкладка «Страницы») — слаг + блоки. Никаких правок кода.
- **SEO-инструменты**:
  - sitemap.xml — `/sitemap.xml` (только страницы, не помеченные `noindex`)
  - robots.txt — `/robots.txt` (закрывает `/admin` и `/api`)
  - JSON-LD (`LocalBusiness`) с телефоном, адресом и соцсетями
  - Open Graph + Twitter Card
  - Canonical, robots, verification (Google/Yandex)
  - Google Analytics + Яндекс.Метрика — просто впиши ID в админке
- **Переезд домена/хоста за 1 минуту**: меняется одна переменная окружения
  `PUBLIC_BASE_URL` в `.env` — sitemap и canonical перестроятся сами.
- **Админ-панель** (`/admin`): JWT-логин, защита от перебора пароля, загрузка
  изображений, редактирование всех секций сайта по вкладкам, сброс к шаблону.

## Запуск

```bash
# 1. Установи зависимости
npm install

# 2. Скопируй .env и поставь свой пароль и JWT-секрет
copy .env.example .env

# 3. Разработка (Vite + Express, HMR)
npm run dev          # http://localhost:3001

# 4. Прод-сборка и запуск
npm run build
npm run start
```

В `.env`:

```env
ADMIN_PASSWORD=поставь_свой
JWT_SECRET=любая_длинная_случайная_строка
PORT=3001
PUBLIC_BASE_URL=https://maxima.kz   # меняется при переезде
```

## Как добавить новый раздел / страницу

### Вариант 1 — без программиста (через админку)

1. Зайти на `/admin`, ввести пароль из `.env`.
2. Открыть вкладку «Страницы».
3. Нажать «Добавить» → задать `slug` (например `/about`) и название.
4. Внутри страницы добавить блоки. Самый универсальный — `custom`: туда задаются
   заголовок, подзаголовок, HTML-текст, картинка, кнопка и расположение.
5. В соседней вкладке «Шапка» — добавить пункт меню со ссылкой на новый slug.
6. Сохранить. Страница сразу доступна по адресу, попадёт в `sitemap.xml`,
   получит свой SEO-блок.

### Вариант 2 — нужен новый тип блока (custom мало)

1. Создать компонент в `src/components/sections/MySection.jsx`.
2. Зарегистрировать его в `src/components/SectionRenderer.jsx`:

```js
import MySection from './sections/MySection.jsx'
const REGISTRY = { ..., my: MySection }
```

3. Добавить опцию в `BLOCK_TYPES` в `src/admin/AdminEditor.jsx` (вкладка
   «Страницы»), чтобы блок появился в выпадающем списке.

Всё. Можно использовать в любой странице.

## Переезд с Netlify на другой домен/хост

1. Поднять Node 18+ на новом сервере.
2. `git clone`, `npm install`, заполнить `.env` (особенно `PUBLIC_BASE_URL`).
3. `npm run build && npm run start` (или поставить за nginx/PM2).
4. В админке — сохранить (любая правка) — sitemap пересоберётся под новый домен.
5. На старом домене поставить редирект 301.

База данных не нужна: контент — это `server/data/content.json`, картинки —
`server/data/uploads/`. Они переносятся как файлы.

## Полезное

- `npm run dev` — dev-режим (HMR через Vite, автоSSR)
- `npm run build` — сборка клиента и серверного бандла в `dist/`
- `npm run start` — production-режим (читает `dist/`)
- `npm run preview` — build + start одной командой
- `node scripts/test-endpoints.mjs` — smoke-тест ключевых маршрутов

## Структура

```
server/
  index.js              # Express: API + SSR + sitemap/robots
  defaultContent.json   # шаблон контента (база для нового сайта/сброса)
  data/
    content.json        # реальный контент (правится через админку)
    uploads/            # загруженные изображения
src/
  entry-client.jsx      # клиентский bootstrap (гидрация)
  entry-server.jsx      # серверный bootstrap (SSR + статус 404)
  App.jsx               # роутинг по slug-ам из content.pages
  pages/
    PageView.jsx        # любая страница рендерится отсюда
    NotFoundPage.jsx
  components/
    Header.jsx, Footer.jsx
    SectionRenderer.jsx # реестр типов блоков
    sections/           # сами секции (Hero, Rent, Cleaning, Custom, …)
  admin/
    AdminApp.jsx, AdminLogin.jsx, AdminEditor.jsx, AdminFields.jsx
  content/
    ContentContext.jsx  # глобальный контент (SSR + клиент)
    PathContext.jsx     # лёгкий роутинг без react-router
  api/client.js         # фронтовый клиент к /api/*
index.html              # SSR-шаблон с маркерами <!--ssr-…-->
```
