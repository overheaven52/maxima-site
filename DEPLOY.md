# Публикация сайта MAXIMA в интернете

Проект — **одно Node.js-приложение** (Express): серверный рендер страниц (SSR), раздача фронта, API `/api/*`, админка `/admin`, загрузки в `server/data/uploads/`, контент в `server/data/content.json`.

**Чистый статический хостинг** (только HTML/CSS/JS без Node) **не подойдёт** без переделки: пропадут админка, сохранение контента и загрузка картинок.

---

## Netlify — как «загрузить» этот проект

**Обычный способ Netlify** (подключить репозиторий или перетащить папку в **Netlify Drop**, указать **Publish directory**) рассчитан на **чисто статические** сайты. У MAXIMA же один **Node-сервер** рендерит HTML, обрабатывает `/admin`, `/api`, пишет `content.json` и загружает файлы в `server/data/uploads/`. Поэтому:

| Что вы хотите сделать | Результат |
|------------------------|-----------|
| Залить только `dist/client` как статику | Страницы вроде `/about` и данные с сервера **не будут работать** как сейчас; админка и API **не заведутся**. |
| «Как на Netlify, но бесплатно и с Node» | Проще взять **[Render](https://render.com)** или **[Railway](https://railway.app)** (см. раздел 4 в этом файле): там так же из Git, одна кнопка, но поддерживается **`npm start`**. |

**Теоретически** положить весь Express на Netlify можно только через **Netlify Functions** (обёртка вроде `serverless-http`) и отдельное хранилище для контента и картинок (Netlify Blobs / S3 / БД), плюс лимиты по времени выполнения и холодный старт. Это **отдельная доработка проекта**, в текущем виде репозиторий под это не заточен.

**Итог:** загрузить **именно этот** сайт на Netlify «в один клик», как статический лендинг, **нельзя без потери функций**. Для продакшена выберите хостинг с **Node.js** из разделов 2–4 ниже; по удобству ближе всего к Netlify по сценарию «залил из Git» — **Render** или **Railway**.

---

## 1. Что собрать перед выкладкой

На своём компьютере или на сервере в каталоге проекта:

```bash
npm ci
npm run build
```

Появятся `dist/client/` и `dist/server/`. В production запуск:

```bash
set NODE_ENV=production   # Windows CMD
# или: export NODE_ENV=production  (Linux/macOS)
npm start
```

Сервер слушает порт из `.env` (`PORT`, по умолчанию **3001**).

Обязательно задайте в `.env` (шаблон — `.env.example`):

- `PUBLIC_BASE_URL` — полный URL сайта с HTTPS, например `https://maxima.example`
- `JWT_SECRET` — длинная случайная строка
- `ADMIN_PASSWORD` или `ADMIN_PASSWORD_HASH` — пароль входа в `/admin`

---

## 2. Docker (удобно везде: VPS, облако, домашний сервер)

```bash
docker build -t maxima .
docker run -d -p 3001:3001 --env-file .env -v maxima-data:/app/server/data --name maxima maxima
```

Или через Compose (данные в именованном томе):

```bash
cp .env.example .env
# отредактируйте .env
docker compose up -d
```

Перед прокси (Nginx/Caddy) на 80/443 направляйте трафик на `127.0.0.1:3001` или на порт контейнера.

---

## 3. VPS (Ubuntu и аналоги) без Docker

1. Установите Node.js 20+.
2. Скопируйте проект на сервер (`git clone` или архив).
3. В корне проекта:

   ```bash
   npm ci
   npm run build
   cp .env.example .env
   nano .env   # PUBLIC_BASE_URL, JWT_SECRET, ADMIN_PASSWORD, PORT при необходимости
   ```

4. Запуск через **systemd** (пример юнита):

   ```ini
   [Unit]
   Description=MAXIMA site
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/var/www/maxima
   Environment=NODE_ENV=production
   ExecStart=/usr/bin/node server/index.js
   Restart=on-failure

   [Install]
   WantedBy=multi-user.target
   ```

5. Перед сервером поставьте **Nginx** или **Caddy**: `proxy_pass` на `http://127.0.0.1:3001`, SSL — Let's Encrypt.

Папки **`server/data/`** и вложенные **`uploads/`** должны быть доступны процессу на запись.

---

## 4. PaaS с поддержкой Node (не только Netlify)

Подойдёт любой сервис, где можно выполнить **build** и **start** с переменными окружения:

| Сервис        | Ориентир |
|---------------|----------|
| **Railway**   | New Project → из GitHub, `build`: `npm ci && npm run build`, `start`: `npm start` |
| **Render**    | Web Service → Node, те же команды, задать `NODE_ENV=production` |
| **Fly.io**    | `fly launch` + Dockerfile из репозитория |
| **Timeweb Cloud Apps / другие** | Указать команду запуска `npm start`, корень репозитория, env из `.env.example` |

Файл **`Procfile`** (`web: npm start`) помогает платформам вроде Heroku-совместимых.

**Netlify** в режиме «только статическая папка» из этого репозитория **не даст рабочий сайт** без отдельного backend или без переписывания под static export. Старый `netlify.toml` с `publish = dist` убран, чтобы не вводить в заблуждение: нужен хостинг с **Node.js**.

Перед первым `docker compose up` скопируйте `.env.example` в `.env` и заполните переменные (иначе Compose не подхватит `env_file`).

---

## 5. Резервная копия «как сейчас»

- Закоммитьте в Git **исходники** + при необходимости актуальный **`server/data/content.json`** (без секретов).
- Либо заархивируйте весь проект **после** `npm run build`, чтобы в архиве были `dist/` и `node_modules` (тяжёлый вариант) — удобнее на сервере выполнить `npm ci && npm run build` заново.

Текущая production-сборка клиента и SSR лежит в **`dist/`** после команды `npm run build`.
