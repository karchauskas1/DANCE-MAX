import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Calendar, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Skeleton from '../../components/ui/Skeleton';
import { useCourses } from '../../api/queries';
import styles from './Groups.module.css';

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

export default function Groups() {
  const { data: courses, isLoading } = useCourses();

  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className={styles.title} variants={itemVariants}>
        <Users size={24} className={styles.titleIcon} />
        Группы с нуля
      </motion.h1>

      <motion.p className={styles.intro} variants={itemVariants}>
        Никогда не танцевали? Не проблема! Наши группы для начинающих
        созданы специально для тех, кто делает первые шаги в танцах.
        Опытные преподаватели помогут вам освоить базу и полюбить танцы.
      </motion.p>

      {isLoading ? (
        <div className={styles.list}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.card}>
              <Skeleton width="30%" height={20} borderRadius="8px" />
              <Skeleton width="60%" height={18} />
              <Skeleton width="80%" height={14} />
              <Skeleton width="100%" height={14} />
            </div>
          ))}
        </div>
      ) : !courses || courses.length === 0 ? (
        <motion.div variants={itemVariants}>
          <p>Нет данных о группах.</p>
          <Link to="/schedule?level=beginner" style={{ color: 'var(--accent)' }}>
            Посмотреть расписание для начинающих
          </Link>
        </motion.div>
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
                {course.direction && (
                  <span className={styles.badge}>{course.direction.name}</span>
                )}
                <h3 className={styles.cardTitle}>{course.name}</h3>
                <div className={styles.cardMeta}>
                  <span className={styles.metaItem}>
                    <Calendar size={14} />
                    {format(new Date(course.startDate), 'd MMMM yyyy', { locale: ru })}
                  </span>
                  <span className={styles.metaItem}>
                    <BarChart3 size={14} />
                    {course.lessonsCount} занятий
                  </span>
                </div>
                <div className={styles.cardFooter}>
                  {course.teacher && (
                    <span className={styles.teacher}>{course.teacher.name}</span>
                  )}
                  <span className={styles.spots}>
                    {course.spotsLeft > 0
                      ? `${course.spotsLeft} мест`
                      : 'Мест нет'}
                  </span>
                </div>
                <span className={styles.startDate}>
                  Старт: {format(new Date(course.startDate), 'd MMMM', { locale: ru })}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
