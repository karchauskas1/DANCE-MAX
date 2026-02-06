import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Briefcase, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Skeleton from '../../components/ui/Skeleton';
import { useTeacher } from '../../api/queries';
import styles from './Teacher.module.css';

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

export default function Teacher() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = useTeacher(slug);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <Skeleton width={96} height={96} borderRadius="50%" />
          <Skeleton width="50%" height={28} />
        </div>
        <div className={styles.section}>
          <Skeleton width="100%" height={60} />
        </div>
        <div className={styles.section}>
          <Skeleton width="40%" height={22} />
          <Skeleton width="80%" height={28} />
        </div>
        <div className={styles.section}>
          <Skeleton width="40%" height={22} />
          <Skeleton width="30%" height={20} />
        </div>
        <div className={styles.section}>
          <Skeleton width="40%" height={22} />
          <Skeleton width="100%" height={48} />
          <Skeleton width="100%" height={48} />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.page}>
        <p>Преподаватель не найден</p>
      </div>
    );
  }

  const { teacher, schedule } = data;

  // Build specializations list from teacher.specializations or teacher.directions
  const specializations =
    teacher.specializations.length > 0
      ? teacher.specializations
      : teacher.directions.map((d) => d.name);

  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Photo & Name */}
      <motion.div className={styles.header} variants={itemVariants}>
        <div className={styles.photo} />
        <h1 className={styles.name}>{teacher.name}</h1>
      </motion.div>

      {/* Bio */}
      {teacher.bio && (
        <motion.section className={styles.section} variants={itemVariants}>
          <p className={styles.bio}>{teacher.bio}</p>
        </motion.section>
      )}

      {/* Specializations */}
      {specializations.length > 0 && (
        <motion.section className={styles.section} variants={itemVariants}>
          <h2 className={styles.sectionTitle}>
            <Award size={18} className={styles.sectionIcon} />
            Специализации
          </h2>
          <div className={styles.tags}>
            {specializations.map((spec) => (
              <span key={spec} className={styles.tag}>
                {spec}
              </span>
            ))}
          </div>
        </motion.section>
      )}

      {/* Experience */}
      <motion.section className={styles.section} variants={itemVariants}>
        <h2 className={styles.sectionTitle}>
          <Briefcase size={18} className={styles.sectionIcon} />
          Опыт
        </h2>
        <p className={styles.experienceValue}>
          {teacher.experienceYears}{' '}
          {teacher.experienceYears === 1
            ? 'год'
            : teacher.experienceYears < 5
              ? 'года'
              : 'лет'}
        </p>
      </motion.section>

      {/* Schedule */}
      <motion.section className={styles.section} variants={itemVariants}>
        <h2 className={styles.sectionTitle}>
          <Calendar size={18} className={styles.sectionIcon} />
          Ближайшие занятия
        </h2>
        {schedule.length === 0 ? (
          <p>Нет предстоящих занятий</p>
        ) : (
          <motion.div
            className={styles.lessonList}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {schedule.map((lesson) => (
              <motion.div key={lesson.id} variants={itemVariants}>
                <Link
                  to={`/lesson/${lesson.id}`}
                  className={styles.lessonCard}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <div className={styles.lessonInfo}>
                    <span className={styles.lessonTitle}>
                      {lesson.direction.name}
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
