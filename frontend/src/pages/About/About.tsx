import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Heart, Navigation, Send } from 'lucide-react';
import styles from './About.module.css';

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

const studioInfo = {
  name: 'Dance Max',
  description:
    'Dance Max — это современная танцевальная студия в центре города. Здесь учат танцевать в самых популярных социальных направлениях — для любого уровня подготовки. Танец — это язык. И наша миссия — научить говорить на нём уверенно.',
  addresses: [
    { label: 'Основной филиал', address: 'ул. Рубинштейна, 1/43' },
    { label: 'Второй филиал', address: 'ул. Политехническая, 17/2' },
  ],
  phone: '+7 (995) 230-04-23',
  telegram: '@dancemaxhelp',
  workingHours: [
    { days: 'Пн — Пт', hours: '12:00 — 23:00' },
    { days: 'Сб', hours: '10:00 — 23:00' },
    { days: 'Вс', hours: '10:00 — 20:00' },
  ],
};

export default function About() {
  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Title */}
      <motion.div className={styles.header} variants={itemVariants}>
        <Heart size={32} className={styles.headerIcon} />
        <h1 className={styles.title}>О студии</h1>
        <span className={styles.studioName}>{studioInfo.name}</span>
      </motion.div>

      {/* Description */}
      <motion.section className={styles.section} variants={itemVariants}>
        <p className={styles.description}>{studioInfo.description}</p>
      </motion.section>

      {/* Адреса */}
      <motion.section className={styles.section} variants={itemVariants}>
        <h2 className={styles.sectionTitle}>
          <MapPin size={18} className={styles.sectionIcon} />
          Наши филиалы
        </h2>
        {studioInfo.addresses.map((a) => (
          <div key={a.label} style={{ marginBottom: 12 }}>
            <p className={styles.infoText} style={{ fontWeight: 600, marginBottom: 2 }}>{a.label}</p>
            <p className={styles.infoText}>{a.address}</p>
          </div>
        ))}
        <a
          className={styles.directionsButton}
          href="https://yandex.ru/maps/?text=Рубинштейна+1/43+Санкт-Петербург"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Navigation size={18} className={styles.directionsIcon} />
          <span>Проложить маршрут</span>
        </a>
      </motion.section>

      {/* Контакты */}
      <motion.section className={styles.section} variants={itemVariants}>
        <h2 className={styles.sectionTitle}>Контакты</h2>
        <div className={styles.contactList}>
          <a className={styles.contactRow} href={`tel:${studioInfo.phone.replace(/[() -]/g, '')}`}>
            <Phone size={18} className={styles.contactIcon} />
            <span className={styles.contactValue}>{studioInfo.phone}</span>
          </a>
          <a className={styles.contactRow} href={`https://t.me/${studioInfo.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
            <Send size={18} className={styles.contactIcon} />
            <span className={styles.contactValue}>Telegram: {studioInfo.telegram}</span>
          </a>
        </div>
      </motion.section>

      {/* Working Hours */}
      <motion.section className={styles.section} variants={itemVariants}>
        <h2 className={styles.sectionTitle}>
          <Clock size={18} className={styles.sectionIcon} />
          Часы работы
        </h2>
        <div className={styles.hoursList}>
          {studioInfo.workingHours.map((item) => (
            <div key={item.days} className={styles.hoursRow}>
              <span className={styles.hoursDays}>{item.days}</span>
              <span className={styles.hoursTime}>{item.hours}</span>
            </div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
