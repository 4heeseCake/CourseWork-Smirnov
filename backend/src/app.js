const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const { getMode } = require('./mode');
const {
  sanitizeUserHtml,
  createCsrfToken,
  isValidEmail,
} = require('./security');

function createSessionMiddleware(name, cookieOptions) {
  return session({
    name,
    secret: 'coursework-demo-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000,
      secure: false,
      ...cookieOptions,
    },
  });
}

function createApp() {
  const app = express();
  const comments = {
    vulnerable: [],
    protected: [],
  };

  const vulnerableSession = createSessionMiddleware('sid_vulnerable', {
    httpOnly: false,
    sameSite: false,
  });

  const protectedSession = createSessionMiddleware('sid_protected', {
    httpOnly: true,
    sameSite: 'lax',
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: false,
    })
  );

  app.use((req, res, next) => {
    if (getMode(req) === 'protected') {
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
      );
    }
    next();
  });

  app.use((req, res, next) => {
    if (getMode(req) === 'protected') {
      return protectedSession(req, res, next);
    }
    return vulnerableSession(req, res, next);
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/search', (req, res) => {
    const mode = getMode(req);
    const query = String(req.query.q || '');
    const value = mode === 'protected' ? sanitizeUserHtml(query) : query;

    res.json({ mode, value });
  });

  app.get('/api/comments', (req, res) => {
    const mode = getMode(req);
    res.json({ comments: comments[mode] });
  });

  app.post('/api/comments', (req, res) => {
    const mode = getMode(req);
    const source = String(req.body.text || '');
    const text = mode === 'protected' ? sanitizeUserHtml(source) : source;

    const comment = {
      id: comments[mode].length + 1,
      text,
    };

    comments[mode].push(comment);
    res.status(201).json({ comment });
  });

  app.post('/api/login', (req, res) => {
    const mode = getMode(req);
    const { username, password } = req.body;

    if (username !== 'student' || password !== '1234') {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    req.session.user = {
      username: 'student',
      email: 'student@example.com',
    };

    if (mode === 'protected') {
      req.session.csrfToken = createCsrfToken();
    }

    return res.json({ user: req.session.user });
  });

  app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ message: 'Logged out' });
    });
  });

  app.get('/api/me', (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    return res.json({ user: req.session.user });
  });

  app.get('/api/csrf-token', (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (getMode(req) !== 'protected') {
      return res.json({ csrfToken: null });
    }

    if (!req.session.csrfToken) {
      req.session.csrfToken = createCsrfToken();
    }

    return res.json({ csrfToken: req.session.csrfToken });
  });

  app.post('/api/profile/email', (req, res) => {
    const mode = getMode(req);

    if (!req.session.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (mode === 'protected') {
      const token = req.get('X-CSRF-Token') || req.body._csrf;
      if (!token || token !== req.session.csrfToken) {
        return res.status(403).json({ message: 'Invalid CSRF token' });
      }
    }

    if (!isValidEmail(req.body.email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    req.session.user.email = req.body.email;
    return res.json({ user: req.session.user });
  });

  const frontendDirectory =
    process.env.FRONTEND_DIST || path.join(process.cwd(), 'public');

  if (fs.existsSync(frontendDirectory)) {
    app.use(express.static(frontendDirectory));

    app.get(['/', '/vulnerable', '/protected'], (req, res) => {
      res.sendFile(path.join(frontendDirectory, 'index.html'));
    });
  }

  return app;
}

module.exports = { createApp };
