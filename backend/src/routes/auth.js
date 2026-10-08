const { Router } = require('express');
const { createCsrfToken } = require('../security');
const {
  requireUser,
  checkOrigin,
  requireCsrf,
} = require('../middleware/security');
function authRoutes() {
  const router = Router();
  router.post('/login', checkOrigin, (req, res, next) => {
    if (req.body.username !== 'student' || req.body.password !== '1234')
      return res.status(401).json({ message: 'Invalid username or password' });
    req.session.regenerate((error) => {
      if (error) return next(error);
      req.session.user = { username: 'student', email: 'student@example.com' };
      req.session.csrfToken = createCsrfToken();
      req.session.save((err) =>
        err ? next(err) : res.json({ user: req.session.user })
      );
    });
  });
  router.post(
    '/logout',
    requireUser,
    checkOrigin,
    requireCsrf,
    (req, res, next) => {
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie(`sid_${req.mode}`, { path: '/' });
        res.json({ message: 'Logged out' });
      });
    }
  );
  router.get('/me', requireUser, (req, res) =>
    res.json({ user: req.session.user })
  );
  router.get('/csrf-token', (req, res) => {
    if (req.mode === 'vulnerable') return res.json({ csrfToken: null });
    if (!req.session.csrfToken) req.session.csrfToken = createCsrfToken();
    res.json({ csrfToken: req.session.csrfToken });
  });
  return router;
}
module.exports = { authRoutes };
