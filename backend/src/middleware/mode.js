function selectMode(req, res, next) {
  const mode = req.query.mode || 'protected';
  if (!['vulnerable', 'protected'].includes(mode)) {
    return res.status(400).json({ message: 'Invalid demo mode' });
  }
  req.mode = mode;
  next();
}
module.exports = { selectMode };
