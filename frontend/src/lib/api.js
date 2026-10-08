export async function apiRequest(path, mode, options = {}) {
  const separator = path.includes('?') ? '&' : '?';
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (
    mode === 'protected' &&
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method) &&
    path !== '/api/login'
  ) {
    const token = await apiRequest('/api/csrf-token', mode);
    headers['X-CSRF-Token'] = token.csrfToken;
  }
  const response = await fetch(`${path}${separator}mode=${mode}`, {
    ...options,
    credentials: 'same-origin',
    headers,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}
