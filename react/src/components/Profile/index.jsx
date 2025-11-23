import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../../api/auth';

const Profile = ({ auth, setAuth }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!auth || !auth.member) {
      navigate('/login');
      return;
    }

    let isMounted = true;

    const loadProfile = async () => {
      setLoading(true);
      setError('');
      setSuccess('');

      try {
        const data = await getProfile();
        if (isMounted) {
          setUsername(data.username || '');
        }
      } catch (err) {
        if (isMounted) {
          setError('Не удалось загрузить профиль.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [auth, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!auth || !auth.member) {
      navigate('/login');
      return;
    }

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const data = await updateProfile({ username });

      const updatedMember = {
        ...auth.member,
        ...data,
      };

      if (setAuth) {
        setAuth({ token: auth.token, member: updatedMember });
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('authMember', JSON.stringify(updatedMember));
      }

      setSuccess('Профиль успешно обновлён.');
    } catch (err) {
      let message = 'Не удалось обновить профиль.';

      if (err && err.response && err.response.data) {
        const details = err.response.data;
        if (typeof details === 'string') {
          message = details;
        } else if (details.username && details.username.length > 0) {
          message = details.username[0];
        }
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-easytag="id1-src/components/Profile/index.jsx">
      <div className="page-card">
        <h1 className="page-title">Профиль пользователя</h1>
        <p className="page-subtitle">Просмотр и изменение имени пользователя.</p>

        {loading ? (
          <p>Загрузка профиля...</p>
        ) : (
          <form onSubmit={handleSubmit} className="form">
            {error ? <div className="form-error">{error}</div> : null}
            {success ? <div className="form-success">{success}</div> : null}

            <div className="form-field">
              <label htmlFor="profile-username" className="form-label">
                Имя пользователя
              </label>
              <input
                id="profile-username"
                type="text"
                className="form-input"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                disabled={saving}
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="button-primary"
                disabled={saving}
              >
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
