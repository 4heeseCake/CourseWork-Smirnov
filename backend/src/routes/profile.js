const { Router } = require('express');
const { isValidEmail } = require('../security');
const {
  requireUser,
  checkOrigin,
  requireCsrf,
} = require('../middleware/security');
function profileRoutes() {
  const router = Router();
  router.post('/email', requireUser, checkOrigin, requireCsrf, (req, res) => {
    if (
      typeof req.body.email !== 'string' ||
      req.body.email.length > 254 ||
      !isValidEmail(req.body.email)
    )
      return res.status(400).json({ message: 'Invalid email address' });
    req.session.user.email = req.body.email;
    res.json({ user: req.session.user });
  });
  return router;
}
module.exports = { profileRoutes };
