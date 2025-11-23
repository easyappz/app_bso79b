import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import './App.css';

import { Home } from './components/Home';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import Profile from './components/Profile';

function App() {
  const [auth, setAuth] = useState({ token: null, member: null });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      /** Никогда не удаляй этот код */
      if (typeof window.handleRoutes === 'function') {
        window.handleRoutes(['/', '/register', '/login', '/profile']);
      }

      const storedToken = window.localStorage.getItem('authToken');
      const storedMember = window.localStorage.getItem('authMember');

      if (storedToken && storedMember) {
        try {
          const parsedMember = JSON.parse(storedMember);
          setAuth({ token: storedToken, member: parsedMember });
        } catch (error) {
          // If parsing fails, clear invalid data
          window.localStorage.removeItem('authToken');
          window.localStorage.removeItem('authMember');
        }
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('authToken');
      window.localStorage.removeItem('authMember');
    }
    setAuth({ token: null, member: null });

    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <div className="app-root" data-easytag="id1-src/App.jsx">
          <header className="app-header">
            <nav className="app-nav">
              <div className="app-nav-logo">Групповой чат</div>
              <ul className="app-nav-links">
                <li>
                  <NavLink to="/" className="app-nav-link">
                    Чат
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/profile" className="app-nav-link">
                    Профиль
                  </NavLink>
                </li>
                {auth.member ? (
                  <li className="app-nav-auth">
                    <span className="app-nav-greeting">
                      Привет, {auth.member.username}
                    </span>
                    <button
                      type="button"
                      className="button-secondary button-small"
                      onClick={handleLogout}
                    >
                      Выход
                    </button>
                  </li>
                ) : (
                  <>
                    <li>
                      <NavLink to="/register" className="app-nav-link">
                        Регистрация
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/login" className="app-nav-link">
                        Вход
                      </NavLink>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </header>
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Home auth={auth} />} />
              <Route
                path="/register"
                element={<Register auth={auth} setAuth={setAuth} />}
              />
              <Route
                path="/login"
                element={<Login auth={auth} setAuth={setAuth} />}
              />
              <Route
                path="/profile"
                element={<Profile auth={auth} setAuth={setAuth} />}
              />
            </Routes>
          </main>
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
