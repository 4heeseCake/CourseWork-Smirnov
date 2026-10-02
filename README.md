# XSS & CSRF Demo

Учебное демонстрационное веб-приложение для курсовой работы «Исследование уязвимостей XSS и CSRF: создание демонстрационного веб-приложения с имитацией атак и защитой».

> Проект содержит намеренно уязвимый режим. Запускайте его только локально в учебных целях.

## Цель

Сравнить поведение одного приложения в двух режимах:

- `vulnerable` — намеренно оставлены XSS- и CSRF-уязвимости;
- `protected` — включены санитизация, безопасный React-рендеринг, DOMPurify, CSP, CSRF-токены и настройки cookies.

## Архитектура

```text
xss-csrf-demo/
├── backend/              Express API, sessions, XSS/CSRF logic and tests
├── frontend/             React + Vite UI and frontend tests
├── attacker/             Separate attacker page for attack simulation
├── .github/workflows/    GitHub Actions pipeline
├── Dockerfile            Multi-stage React + Node.js build
├── docker-compose.yml    Application + attacker page
└── README.md
```

## Реализованные сценарии

### XSS

- Reflected XSS;
- Stored XSS with in-memory storage;
- DOM-based XSS;
- backend sanitization with `sanitize-html`;
- safe React text rendering;
- DOMPurify when HTML rendering is required;
- Content Security Policy in protected mode.

### CSRF

- cookie-based sessions with `express-session`;
- login using demo account `student / 1234`;
- email change as a state-changing operation;
- vulnerable mode without CSRF validation;
- protected mode with session-bound CSRF token;
- `HttpOnly` and `SameSite=Lax` for the protected session cookie;
- separate attacker page.

## Local development

Requirements: Node.js 20+ and npm.

Install dependencies:

```bash
npm run install:all
```

Terminal 1:

```bash
npm run dev:backend
```

Terminal 2:

```bash
npm run dev:frontend
```

Open:

- frontend: `http://localhost:5173/vulnerable`;
- protected mode: `http://localhost:5173/protected`.

For the attacker page in development, it is easiest to use Docker Compose or any simple static HTTP server.

## Docker launch

On Windows, Docker Desktop can provide the Docker Engine and Compose backend. The GUI does not have to be used during the demonstration.

```bash
docker compose up --build
```

Then open:

- `http://localhost:3000/vulnerable`;
- `http://localhost:3000/protected`;
- `http://localhost:4000` — attacker page.

Stop:

```bash
docker compose down
```

## Verification commands

```bash
npm run lint
npm run format:check
npm test
npm run build
```

Or run the main local CI sequence:

```bash
npm run ci
```

The GitHub Actions workflow uses the same order: lint/format -> tests -> build -> Docker build.

## Demonstration order

1. Open `/vulnerable`.
2. Check Reflected, Stored and DOM-based XSS with a local harmless payload such as `<img src=x onerror="alert('XSS')">`.
3. Open `/protected` and repeat the same payloads.
4. Log in as `student / 1234` in vulnerable mode.
5. Open `http://localhost:4000` and submit the vulnerable CSRF form.
6. Return to the application and press `Refresh profile`: the email becomes `attacker@example.com`.
7. Repeat in protected mode. The attacker request should be rejected with HTTP 403 because it has no valid CSRF token.

## Edge cases covered by tests

- mixed-case and nested XSS payloads;
- Stored and Reflected XSS in both modes;
- missing CSRF token;
- forged token;
- token copied from another session;
- request without a session cookie;
- invalid email;
- CSP, X-Frame-Options and X-Content-Type-Options headers.

## CI/CD

`.github/workflows/ci.yml` runs on push and pull request and performs:

```text
lint + format check -> tests -> build -> Docker build
```

This repository is intended to be public and can be connected to the teacher repository as a Git submodule.
