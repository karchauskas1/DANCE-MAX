import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';
import { useTeachers } from '../../api/queries';
import styles from './Teachers.module.css';

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

export default function Teachers() {
  const { data: teachers, isLoading } = useTeachers();

  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className={styles.title} variants={itemVariants}>
        <GraduationCap size={24} className={styles.titleIcon} />
        Преподаватели
      </motion.h1>

      {isLoading ? (
        <div className={styles.list}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.card}>
              <Skeleton width={56} height={56} borderRadius="50%" />
              <div className={styles.cardInfo}>
                <Skeleton width="50%" height={18} />
                <Skeleton width="70%" height={14} />
                <Skeleton width="30%" height={14} />
              </div>
            </div>
          ))}
        </div>
      ) : !teachers || teachers.length === 0 ? (
        <motion.p className={styles.empty} variants={itemVariants}>
          Нет данных
        </motion.p>
      ) : (
        <motion.div
          className={styles.list}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {teachers.map((teacher) => (
            <motion.div key={teacher.id} variants={itemVariants}>
              <Link
                to={`/teacher/${teacher.slug}`}
                className={styles.card}
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                <div className={styles.avatar} />
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardName}>{teacher.name}</h3>
                  <span className={styles.cardDirections}>
                    {teacher.specializations.length > 0
                      ? teacher.specializations.join(', ')
                      : teacher.directions.map((d) => d.name).join(', ')}
                  </span>
                  <span className={styles.cardExperience}>
                    Опыт: {teacher.experienceYears}{' '}
                    {teacher.experienceYears === 1
                      ? 'год'
                      : teacher.experienceYears < 5
                        ? 'года'
                        : 'лет'}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
