# Учебный стенд XSS и CSRF

Три отдельных сервиса: backend, frontend и attacker. Nginx отсутствует.
Стенд содержит намеренные уязвимости; используйте только локальные тестовые данные.

## Запуск через Docker Desktop

Откройте PowerShell в распакованной папке `xss-csrf-demo`:

```powershell
docker compose up -d --build --wait
docker compose ps
```

- Защищённая страница: http://localhost:3000/protected
- Уязвимая страница: http://localhost:3000/vulnerable
- Страница атакующего: http://localhost:4000
- Тестовый вход: `student` / `1234`.

Используйте именно `localhost` во всех вкладках: не смешивайте его с `127.0.0.1`.
Backend слушает `8000` внутри Docker; `localhost:8000` не публикуется.
Frontend отдаёт собранный React и проксирует `/api/*` на `http://backend:8000`.
Атакующие формы отправляют запросы браузером на `http://localhost:3000`.
Контейнер attacker не подключён к сети backend. Его порт 4000 нужен только для
загрузки страницы внешнего origin, это не второй вход в API.

```powershell
docker compose logs -f
docker compose down
```

Комментарии и сессии находятся в памяти: перезапуск backend сбрасывает их.
Каждый сервис имеет собственный Dockerfile и контекст сборки. Образы запускаются
от пользователя node, с read-only файловой системой и без Linux capabilities.
Публикация привязана к loopback. Изоляция контейнеров не устраняет учебные XSS/CSRF.

## Проверка без Docker

Нужен Node.js 22 и npm. Из корня проекта:

```powershell
npm run install:all
npm run ci
npm run build
```

В трёх отдельных терминалах из корня:

```powershell
npm run dev:backend
npm run start:frontend
npm run start:attacker
```

Затем `npm run smoke`. Для редактирования интерфейса можно вместо
`start:frontend` использовать `dev:frontend`; Vite проксирует на localhost:8000.
Проверяйте CSP на собранном frontend, поскольку Vite dev-сервер не воспроизводит
его заголовки. При запуске без Docker изоляция сетей Compose отсутствует.

## Сценарии демонстрации

1. Откройте `/vulnerable`. Через attacker нажмите Reflected XSS Vulnerable:
   появится учебный alert. Повторите для Protected: alert отсутствует.
2. В attacker отправьте Stored XSS, затем обновите vulnerable: комментарий
   создаёт alert. Одинаковый ввод в форме protected очищается.
3. Нажмите DOM-based XSS для каждого режима: источник данных находится в hash,
   backend не получает фрагмент URL. В vulnerable сработает alert, в protected нет.
4. Войдите на vulnerable, отправьте CSRF через attacker. Обновите профиль:
   адрес изменится на attacker@example.com.
5. Войдите отдельно на protected и повторите атаку: ответ 403, email не меняется.
   Легитимная форма получает токен и успешно меняет email.

Два порта localhost — разные origin, но один site. SameSite=Lax не блокирует
этот same-site сценарий. Protected использует токен сессии и проверку Origin;
чужой Origin отклоняется, при отсутствующем Origin токен всё равно обязателен
для комментариев, профиля и выхода. Login проверяет Origin и регенерирует сессию.
GET csrf-token доступен и анонимно для формы комментариев; CORS не разрешён.

## Структура

- `backend/src/app.js`: сборка middleware и роутеров.
- `backend/src/routes/`: auth, profile, xss.
- `backend/src/middleware/`: режим, сессии, проверки доступа, Origin и CSRF.
- `backend/src/repositories/`: ограниченное хранилище комментариев.
- `frontend/src/pages/`: React-страница.
- `frontend/src/components/`, `lib/`: вывод и API-клиент.
- `frontend/server/`: HTTP-сервер статики и фиксированный API proxy.
- `attacker/pages/`, `public/`: HTML и JavaScript атакующей страницы.
- `scripts/smoke.cjs`: интеграционная проверка через порт 3000.

## Границы защиты

Режим задаётся `?mode=protected|vulnerable`, по умолчанию protected. Сессии и
комментарии режимов разделены. Это сравнение в одном учебном origin, а не
изоляция доверенных приложений: XSS в vulnerable потенциально может обращаться
к protected API того же origin. Не используйте такую схему для реальных данных.
HttpOnly защищает чтение cookie, но не запрещает XSS выполнять запросы.
Secure=false выбран для локального HTTP; настоящему сервису нужны HTTPS,
Secure-cookie, постоянное хранилище сессий, полноценная аутентификация и лимиты.
Секрет генерируется при старте либо задаётся через SESSION_SECRET; в коде его нет.

## Проверки и ограничения

См. `VALIDATION.md` с фактически выполненными проверками. CI выполняет lint,
format, тесты, сборку React, сборку трёх образов и smoke-test. Конфигурация CI
сама по себе не подтверждает успешный запуск в GitHub Actions.

## Полная проверка в Chromium

После запуска трёх сервисов выполните:

```powershell
npm ci --prefix e2e
npm run browser:install --prefix e2e
npm test --prefix e2e
```

Сценарий `e2e/browser.cjs` проверяет Reflected, Stored и DOM XSS, отправку
CSRF-форм, легитимное изменение email и полную навигацию с CSP. Для повторения
опыта начните с чистого backend. Эта проверка подготовлена, но в среде
редактирования не выполнена из-за отсутствия доступного Chromium.
