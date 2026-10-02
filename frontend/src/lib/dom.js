import DOMPurify from 'dompurify';

export function sanitizeDomHtml(value) {
  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'p', 'br'],
    ALLOWED_ATTR: [],
  });
}
