import React from 'react';
import { render } from '@testing-library/react';
import { DomOutput } from '../src/components/DomOutput';
import { HtmlOutput } from '../src/components/HtmlOutput';
import { SanitizedHtml } from '../src/components/SanitizedHtml';

const payload = '<img src=x onerror="alert(1)">';

describe('XSS rendering', () => {
  it('creates HTML elements for Reflected/Stored XSS in vulnerable mode', () => {
    const { getByTestId } = render(
      <HtmlOutput mode="vulnerable" value={payload} />
    );

    expect(getByTestId('unsafe-output').querySelector('img')).not.toBeNull();
  });

  it('renders Reflected/Stored XSS input as text in protected mode', () => {
    const { getByTestId } = render(
      <HtmlOutput mode="protected" value={payload} />
    );

    expect(getByTestId('safe-output').querySelector('img')).toBeNull();
    expect(getByTestId('safe-output').textContent).toContain('<img');
  });

  it('keeps DOM-based XSS unsafe in vulnerable mode', () => {
    const { getByTestId } = render(
      <DomOutput mode="vulnerable" value={payload} />
    );

    expect(getByTestId('unsafe-output').querySelector('img')).not.toBeNull();
  });

  it('sanitizes DOM-based XSS in protected mode', () => {
    const { getByTestId } = render(
      <DomOutput mode="protected" value={'<strong>ok</strong>' + payload} />
    );

    const output = getByTestId('sanitized-output');
    expect(output.querySelector('strong')).not.toBeNull();
    expect(output.innerHTML.toLowerCase()).not.toContain('onerror');
  });

  it('allows safe HTML after DOMPurify sanitization', () => {
    const { getByTestId } = render(
      <SanitizedHtml value="<strong>safe text</strong>" />
    );

    expect(
      getByTestId('sanitized-output').querySelector('strong')
    ).not.toBeNull();
  });
});
