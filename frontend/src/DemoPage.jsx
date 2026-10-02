import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HtmlOutput } from './components/HtmlOutput';
import { DomOutput } from './components/DomOutput';
import { apiRequest } from './lib/api';

function readHash() {
  try {
    return decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return window.location.hash.slice(1);
  }
}

export function DemoPage() {
  const { mode: routeMode } = useParams();
  const mode = routeMode === 'protected' ? 'protected' : 'vulnerable';

  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [domValue, setDomValue] = useState(readHash());
  const [username, setUsername] = useState('student');
  const [password, setPassword] = useState('1234');
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [message, setMessage] = useState('');

  async function refreshProfile() {
    try {
      const data = await apiRequest('/api/me', mode);
      setUser(data.user);
      setMessage('Profile refreshed');
    } catch (error) {
      setUser(null);
      setMessage(error.message);
    }
  }

  useEffect(() => {
    apiRequest('/api/comments', mode)
      .then((data) => setComments(data.comments))
      .catch((error) => setMessage(error.message));

    const params = new URLSearchParams(window.location.search);
    const preparedSearch = params.get('search');
    if (preparedSearch) {
      setSearch(preparedSearch);
      apiRequest(`/api/search?q=${encodeURIComponent(preparedSearch)}`, mode)
        .then((data) => setSearchResult(data.value))
        .catch((error) => setMessage(error.message));
    }
  }, [mode]);

  useEffect(() => {
    const handleHashChange = () => setDomValue(readHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  async function submitSearch(event) {
    event.preventDefault();
    const data = await apiRequest(
      `/api/search?q=${encodeURIComponent(search)}`,
      mode
    );
    setSearchResult(data.value);
  }

  async function submitComment(event) {
    event.preventDefault();
    await apiRequest('/api/comments', mode, {
      method: 'POST',
      body: JSON.stringify({ text: comment }),
    });
    setComment('');
    const data = await apiRequest('/api/comments', mode);
    setComments(data.comments);
  }

  async function login(event) {
    event.preventDefault();
    try {
      const data = await apiRequest('/api/login', mode, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setUser(data.user);
      setMessage('Login successful');

      if (mode === 'protected') {
        const tokenData = await apiRequest('/api/csrf-token', mode);
        setCsrfToken(tokenData.csrfToken);
      }
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function changeEmail(event) {
    event.preventDefault();
    try {
      const data = await apiRequest('/api/profile/email', mode, {
        method: 'POST',
        headers:
          mode === 'protected' ? { 'X-CSRF-Token': csrfToken } : undefined,
        body: JSON.stringify({ email }),
      });
      setUser(data.user);
      setMessage('Email changed');
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <main className="page">
      <header className="header">
        <div>
          <h1>XSS & CSRF Demo</h1>
          <p>
            Mode: <strong>{mode}</strong>
          </p>
        </div>
        <nav>
          <Link to="/vulnerable">Vulnerable</Link>
          <Link to="/protected">Protected</Link>
        </nav>
      </header>

      <section className="card">
        <h2>Reflected XSS</h2>
        <form onSubmit={submitSearch}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search text or XSS payload"
          />
          <button type="submit">Search</button>
        </form>
        <HtmlOutput mode={mode} value={searchResult} />
      </section>

      <section className="card">
        <h2>Stored XSS</h2>
        <form onSubmit={submitComment}>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Comment"
          />
          <button type="submit">Add comment</button>
        </form>
        <div className="comments">
          {comments.map((item) => (
            <HtmlOutput key={item.id} mode={mode} value={item.text} />
          ))}
        </div>
      </section>

      <section className="card">
        <h2>DOM-based XSS</h2>
        <p>Payload source: URL fragment after #.</p>
        <DomOutput mode={mode} value={domValue} />
      </section>

      <section className="card">
        <h2>Session and CSRF</h2>
        <form onSubmit={login}>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Username"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
          />
          <button type="submit">Login</button>
        </form>

        <p>
          Current user:{' '}
          {user ? `${user.username}, ${user.email}` : 'not logged in'}
        </p>
        <button type="button" onClick={refreshProfile}>
          Refresh profile
        </button>

        <form onSubmit={changeEmail}>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="new@example.com"
          />
          <button type="submit">Change email</button>
        </form>
        {message && <p className="message">{message}</p>}
      </section>

      <section className="card note">
        <h2>Attacker page</h2>
        <p>
          Open <code>http://localhost:4000</code> in another tab after logging
          in.
        </p>
      </section>
    </main>
  );
}
