import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

const iconMap: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const toastVariants = {
  initial: { opacity: 0, y: -24, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', damping: 22, stiffness: 320 },
  },
  exit: {
    opacity: 0,
    y: -16,
    scale: 0.96,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
  },
};

export default function Toast({ message, type, isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [isVisible, onClose]);

  const Icon = iconMap[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <div className={styles.container}>
          <motion.div
            className={`${styles.toast} ${styles[type]}`}
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            role="alert"
            aria-live="assertive"
          >
            <span className={styles.icon}>
              <Icon />
            </span>
            <span className={styles.message}>{message}</span>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Dismiss"
              type="button"
            >
              <X />
            </button>
            <span className={styles.progress} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
