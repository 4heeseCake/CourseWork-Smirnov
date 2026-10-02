export async function apiRequest(path, mode, options = {}) {
  const separator = path.includes('?') ? '&' : '?';
  const response = await fetch(`${path}${separator}mode=${mode}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}
