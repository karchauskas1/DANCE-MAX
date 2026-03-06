import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Check, Loader2 } from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import { usePaymentPlans, useCreateInvoice } from '../../api/queries';
import Toast from '../../components/ui/Toast';
import styles from './Payment.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Payment() {
  const { data: plans, isLoading, error } = usePaymentPlans();
  const createInvoice = useCreateInvoice();
  const [isPaying, setIsPaying] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false,
  });

  // Автовыбор популярного тарифа
  const activePlan = selectedPlan ?? plans?.find((p) => p.isPopular)?.id ?? plans?.[0]?.id ?? null;
  const plan = plans?.find((p) => p.id === activePlan);
  const totalKopecks = plan?.price ?? 0;

  const handlePurchase = () => {
    if (!activePlan) return;
    setIsPaying(true);

    createInvoice.mutate(
      { planId: activePlan },
      {
        onSuccess: (paymentUrl) => {
          // Открываем страницу оплаты ЮКассы
          try {
            WebApp.openLink(paymentUrl);
          } catch {
            // Вне Telegram — открываем в новой вкладке
            window.open(paymentUrl, '_blank');
          }
          setIsPaying(false);
          setToast({ message: 'Перенаправляем на страницу оплаты...', type: 'info', visible: true });
        },
        onError: (err) => {
          setIsPaying(false);
          setToast({ message: err.message || 'Ошибка создания платежа', type: 'error', visible: true });
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>
          <CreditCard size={24} className={styles.titleIcon} />
          Абонементы
        </h1>
        <div className={styles.plans}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={styles.planCard}
              style={{ opacity: 0.4, minHeight: 140 }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>
          <CreditCard size={24} className={styles.titleIcon} />
          Абонементы
        </h1>
        <p style={{ color: 'var(--color-error)', textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
          Ошибка загрузки: {error.message}
        </p>
      </div>
    );
  }

  const planList = plans ?? [];

  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className={styles.title} variants={itemVariants}>
        <CreditCard size={24} className={styles.titleIcon} />
        Абонементы
      </motion.h1>

      {/* Карточки тарифов */}
      {planList.length === 0 ? (
        <motion.p
          variants={itemVariants}
          style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}
        >
          Нет доступных абонементов
        </motion.p>
      ) : (
        <motion.div
          className={styles.plans}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {planList.map((p) => (
            <motion.button
              key={p.id}
              className={`${styles.planCard} ${activePlan === p.id ? styles.planCardSelected : ''}`}
              onClick={() => setSelectedPlan(p.id)}
              variants={itemVariants}
            >
              {p.isPopular && <span className={styles.popularBadge}>Популярный</span>}
              <span className={styles.planLessons}>{p.lessonsCount}</span>
              <span className={styles.planLessonsLabel}>занятий</span>
              <span className={styles.planPrice}>
                {(p.price / 100).toLocaleString('ru-RU')} ₽
              </span>
              <span className={styles.planPerLesson}>
                {(p.pricePerLesson / 100).toLocaleString('ru-RU')} ₽/занятие
              </span>
              {activePlan === p.id && (
                <div className={styles.checkMark}>
                  <Check size={16} />
                </div>
              )}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Итого */}
      <motion.div className={styles.totalRow} variants={itemVariants}>
        <span className={styles.totalLabel}>Итого</span>
        <span className={styles.totalValue}>
          {(totalKopecks / 100).toLocaleString('ru-RU')} ₽
        </span>
      </motion.div>

      {/* Кнопка оплаты */}
      <motion.div className={styles.actions} variants={itemVariants}>
        <button
          className={styles.payButton}
          onClick={handlePurchase}
          disabled={!activePlan || isPaying || createInvoice.isPending}
        >
          {(isPaying || createInvoice.isPending) ? (
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            'Оплатить'
          )}
        </button>
      </motion.div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </motion.div>
  );
}
