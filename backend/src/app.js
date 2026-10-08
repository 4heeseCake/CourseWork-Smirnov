const express = require('express');
const helmet = require('helmet');
const { csp } = require('./config');
const { selectMode } = require('./middleware/mode');
const { sessions } = require('./middleware/session');
const { createCommentRepository } = require('./repositories/comments');
const { xssRoutes } = require('./routes/xss');
const { authRoutes } = require('./routes/auth');
const { profileRoutes } = require('./routes/profile');
function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(
    helmet({ contentSecurityPolicy: false, strictTransportSecurity: false })
  );
  app.use(express.json({ limit: '16kb' }));
  app.use(express.urlencoded({ extended: false, limit: '16kb' }));
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api', selectMode, sessions(), (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.mode === 'protected') res.setHeader('Content-Security-Policy', csp);
    next();
  });
  app.use('/api', authRoutes(), xssRoutes(createCommentRepository()));
  app.use('/api/profile', profileRoutes());
  app.use((req, res) => res.status(404).json({ message: 'Not found' }));
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    const status = err.status === 413 ? 413 : err.status === 400 ? 400 : 500;
    res.status(status).json({
      message:
        status === 500 ? 'Internal server error' : 'Invalid request body',
    });
  });
  return app;
}
module.exports = { createApp };
