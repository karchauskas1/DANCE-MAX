import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, CreditCard, CheckCircle } from 'lucide-react';
import styles from './Course.module.css';

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

const mockCourse = {
  id: '1',
  title: 'Интенсив по Hip-Hop',
  description:
    'Шестидневный интенсив для тех, кто хочет углубить свои знания в Hip-Hop. Разберем продвинутые техники, поработаем над музыкальностью и подготовим номер.',
  dates: '20-25 января 2025',
  time: 'Ежедневно, 18:00 - 20:00',
  teacher: 'Алексей К.',
  lessons: 6,
  price: 4500,
  spotsLeft: 4,
  includes: [
    'Видеозаписи всех занятий',
    'Сертификат об окончании',
    'Чат с преподавателем',
  ],
};

export default function Course() {
  const { id } = useParams<{ id: string }>();
  const course = { ...mockCourse, id: id || mockCourse.id };

  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Image */}
      <motion.div className={styles.image} variants={itemVariants} />

      {/* Title */}
      <motion.h1 className={styles.title} variants={itemVariants}>
        {course.title}
      </motion.h1>

      {/* Description */}
      <motion.p className={styles.description} variants={itemVariants}>
        {course.description}
      </motion.p>

      {/* Info rows */}
      <motion.div className={styles.infoRow} variants={itemVariants}>
        <Calendar size={18} className={styles.infoIcon} />
        <div className={styles.infoContent}>
          <span className={styles.infoLabel}>Даты</span>
          <span className={styles.infoValue}>{course.dates}</span>
        </div>
      </motion.div>

      <motion.div className={styles.infoRow} variants={itemVariants}>
        <Clock size={18} className={styles.infoIcon} />
        <div className={styles.infoContent}>
          <span className={styles.infoLabel}>Время</span>
          <span className={styles.infoValue}>{course.time}</span>
        </div>
      </motion.div>

      <motion.div className={styles.infoRow} variants={itemVariants}>
        <User size={18} className={styles.infoIcon} />
        <div className={styles.infoContent}>
          <span className={styles.infoLabel}>Преподаватель</span>
          <span className={styles.infoValue}>{course.teacher}</span>
        </div>
      </motion.div>

      <motion.div className={styles.infoRow} variants={itemVariants}>
        <CreditCard size={18} className={styles.infoIcon} />
        <div className={styles.infoContent}>
          <span className={styles.infoLabel}>Стоимость</span>
          <span className={styles.infoValue}>
            {course.price.toLocaleString('ru-RU')} руб. / {course.lessons} занятий
          </span>
        </div>
      </motion.div>

      {/* Includes */}
      <motion.section className={styles.section} variants={itemVariants}>
        <h2 className={styles.sectionTitle}>Что входит</h2>
        <ul className={styles.includesList}>
          {course.includes.map((item) => (
            <li key={item} className={styles.includesItem}>
              <CheckCircle size={16} className={styles.checkIcon} />
              {item}
            </li>
          ))}
        </ul>
      </motion.section>

      {/* Enroll Button */}
      <motion.div className={styles.actions} variants={itemVariants}>
        <div className={styles.spotsInfo}>
          Осталось {course.spotsLeft} мест
        </div>
        <button className={styles.enrollButton}>Записаться</button>
      </motion.div>
    </motion.div>
  );
}
