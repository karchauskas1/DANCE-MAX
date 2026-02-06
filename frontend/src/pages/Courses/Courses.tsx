import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Skeleton from '../../components/ui/Skeleton';
import { useCourses } from '../../api/queries';
import styles from './Courses.module.css';

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

export default function Courses() {
  const { data: courses, isLoading } = useCourses();

  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className={styles.title} variants={itemVariants}>
        <BookOpen size={24} className={styles.titleIcon} />
        Спецкурсы и интенсивы
      </motion.h1>

      {isLoading ? (
        <div className={styles.list}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.card}>
              <Skeleton width="100%" height={120} borderRadius="12px" />
              <div className={styles.cardBody}>
                <Skeleton width="70%" height={20} />
                <Skeleton width="50%" height={14} />
                <Skeleton width="40%" height={14} />
              </div>
            </div>
          ))}
        </div>
      ) : !courses || courses.length === 0 ? (
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
          {courses.map((course) => (
            <motion.div key={course.id} variants={itemVariants}>
              <Link
                to={`/course/${course.id}`}
                className={styles.card}
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                <div className={styles.cardImage} />
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{course.name}</h3>
                  <div className={styles.cardMeta}>
                    {course.teacher && (
                      <span className={styles.metaItem}>
                        <User size={14} />
                        {course.teacher.name}
                      </span>
                    )}
                    <span className={styles.metaItem}>
                      <Clock size={14} />
                      {format(new Date(course.startDate), 'd MMMM yyyy', { locale: ru })}
                    </span>
                  </div>
                  <div className={styles.cardFooter}>
                    <span className={styles.lessonsCount}>
                      {course.lessonsCount} занятий
                    </span>
                    <span className={styles.price}>
                      {(course.price / 100).toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                  {course.spotsLeft > 0 && (
                    <span className={styles.spotsLeft}>
                      Осталось {course.spotsLeft} мест
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
