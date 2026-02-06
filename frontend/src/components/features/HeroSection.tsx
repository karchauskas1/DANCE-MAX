import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import styles from './HeroSection.module.css';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

/**
 * Wraps the last word of the title in a gradient-text span.
 * E.g. "Готовы танцевать?" renders "Готовы" as plain text
 * and "танцевать?" with the primary gradient.
 */
function renderTitle(title: string) {
  const words = title.split(' ');
  if (words.length <= 1) {
    return <span className={styles.gradientWord}>{title}</span>;
  }
  const leading = words.slice(0, -1).join(' ');
  const accent = words[words.length - 1];
  return (
    <>
      {leading}{' '}
      <span className={styles.gradientWord}>{accent}</span>
    </>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  },
};

export default function HeroSection({
  title,
  subtitle,
  ctaText,
  onCtaClick,
}: HeroSectionProps) {
  return (
    <motion.section
      className={styles.hero}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.glowCircle} />

      {subtitle && (
        <motion.p className={styles.subtitle} variants={itemVariants}>
          {subtitle}
        </motion.p>
      )}

      <motion.h1 className={styles.title} variants={itemVariants}>
        {renderTitle(title)}
      </motion.h1>

      {ctaText && (
        <motion.button
          className={styles.cta}
          variants={itemVariants}
          onClick={onCtaClick}
          type="button"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          {ctaText}
          <ArrowRight size={16} strokeWidth={2.5} />
        </motion.button>
      )}
    </motion.section>
  );
}
