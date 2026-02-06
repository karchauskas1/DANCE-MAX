import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Gift, TicketPercent } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { usePromotions, useValidatePromo } from '../../api/queries';
import Toast from '../../components/ui/Toast';
import styles from './Promotions.module.css';

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

function formatPromoDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'd MMM yyyy', { locale: ru });
  } catch {
    return dateStr;
  }
}

function getDiscountLabel(promo: { discountPercent?: number; discountAmount?: number }): string {
  if (promo.discountPercent) return `-${promo.discountPercent}%`;
  if (promo.discountAmount) return `-${(promo.discountAmount / 100).toLocaleString('ru-RU')} ₽`;
  return 'Скидка';
}

export default function Promotions() {
  const { data: promotions, isLoading, error } = usePromotions();
  const validatePromo = useValidatePromo();

  const [promoCode, setPromoCode] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false,
  });

  const handleValidatePromo = () => {
    if (!promoCode.trim()) return;
    // Validate without a specific plan — use planId 0 as a general check
    validatePromo.mutate(
      { code: promoCode.trim(), planId: 0 },
      {
        onSuccess: (res) => {
          if (res.valid) {
            const label = res.discountPercent
              ? `Скидка ${res.discountPercent}%`
              : res.discountAmount
                ? `Скидка ${(res.discountAmount / 100).toLocaleString('ru-RU')} ₽`
                : 'Промокод действителен';
            setToast({ message: label, type: 'success', visible: true });
          } else {
            setToast({ message: 'Промокод недействителен', type: 'error', visible: true });
          }
        },
        onError: (err) => {
          setToast({ message: err.message || 'Ошибка проверки', type: 'error', visible: true });
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>
          <Tag size={24} className={styles.titleIcon} />
          Акции
        </h1>
        <div className={styles.list}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={styles.card}
              style={{ opacity: 0.4, minHeight: 120 }}
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
          <Tag size={24} className={styles.titleIcon} />
          Акции
        </h1>
        <p style={{ color: 'var(--color-error)', textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
          Ошибка загрузки: {error.message}
        </p>
      </div>
    );
  }

  const list = promotions ?? [];

  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className={styles.title} variants={itemVariants}>
        <Tag size={24} className={styles.titleIcon} />
        Акции
      </motion.h1>

      {/* Promotion Cards */}
      {list.length === 0 ? (
        <motion.p
          variants={itemVariants}
          style={{ color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: 'var(--space-2xl)' }}
        >
          Акций пока нет
        </motion.p>
      ) : (
        <motion.div
          className={styles.list}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {list.map((promo) => (
            <motion.div key={promo.id} className={styles.card} variants={itemVariants}>
              <div className={styles.cardHeader}>
                <Gift size={20} className={styles.cardIcon} />
                <span className={styles.discount}>{getDiscountLabel(promo)}</span>
              </div>
              <h3 className={styles.cardTitle}>{promo.title}</h3>
              <p className={styles.cardDescription}>{promo.description}</p>
              <span className={styles.validity}>
                {formatPromoDate(promo.validFrom)} — {formatPromoDate(promo.validUntil)}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Promo Code Input */}
      <motion.section className={styles.promoSection} variants={itemVariants}>
        <h2 className={styles.sectionTitle}>
          <TicketPercent size={18} className={styles.sectionIcon} />
          Есть промокод?
        </h2>
        <div className={styles.promoInput}>
          <input
            type="text"
            className={styles.input}
            placeholder="Введите промокод"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
          />
          <button
            className={styles.applyButton}
            onClick={handleValidatePromo}
            disabled={validatePromo.isPending}
          >
            {validatePromo.isPending ? '...' : 'Применить'}
          </button>
        </div>
      </motion.section>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </motion.div>
  );
}
