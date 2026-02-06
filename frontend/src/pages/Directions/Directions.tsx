import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import styles from './Directions.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const mockDirections = [
  { id: 1, slug: 'hip-hop', name: 'Hip-Hop', lessonsCount: 12, color: '#FF6B6B' },
  { id: 2, slug: 'contemporary', name: 'Contemporary', lessonsCount: 8, color: '#4ECDC4' },
  { id: 3, slug: 'stretching', name: 'Stretching', lessonsCount: 10, color: '#FFE66D' },
  { id: 4, slug: 'vogue', name: 'Vogue', lessonsCount: 6, color: '#A855F7' },
  { id: 5, slug: 'dancehall', name: 'Dancehall', lessonsCount: 5, color: '#F97316' },
  { id: 6, slug: 'breaking', name: 'Breaking', lessonsCount: 4, color: '#06B6D4' },
  { id: 7, slug: 'jazz-funk', name: 'Jazz-Funk', lessonsCount: 7, color: '#EC4899' },
  { id: 8, slug: 'popping', name: 'Popping', lessonsCount: 3, color: '#84CC16' },
];

export default function Directions() {
  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className={styles.title} variants={itemVariants}>
        <Compass size={24} className={styles.titleIcon} />
        Направления
      </motion.h1>

      <motion.div
        className={styles.grid}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {mockDirections.map((direction) => (
          <motion.div
            key={direction.id}
            className={styles.card}
            variants={itemVariants}
          >
            <div
              className={styles.cardAccent}
              style={{ background: direction.color }}
            />
            <h3 className={styles.cardTitle}>{direction.name}</h3>
            <span className={styles.cardMeta}>
              {direction.lessonsCount} занятий в неделю
            </span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
