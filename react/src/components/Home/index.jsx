import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMessages, sendMessage } from '../../api/chat';

export const Home = ({ auth }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!auth || !auth.member) {
      return;
    }

    let isMounted = true;
    let intervalId = null;

    const loadMessages = async () => {
      if (!isMounted) {
        return;
      }

      try {
        const data = await getMessages();
        if (isMounted) {
          setMessages(Array.isArray(data) ? data : []);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError('Не удалось загрузить сообщения чата.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    loadMessages();

    if (typeof window !== 'undefined') {
      intervalId = window.setInterval(loadMessages, 7000);
    }

    return () => {
      isMounted = false;
      if (intervalId && typeof window !== 'undefined') {
        window.clearInterval(intervalId);
      }
    };
  }, [auth]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!newMessage.trim()) {
      return;
    }

    setSending(true);
    setError('');

    try {
      const created = await sendMessage({ content: newMessage });
      setMessages((prev) => [...prev, created]);
      setNewMessage('');
    } catch (err) {
      setError('Не удалось отправить сообщение.');
    } finally {
      setSending(false);
    }
  };

  if (!auth || !auth.member) {
    return (
      <div data-easytag="id1-src/components/Home/index.jsx">
        <div className="page-card">
          <h1 className="page-title">Групповой чат</h1>
          <p className="page-subtitle">
            Для участия в чате необходимо войти в систему.
          </p>
          <div className="form-actions">
            <Link to="/login" className="button-primary-link">
              Войти
            </Link>
            <Link to="/register" className="button-secondary-link">
              Регистрация
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-easytag="id1-src/components/Home/index.jsx">
      <div className="page-card">
        <h1 className="page-title">Групповой чат (главная страница)</h1>
        <p className="page-subtitle">
          Обменивайтесь сообщениями с другими участниками в реальном времени.
        </p>

        {error ? <div className="form-error">{error}</div> : null}

        <div className="chat-container">
          <div className="chat-messages">
            {loading && messages.length === 0 ? (
              <p>Загрузка сообщений...</p>
            ) : null}

            {!loading && messages.length === 0 ? (
              <p className="chat-empty">Пока нет сообщений. Напишите первое!</p>
            ) : null}

            {messages.map((message) => {
              const username = message.member_username ||
                (message.member && message.member.username) ||
                'Участник';

              let timestamp = '';
              if (message.created_at) {
                try {
                  const date = new Date(message.created_at);
                  timestamp = date.toLocaleString('ru-RU');
                } catch (err) {
                  timestamp = '';
                }
              }

              return (
                <div key={message.id} className="chat-message">
                  <div className="chat-message-header">
                    <span className="chat-message-author">{username}</span>
                    {timestamp ? (
                      <span className="chat-message-time">{timestamp}</span>
                    ) : null}
                  </div>
                  <div className="chat-message-content">{message.content}</div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="chat-input-form">
            <label htmlFor="chat-message" className="form-label">
              Новое сообщение
            </label>
            <textarea
              id="chat-message"
              className="form-input chat-input-textarea"
              rows={3}
              value={newMessage}
              onChange={(event) => setNewMessage(event.target.value)}
              disabled={sending}
              placeholder="Введите текст сообщения..."
            />
            <div className="form-actions">
              <button
                type="submit"
                className="button-primary"
                disabled={sending || !newMessage.trim()}
              >
                {sending ? 'Отправка...' : 'Отправить сообщение'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
