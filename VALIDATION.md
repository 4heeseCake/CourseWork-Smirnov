# Протокол проверки обновлённого стенда

Дата подготовки: 08.10.2026. Проверки выполнялись в среде Node.js вне Docker.

| Проверка | Результат |
| --- | --- |
| Backend Vitest / Supertest | 20 из 20 пройдено |
| Frontend Vitest / jsdom | 6 из 6 пройдено |
| ESLint backend / frontend | Пройдено |
| Prettier backend / frontend | Пройдено |
| Синтаксис серверов Node.js | Пройдено |
| Vite production build | Пройдено |
| HTTP smoke через frontend:3000 | Пройдено |
| Docker build / Compose | Не выполнено: Docker Engine отсутствует |
| GitHub Actions | Не запускался в удалённом репозитории |
| Playwright / Chromium | Не выполнено: браузер отсутствует, загрузка не удалась |

HTTP smoke подтвердил выдачу обеих страниц, CSP protected-документа,
отсутствие CSP vulnerable-документа, доступность attacker, прохождение
Set-Cookie через proxy, получение токена и изменение email с этим токеном.
Локальная проверка не подтверждает изоляцию Docker-сетей. jsdom-проверки DOM
не подтверждают исполнение alert или применение браузером SameSite/CSP.

Команды для повторения: README.md. Код браузерной проверки: e2e/browser.cjs.
Docker-проверки включены в .github/workflows/ci.yml.
