import { motion } from 'framer-motion';
import { Users, Calendar, BarChart3 } from 'lucide-react';
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

const mockGroups = [
  {
    id: 1,
    direction: 'Hip-Hop',
    title: 'Hip-Hop с нуля',
    schedule: 'Пн, Ср 18:00',
    teacher: 'Алексей К.',
    startDate: '1 февраля',
    spots: 3,
    level: 'Без опыта',
  },
  {
    id: 2,
    direction: 'Contemporary',
    title: 'Contemporary с нуля',
    schedule: 'Вт, Чт 19:00',
    teacher: 'Мария С.',
    startDate: '3 февраля',
    spots: 5,
    level: 'Без опыта',
  },
  {
    id: 3,
    direction: 'Stretching',
    title: 'Растяжка для начинающих',
    schedule: 'Пн, Ср, Пт 10:00',
    teacher: 'Ольга П.',
    startDate: '5 февраля',
    spots: 8,
    level: 'Без опыта',
  },
  {
    id: 4,
    direction: 'Vogue',
    title: 'Vogue с нуля',
    schedule: 'Сб 14:00',
    teacher: 'Дмитрий В.',
    startDate: '8 февраля',
    spots: 2,
    level: 'Без опыта',
  },
];

export default function Groups() {
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

      <motion.div
        className={styles.list}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {mockGroups.map((group) => (
          <motion.div key={group.id} className={styles.card} variants={itemVariants}>
            <span className={styles.badge}>{group.direction}</span>
            <h3 className={styles.cardTitle}>{group.title}</h3>
            <div className={styles.cardMeta}>
              <span className={styles.metaItem}>
                <Calendar size={14} />
                {group.schedule}
              </span>
              <span className={styles.metaItem}>
                <BarChart3 size={14} />
                {group.level}
              </span>
            </div>
            <div className={styles.cardFooter}>
              <span className={styles.teacher}>{group.teacher}</span>
              <span className={styles.spots}>{group.spots} мест</span>
            </div>
            <span className={styles.startDate}>Старт: {group.startDate}</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
