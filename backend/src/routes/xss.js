const { Router } = require('express');
const { sanitizeUserHtml } = require('../security');
const { checkOrigin, requireCsrf } = require('../middleware/security');
function xssRoutes(repository) {
  const router = Router();
  const clean = (mode, text) =>
    mode === 'protected' ? sanitizeUserHtml(text) : text;
  router.get('/search', (req, res) => {
    const q = req.query.q || '';
    if (typeof q !== 'string' || q.length > 4000)
      return res.status(400).json({ message: 'Invalid query' });
    res.json({ mode: req.mode, value: clean(req.mode, q) });
  });
  router.get('/comments', (req, res) =>
    res.json({ comments: repository.list(req.mode) })
  );
  router.post('/comments', checkOrigin, requireCsrf, (req, res) => {
    const text = req.body.text;
    if (typeof text !== 'string' || !text.trim() || text.length > 4000)
      return res.status(400).json({ message: 'Invalid comment' });
    const comment = repository.add(req.mode, clean(req.mode, text));
    if (!comment)
      return res
        .status(409)
        .json({ message: 'Demo storage is full; restart backend' });
    res.status(201).json({ comment });
  });
  return router;
}
module.exports = { xssRoutes };
