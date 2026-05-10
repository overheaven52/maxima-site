# Maxima — состояние проекта (чекпоинт)

Сохранено: 9 мая 2026.
Когда вернёшься — открой этот файл и пройди по разделам.

---

## Что уже готово

### 1. Сайт (frontend)
- React 19 + Vite 8 + Tailwind (через CDN).
- Контент берётся с бэкенда (`/api/content`), есть локальный fallback (`src/data/defaults.js` -> `server/defaultContent.json`).
- Публичные SEO-friendly URL:
  - `/` — главная
  - `/cleaning` — клининг
  - `/rent` — аренда (общая страница)
  - `/rent/:slug` — категория или конкретная техника
- Подключение Google Analytics и Яндекс.Метрики через `site.analytics` (если ID заданы — скрипт встанет автоматически).
- Файлы: `src/App.jsx`, `src/Root.jsx`, `src/main.jsx`.

### 2. Админка
- Адрес: открой сайт и добавь `#admin` в URL (например, `http://localhost:5173/#admin`).
- Пароль: `deda123321` (хранится в `.env` как `ADMIN_PASSWORD`).
- Аутентификация по JWT, токен лежит в `localStorage`.
- Что можно редактировать:
  - Header, Hero
  - Sections (категории) + slug + SEO
  - Machines (единицы техники) + slug + alt + SEO
  - Cleaning (страница клининга) + SEO
  - TikTok блок, Footer, Contact
  - Отдельная вкладка **SEO**: глобальное SEO, страница аренды, регионы, преимущества, FAQ, аналитика
- Файлы: `src/admin/*.jsx`, `src/api/client.js`.

### 3. Backend (Express)
- `server/index.js` — единая точка.
- API:
  - `POST /api/login` — вход
  - `GET /api/me` — проверка токена
  - `GET /api/content` — публичный контент
  - `PUT /api/content` — сохранение (нужен токен)
  - `POST /api/content/reset` — сброс к default
  - `POST /api/upload` — загрузка картинок (multer, в `server/data/uploads/`)
- SEO:
  - `GET /robots.txt` — динамический
  - `GET /sitemap.xml` — собирается из контента
  - В `dist/index.html` сервер на лету подставляет нужные meta, OG, canonical и JSON-LD под путь.
- Контент хранится в `server/data/content.json` (создаётся из `server/defaultContent.json` при первом запуске).
- Загруженные изображения — в `server/data/uploads/`, отдаются по `/uploads/...`.

### 4. Окружение
- `.env` (локально, в git не попадает) — `ADMIN_PASSWORD`, `JWT_SECRET`, `PORT=3001`.
- `.env.example` — шаблон.
- В `.gitignore` уже добавлены: `.env`, `server/data/content.json`, `server/data/uploads/`.

---

## Как запустить локально

```bash
# 1. Установить зависимости (один раз)
npm install

# 2. Запуск в dev — поднимет одновременно фронт (vite, :5173) и сервер (express, :3001)
npm run dev

# 3. Открыть сайт
http://localhost:5173/

# 4. Открыть админку
http://localhost:5173/#admin
# логин — пароль из .env (по умолчанию deda123321)
```

Прод-сборка:

```bash
npm run build       # соберёт фронт в dist/
npm start           # поднимет express на :3001 и будет раздавать dist/ + API
```

---

## Что осталось сделать (когда вернёшься)

1. **Боевой домен и деплой**
   - Купить/привязать домен (например, `maxima.kz`).
   - Поставить Node.js хостинг (Render, Railway, VPS, Beget, любой с поддержкой Node).
   - Закинуть проект, прописать переменные окружения (`ADMIN_PASSWORD`, `JWT_SECRET`, `PUBLIC_BASE_URL=https://maxima.kz`).
   - На Netlify в текущем виде сайт работать не будет — там только статика, а нужен Node-сервер.
2. **SEO-контент**
   - Зайти в админку -> вкладка SEO и заполнить:
     - Глобальные title/description/keywords/og:image.
     - SEO для каждой категории и каждой машины.
     - FAQ (минимум 6–10 вопросов).
     - Регионы (города Казахстана, где есть услуги).
3. **Аналитика**
   - Создать счётчик в Google Analytics (GA4) и Яндекс.Метрике.
   - Вставить ID в админке -> SEO -> Аналитика.
4. **Поисковые системы**
   - Google Search Console: добавить домен, подтвердить, отправить `https://maxima.kz/sitemap.xml`.
   - Яндекс.Вебмастер: то же самое.
5. **Картинки**
   - Залить через админку нормальные превью для категорий и техники (если ещё стоят дефолтные).
6. **Безопасность перед продом**
   - Поменять `JWT_SECRET` на длинную случайную строку.
   - Можно положить пароль не в открытом виде, а как bcrypt-хеш в `ADMIN_PASSWORD_HASH` (см. `.env.example`).
7. **Git (опционально, но желательно)**
   - На этой машине `git` не установлен — поэтому версионирование пока не ведётся.
   - Когда поставишь git: `git init && git add . && git commit -m "checkpoint"` — и дальше уже push на GitHub/GitLab.

---

## Полезные пути

- Frontend: `src/`
- Админка: `src/admin/`
- Backend: `server/index.js`
- Контент: `server/defaultContent.json` (шаблон), `server/data/content.json` (живой)
- Загруженные файлы: `server/data/uploads/`
- Документация: `README.md`

---

## Важные заметки

- Файл `.env` хранится только локально — на новом компьютере его нужно создать заново (скопировать `.env.example` -> `.env` и подставить значения).
- Файл `server/data/content.json` тоже не в git — это «живой» контент, который меняется через админку. На сервере он будет создаваться заново при первом запуске из `defaultContent.json`.
- Если хочется откатить весь контент к дефолту — кнопка «Сбросить к дефолту» в админке (или удалить `server/data/content.json` и перезапустить сервер).
