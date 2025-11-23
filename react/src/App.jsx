import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import './App.css';

import { Home } from './components/Home';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import Profile from './components/Profile';

function App() {
  /** Никогда не удаляй этот код */
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
      window.handleRoutes(['/', '/register', '/login', '/profile']);
    }
  }, []);

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
                  <NavLink to="/register" className="app-nav-link">
                    Регистрация
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/login" className="app-nav-link">
                    Вход
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/profile" className="app-nav-link">
                    Профиль
                  </NavLink>
                </li>
              </ul>
            </nav>
          </header>
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
