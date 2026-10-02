import { HtmlOutput } from './HtmlOutput';
import { SanitizedHtml } from './SanitizedHtml';

export function DomOutput({ mode, value }) {
  if (mode === 'vulnerable') {
    return <HtmlOutput mode="vulnerable" value={value} />;
  }

  return <SanitizedHtml value={value} />;
}
