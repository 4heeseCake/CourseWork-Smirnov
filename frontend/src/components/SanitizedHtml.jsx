import { sanitizeDomHtml } from '../lib/dom';

export function SanitizedHtml({ value }) {
  const clean = sanitizeDomHtml(value);

  return (
    <div
      className="output"
      data-testid="sanitized-output"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
