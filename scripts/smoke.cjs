const assert = require('node:assert/strict');
(async () => {
  for (const url of ['http://localhost:3000/api/health','http://localhost:3000/vulnerable','http://localhost:3000/protected','http://localhost:4000/']) {
    const response = await fetch(url);
    assert.equal(response.status, 200, url);
    if (url.endsWith('/protected')) assert.match(response.headers.get('content-security-policy'), /script-src 'self'/);
    if (url.endsWith('/vulnerable')) assert.equal(response.headers.get('content-security-policy'), null);
  }
  const login = await fetch('http://localhost:3000/api/login?mode=protected', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'student',password:'1234'})});
  assert.equal(login.status,200);
  const cookie = login.headers.getSetCookie()[0].split(';')[0];
  const tokenResponse = await fetch('http://localhost:3000/api/csrf-token?mode=protected', {headers:{Cookie:cookie}});
  const {csrfToken} = await tokenResponse.json();
  const response = await fetch('http://localhost:3000/api/profile/email?mode=protected', {method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json','X-CSRF-Token':csrfToken},body:JSON.stringify({email:'smoke@example.com'})});
  assert.equal(response.status,200);
  assert.equal((await response.json()).user.email,'smoke@example.com');
  console.log('Smoke: HTML, CSP, attacker, proxy, session and CSRF passed');
})().catch(error => { console.error(error); process.exit(1); });
