# Проверка соответствия согласованному плану

## 1. Инициализация проекта и базовая инфраструктура

- Публичный репозиторий: структура проекта готова к публикации, README.md подготовлен.
- Отдельные директории backend и frontend: выполнено.
- docker-compose.yml: выполнено.
- CI/CD lint -> tests -> build: выполнено в `.github/workflows/ci.yml`.

## 2. Уязвимый бэкенд для XSS

- Express-сервер: выполнено.
- In-memory хранилище комментариев: выполнено.
- Reflected XSS без санитизации в vulnerable-режиме: выполнено.
- Stored XSS без санитизации в vulnerable-режиме: выполнено.

## 3. Уязвимый React frontend и UI

- React + Vite + React Router: выполнено.
- Формы для поиска, комментариев, входа и изменения email: выполнено.
- `dangerouslySetInnerHTML` для vulnerable-режима: выполнено.
- DOM-based XSS: выполнено.
- ESLint, Prettier, Vitest: выполнено.

## 4. Защита от XSS

- Backend sanitization через `sanitize-html`: выполнено.
- CSP на уровне Express для protected-режима: выполнено.
- Безопасный React-рендеринг строк: выполнено.
- DOMPurify для HTML, который необходимо отрисовать: выполнено.
- XSS-тесты, включая обходные payload: выполнено.

## 5. CSRF и сессии

- Cookie sessions через `express-session`: выполнено.
- Демо-аутентификация: выполнено.
- Изменение email как чувствительное действие: выполнено.
- Vulnerable-режим без CSRF-проверки: выполнено.
- UI для входа и изменения email: выполнено.

## 6. Защита от CSRF и страница атакующего

- Генерация и проверка CSRF-токена: выполнено.
- `SameSite=Lax` и `HttpOnly` для protected-cookie: выполнено.
- Передача токена через `X-CSRF-Token`: выполнено.
- Отдельная attacker page с Reflected, Stored, DOM XSS и CSRF: выполнено.

## 7. Контейнеризация и финализация CI/CD

- Multi-stage Dockerfile: выполнено.
- docker-compose для app + attacker: выполнено.
- Тестирование Reflected, Stored, DOM XSS и CSRF: выполнено на уровне unit/integration tests; ручная браузерная демонстрация описана в README.
- Edge cases: mixed-case/nested XSS, отсутствующий/поддельный/чужой CSRF-токен, отсутствие cookie, неверный email: выполнено.
- X-Frame-Options и X-Content-Type-Options: включаются Helmet и проверяются тестом.

## Перед защитой

Остаются только действия, которые невозможно завершить внутри архива заранее:

1. Создать публичный GitHub-репозиторий.
2. Выполнить `npm run install:all`, чтобы получить локальные `package-lock.json`.
3. Выполнить `npm run ci`.
4. Выполнить `docker compose up --build` и вручную проверить браузерные сценарии.
5. Убедиться, что GitHub Actions завершился зеленым статусом.
6. Добавить публичный репозиторий в репозиторий преподавателя как Git submodule в согласованное место.
