export function HtmlOutput({ mode, value }) {
  if (mode === 'vulnerable') {
    return (
      <div
        className="output"
        data-testid="unsafe-output"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  }

  return (
    <div className="output" data-testid="safe-output">
      {value}
    </div>
  );
}
