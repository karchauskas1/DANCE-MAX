import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Skeleton from '../../components/ui/Skeleton';
import { useDirection } from '../../api/queries';
import type { Teacher } from '../../types';
import styles from './Direction.module.css';

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

export default function Direction() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = useDirection(slug);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.hero}>
          <Skeleton width={32} height={32} borderRadius="50%" />
          <Skeleton width="60%" height={28} />
        </div>
        <div className={styles.section}>
          <Skeleton width="100%" height={60} />
        </div>
        <div className={styles.section}>
          <Skeleton width="40%" height={22} />
          <Skeleton width="100%" height={48} />
          <Skeleton width="100%" height={48} />
        </div>
        <div className={styles.section}>
          <Skeleton width="40%" height={22} />
          <Skeleton width="100%" height={48} />
          <Skeleton width="100%" height={48} />
          <Skeleton width="100%" height={48} />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.page}>
        <p>Направление не найдено</p>
      </div>
    );
  }

  const { direction, upcomingLessons } = data;

  // Extract unique teachers from upcoming lessons
  const teachers: Teacher[] = [
    ...new Map(
      upcomingLessons.map((l) => [l.teacher.id, l.teacher]),
    ).values(),
  ];

  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero */}
      <motion.div
        className={styles.hero}
        style={{ borderColor: direction.color || '#4ECDC4' }}
        variants={itemVariants}
      >
        <Zap size={32} style={{ color: direction.color || '#4ECDC4' }} />
        <h1 className={styles.title}>{direction.name}</h1>
      </motion.div>

      {/* Description */}
      <motion.section className={styles.section} variants={itemVariants}>
        <p className={styles.description}>
          {direction.description || direction.shortDescription}
        </p>
      </motion.section>

      {/* Teachers */}
      <motion.section className={styles.section} variants={itemVariants}>
        <h2 className={styles.sectionTitle}>
          <Users size={18} className={styles.sectionIcon} />
          Преподаватели
        </h2>
        {teachers.length === 0 ? (
          <p>Нет данных</p>
        ) : (
          <motion.div
            className={styles.teacherList}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {teachers.map((teacher) => (
              <motion.div key={teacher.id} variants={itemVariants}>
                <Link
                  to={`/teacher/${teacher.slug}`}
                  className={styles.teacherCard}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <div className={styles.teacherAvatar} />
                  <div className={styles.teacherInfo}>
                    <span className={styles.teacherName}>{teacher.name}</span>
                    <span className={styles.teacherExp}>
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
      </motion.section>

      {/* Upcoming Lessons */}
      <motion.section className={styles.section} variants={itemVariants}>
        <h2 className={styles.sectionTitle}>
          <Calendar size={18} className={styles.sectionIcon} />
          Ближайшие занятия
        </h2>
        {upcomingLessons.length === 0 ? (
          <p>Нет предстоящих занятий</p>
        ) : (
          <motion.div
            className={styles.lessonList}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {upcomingLessons.map((lesson) => (
              <motion.div key={lesson.id} variants={itemVariants}>
                <Link
                  to={`/lesson/${lesson.id}`}
                  className={styles.lessonCard}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <div className={styles.lessonInfo}>
                    <span className={styles.lessonTitle}>
                      {lesson.direction.name} ({lesson.level})
                    </span>
                    <span className={styles.lessonTime}>
                      {format(new Date(lesson.date), 'EE, d MMM', { locale: ru })},{' '}
                      {lesson.startTime}
                    </span>
                  </div>
                  <span className={styles.lessonSpots}>
                    {lesson.maxSpots - lesson.currentSpots} мест
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.section>
    </motion.div>
  );
}
