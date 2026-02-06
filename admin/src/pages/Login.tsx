import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, LogIn } from 'lucide-react';
import { FormField } from '../components/ui/FormField';
import styles from './Login.module.css';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Мок-авторизация
    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }

    // Имитация входа
    navigate('/');
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Flame size={28} />
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>DanceMax</span>
            <span className={styles.logoBadge}>Admin</span>
          </div>
        </div>

        <div className={styles.header}>
          <h1 className={styles.title}>Вход в панель</h1>
          <p className={styles.subtitle}>
            Введите данные администратора для входа
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <FormField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="admin@dancemax.ru"
            required
          />
          <FormField
            label="Пароль"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Введите пароль"
            required
          />

          {error && <div className={styles.error}>{error}</div>}

          <button className={styles.submitBtn} type="submit">
            <LogIn size={18} />
            Войти
          </button>
        </form>

        <p className={styles.footer}>
          Доступ только для администраторов студии
        </p>
      </div>
    </div>
  );
}
