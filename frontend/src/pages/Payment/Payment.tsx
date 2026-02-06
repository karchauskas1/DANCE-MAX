import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Check, TicketPercent, Loader2 } from 'lucide-react';
import { usePaymentPlans, useValidatePromo, usePurchase } from '../../api/queries';
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
  const navigate = useNavigate();
  const { data: plans, isLoading, error } = usePaymentPlans();
  const validatePromo = useValidatePromo();
  const purchase = usePurchase();

  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState<{ percent?: number; amount?: number } | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false,
  });

  // Auto-select the popular plan once data loads
  const activePlan = selectedPlan ?? plans?.find((p) => p.isPopular)?.id ?? plans?.[0]?.id ?? null;
  const plan = plans?.find((p) => p.id === activePlan);

  // Compute total price in kopecks, applying discount
  let totalKopecks = plan?.price ?? 0;
  if (promoDiscount) {
    if (promoDiscount.percent) {
      totalKopecks = Math.round(totalKopecks * (1 - promoDiscount.percent / 100));
    } else if (promoDiscount.amount) {
      totalKopecks = Math.max(0, totalKopecks - promoDiscount.amount);
    }
  }

  const handleValidatePromo = () => {
    if (!promoCode.trim() || !activePlan) return;
    validatePromo.mutate(
      { code: promoCode.trim(), planId: activePlan },
      {
        onSuccess: (res) => {
          if (res.valid) {
            setPromoDiscount({
              percent: res.discountPercent,
              amount: res.discountAmount,
            });
            setToast({ message: 'Промокод применён!', type: 'success', visible: true });
          } else {
            setPromoDiscount(null);
            setToast({ message: 'Промокод недействителен', type: 'error', visible: true });
          }
        },
        onError: (err) => {
          setPromoDiscount(null);
          setToast({ message: err.message || 'Ошибка проверки промокода', type: 'error', visible: true });
        },
      },
    );
  };

  const handlePurchase = () => {
    if (!activePlan) return;
    purchase.mutate(
      { planId: activePlan, promoCode: promoCode.trim() || undefined },
      {
        onSuccess: () => {
          setToast({ message: 'Оплата прошла успешно!', type: 'success', visible: true });
          setTimeout(() => navigate('/profile'), 1500);
        },
        onError: (err) => {
          setToast({ message: err.message || 'Ошибка оплаты', type: 'error', visible: true });
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

      {/* Plan Cards */}
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
              onClick={() => {
                setSelectedPlan(p.id);
                setPromoDiscount(null);
              }}
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

      {/* Promo Code */}
      <motion.section className={styles.section} variants={itemVariants}>
        <div className={styles.promoRow}>
          <TicketPercent size={18} className={styles.promoIcon} />
          <input
            type="text"
            className={styles.promoInput}
            placeholder="Промокод"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
          />
          <button
            className={styles.promoButton}
            onClick={handleValidatePromo}
            disabled={validatePromo.isPending}
          >
            {validatePromo.isPending ? '...' : 'OK'}
          </button>
        </div>
      </motion.section>

      {/* Total */}
      <motion.div className={styles.totalRow} variants={itemVariants}>
        <span className={styles.totalLabel}>Итого</span>
        <span className={styles.totalValue}>
          {(totalKopecks / 100).toLocaleString('ru-RU')} ₽
        </span>
      </motion.div>

      {/* Pay Button */}
      <motion.div className={styles.actions} variants={itemVariants}>
        <button
          className={styles.payButton}
          onClick={handlePurchase}
          disabled={!activePlan || purchase.isPending}
        >
          {purchase.isPending ? (
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
