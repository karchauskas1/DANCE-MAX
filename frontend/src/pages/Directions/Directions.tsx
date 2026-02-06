import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';
import { useDirections } from '../../api/queries';
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

export default function Directions() {
  const { data: directions, isLoading } = useDirections();

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

      {isLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.card}>
              <Skeleton width="100%" height={6} borderRadius="6px" />
              <Skeleton width="60%" height={20} />
              <Skeleton width="40%" height={14} />
            </div>
          ))}
        </div>
      ) : !directions || directions.length === 0 ? (
        <motion.p className={styles.empty} variants={itemVariants}>
          Нет данных
        </motion.p>
      ) : (
        <motion.div
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {directions.map((direction) => (
            <motion.div
              key={direction.id}
              variants={itemVariants}
            >
              <Link
                to={`/direction/${direction.slug}`}
                className={styles.card}
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                <div
                  className={styles.cardAccent}
                  style={{ background: direction.color || '#4ECDC4' }}
                />
                <h3 className={styles.cardTitle}>{direction.name}</h3>
                {direction.shortDescription && (
                  <span className={styles.cardMeta}>
                    {direction.shortDescription}
                  </span>
                )}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
