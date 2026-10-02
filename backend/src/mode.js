function getMode(req) {
  const requested =
    req.query.mode || req.body?.mode || req.get('X-Demo-Mode') || '';

  if (requested === 'protected' || req.path.startsWith('/protected')) {
    return 'protected';
  }

  return 'vulnerable';
}

module.exports = { getMode };
