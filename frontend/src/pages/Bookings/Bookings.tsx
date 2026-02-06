import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Clock, MapPin } from 'lucide-react';
import styles from './Bookings.module.css';

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

const mockUpcoming = [
  { id: 1, title: 'Hip-Hop Начинающие', date: '18 января', time: '18:00', room: 'Зал 1', teacher: 'Алексей К.' },
  { id: 2, title: 'Stretching', date: '19 января', time: '10:00', room: 'Зал 2', teacher: 'Ольга П.' },
  { id: 3, title: 'Contemporary', date: '20 января', time: '19:00', room: 'Зал 1', teacher: 'Мария С.' },
];

const mockPast = [
  { id: 4, title: 'Hip-Hop Начинающие', date: '15 января', time: '18:00', room: 'Зал 1', teacher: 'Алексей К.' },
  { id: 5, title: 'Vogue', date: '13 января', time: '20:00', room: 'Зал 2', teacher: 'Дмитрий В.' },
];

type Tab = 'upcoming' | 'past';

export default function Bookings() {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');

  const lessons = activeTab === 'upcoming' ? mockUpcoming : mockPast;

  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className={styles.title} variants={itemVariants}>
        <CalendarCheck size={24} className={styles.titleIcon} />
        Мои записи
      </motion.h1>

      {/* Tabs */}
      <motion.div className={styles.tabs} variants={itemVariants}>
        <button
          className={`${styles.tab} ${activeTab === 'upcoming' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Предстоящие
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'past' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Прошедшие
        </button>
      </motion.div>

      {/* Lesson List */}
      <motion.div
        className={styles.list}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={activeTab}
      >
        {lessons.map((lesson) => (
          <motion.div key={lesson.id} className={styles.card} variants={itemVariants}>
            <h3 className={styles.cardTitle}>{lesson.title}</h3>
            <div className={styles.cardMeta}>
              <span className={styles.metaItem}>
                <Clock size={14} />
                {lesson.date}, {lesson.time}
              </span>
              <span className={styles.metaItem}>
                <MapPin size={14} />
                {lesson.room}
              </span>
            </div>
            <span className={styles.cardTeacher}>{lesson.teacher}</span>
            {activeTab === 'upcoming' && (
              <button className={styles.cancelButton}>Отменить запись</button>
            )}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
