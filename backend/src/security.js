const crypto = require('crypto');
const sanitizeHtml = require('sanitize-html');

function sanitizeUserHtml(value) {
  return sanitizeHtml(String(value || ''), {
    allowedTags: ['b', 'strong', 'i', 'em', 'p', 'br'],
    allowedAttributes: {},
  });
}

function createCsrfToken() {
  return crypto.randomBytes(24).toString('hex');
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));
}

module.exports = {
  sanitizeUserHtml,
  createCsrfToken,
  isValidEmail,
};
