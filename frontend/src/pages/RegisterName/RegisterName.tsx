/* Форма ввода настоящего ФИО — три отдельных поля (фамилия, имя, отчество).
   Показывается один раз после онбординга. Двойное подтверждение:
   ввод → модалка «Вы уверены?» → сохранение. */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSetRealName } from '../../api/queries';
import styles from './RegisterName.module.css';

const fieldVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.3, ease: 'easeOut' as const },
  }),
};

export default function RegisterName() {
  const navigate = useNavigate();
  const setRealName = useSetRealName();

  const [lastName,   setLastName]   = useState('');
  const [firstName,  setFirstName]  = useState('');
  const [patronymic, setPatronymic] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const trimmed = {
    last:  lastName.trim(),
    first: firstName.trim(),
    patr:  patronymic.trim(),
  };

  const isValid =
    trimmed.last.length >= 2 &&
    trimmed.first.length >= 2 &&
    trimmed.patr.length >= 2;

  const fullName = `${trimmed.last} ${trimmed.first} ${trimmed.patr}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setError('');
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setRealName.mutate(
      {
        realLastName:   trimmed.last,
        realFirstName:  trimmed.first,
        realPatronymic: trimmed.patr,
      },
      {
        onSuccess: () => {
          // Навигация здесь; обновление Zustand происходит внутри хука
          navigate('/', { replace: true });
        },
        onError: (err) => {
          setShowConfirm(false);
          setError(err.message || 'Ошибка сохранения');
        },
      },
    );
  };

  const fields = [
    { label: 'Фамилия',  value: lastName,   set: setLastName,   autoComplete: 'family-name'     as const, i: 0 },
    { label: 'Имя',      value: firstName,  set: setFirstName,  autoComplete: 'given-name'      as const, i: 1 },
    { label: 'Отчество', value: patronymic, set: setPatronymic, autoComplete: 'additional-name' as const, i: 2 },
  ];

  return (
    <div className={styles.page}>
      <motion.form
        className={styles.card}
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <img src="/logo-circle.png" alt="Dance Max" className={styles.logo} />

        <h1 className={styles.title}>Регистрация</h1>

        <div className={styles.fields}>
          {fields.map(({ label, value, set, autoComplete, i }) => (
            <motion.div
              key={label}
              className={styles.inputGroup}
              custom={i}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
            >
              <label className={styles.label}>{label}</label>
              <input
                type="text"
                className={styles.input}
                placeholder={label}
                value={value}
                onChange={(e) => set(e.target.value)}
                autoComplete={autoComplete}
                autoFocus={i === 0}
              />
            </motion.div>
          ))}
        </div>

        <p className={styles.hint}>
          Вводите в соответствии с паспортными данными
        </p>

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={!isValid}
        >
          Готово
        </button>
      </motion.form>

      {/* Модалка двойного подтверждения */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className={styles.confirmOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              className={styles.confirmCard}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className={styles.confirmTitle}>Проверьте данные</h2>

              <div className={styles.confirmName}>{fullName}</div>

              <p className={styles.confirmWarning}>
                Нажимая «Подтвердить», вы подтверждаете, что введённые данные
                соответствуют паспортным данным.
              </p>

              <div className={styles.confirmButtons}>
                <button
                  type="button"
                  className={`${styles.confirmBtn} ${styles.btnBack}`}
                  onClick={() => setShowConfirm(false)}
                >
                  Ввести заново
                </button>
                <button
                  type="button"
                  className={`${styles.confirmBtn} ${styles.btnConfirm}`}
                  onClick={handleConfirm}
                  disabled={setRealName.isPending}
                >
                  {setRealName.isPending ? 'Сохраняю...' : 'Подтвердить'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
