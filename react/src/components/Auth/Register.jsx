import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as registerMember } from '../../api/auth';

const Register = ({ auth, setAuth }) => {
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
      const data = await registerMember({ username, password });

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('authToken', data.token);
        window.localStorage.setItem('authMember', JSON.stringify(data.member));
      }

      if (setAuth) {
        setAuth({ token: data.token, member: data.member });
      }

      navigate('/');
    } catch (err) {
      let message = 'Не удалось выполнить регистрацию.';

      if (err && err.response && err.response.data) {
        const details = err.response.data;
        if (typeof details === 'string') {
          message = details;
        } else if (details.non_field_errors && details.non_field_errors.length > 0) {
          message = details.non_field_errors[0];
        } else if (details.username && details.username.length > 0) {
          message = details.username[0];
        }
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-easytag="id1-src/components/Auth/Register.jsx">
      <div className="page-card">
        <h1 className="page-title">Регистрация</h1>
        <p className="page-subtitle">Создайте учётную запись для участия в групповом чате.</p>

        {error ? <div className="form-error">{error}</div> : null}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-field">
            <label htmlFor="register-username" className="form-label">
              Имя пользователя
            </label>
            <input
              id="register-username"
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
            <label htmlFor="register-password" className="form-label">
              Пароль
            </label>
            <input
              id="register-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="button-primary"
              disabled={loading}
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
