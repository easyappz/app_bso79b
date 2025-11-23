import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginMember } from '../../api/auth';

const Login = ({ auth, setAuth }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (auth && auth.member) {
      navigate('/');
    }
  }, [auth, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginMember({ username, password });

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('authToken', data.token);
        window.localStorage.setItem('authMember', JSON.stringify(data.member));
      }

      if (setAuth) {
        setAuth({ token: data.token, member: data.member });
      }

      navigate('/');
    } catch (err) {
      let message = 'Не удалось выполнить вход.';

      if (err && err.response && err.response.data) {
        const details = err.response.data;
        if (typeof details === 'string') {
          message = details;
        } else if (details.non_field_errors && details.non_field_errors.length > 0) {
          message = details.non_field_errors[0];
        } else if (details.detail) {
          message = details.detail;
        }
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-easytag="id1-src/components/Auth/Login.jsx">
      <div className="page-card">
        <h1 className="page-title">Вход</h1>
        <p className="page-subtitle">Войдите, чтобы участвовать в групповом чате.</p>

        {error ? <div className="form-error">{error}</div> : null}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-field">
            <label htmlFor="login-username" className="form-label">
              Имя пользователя
            </label>
            <input
              id="login-username"
              type="text"
              className="form-input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={loading}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="login-password" className="form-label">
              Пароль
            </label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="button-primary"
              disabled={loading}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
