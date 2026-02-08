import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { Users, ArrowRight } from 'lucide-react';
import styles from './Onboarding.module.css';

const TOTAL_SLIDES = 5;
const SWIPE_THRESHOLD = 50;

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

const slideTransition = {
  x: { type: 'spring' as const, stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 },
};

export default function Onboarding() {
  const navigate = useNavigate();
  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = useCallback(
    (newDir: number) => {
      const next = page + newDir;
      if (next < 0 || next >= TOTAL_SLIDES) return;
      setPage([next, newDir]);
    },
    [page],
  );

  function complete() {
    localStorage.setItem('dancemax_onboarded', '1');
    navigate('/', { replace: true });
  }

  function handleAddToHome() {
    // Telegram WebApp API for adding to home screen
    const tg = (window as unknown as Record<string, unknown>).Telegram as
      | { WebApp?: { addToHomeScreen?: () => void } }
      | undefined;
    if (tg?.WebApp?.addToHomeScreen) {
      tg.WebApp.addToHomeScreen();
    }
    complete();
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD) paginate(1);
    else if (info.offset.x > SWIPE_THRESHOLD) paginate(-1);
  }

  function handleNext() {
    if (page === TOTAL_SLIDES - 1) {
      handleAddToHome();
    } else {
      paginate(1);
    }
  }

  return (
    <div className={styles.container}>
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={page}
          className={styles.slide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={slideTransition}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
        >
          {page === 0 && <SlideWelcome />}
          {page === 1 && <SlideSchedule />}
          {page === 2 && <SlideSubscriptions />}
          {page === 3 && <SlideInstructors />}
          {page === 4 && <SlideAddToHome />}

          <div className={styles.bottomSection} style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '0 24px 80px',
          }}>
            <button className={styles.primaryButton} onClick={handleNext} type="button">
              {page === 0
                ? 'Начать \u2192'
                : page === TOTAL_SLIDES - 1
                  ? 'Добавить на рабочий стол'
                  : 'Далее \u2192'}
            </button>
            {page === TOTAL_SLIDES - 1 && (
              <button className={styles.skipLink} onClick={complete} type="button">
                Пропустить
              </button>
            )}
            <Indicators current={page} />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ---------- Indicators ---------- */

function Indicators({ current }: { current: number }) {
  return (
    <div className={styles.indicators}>
      {Array.from({ length: TOTAL_SLIDES }, (_, i) => (
        <div
          key={i}
          className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
        />
      ))}
    </div>
  );
}

/* ---------- Slide 1: Welcome ---------- */

function SlideWelcome() {
  return (
    <div className={styles.safeArea} style={{ paddingTop: 60 }}>
      <div className={styles.welcomeContent}>
        <div className={styles.welcomeHeader}>
          <h1 className={`${styles.title} ${styles.titleLarge}`}>Dance Max</h1>
          <p className={styles.subtitle}>Твоя студия танцев — в кармане</p>
        </div>
        <p className={styles.description}>
          Запись на занятия, расписание, оплата и абонементы — всё в одном месте.
          Без скачивания приложений.
        </p>
      </div>
    </div>
  );
}

/* ---------- Slide 2: Schedule ---------- */

function SlideSchedule() {
  return (
    <div className={styles.safeArea}>
      <div className={styles.content}>
        <div className={styles.textSection}>
          <h2 className={styles.title}>Выбирай и записывайся</h2>
          <p className={styles.description}>
            Смотри расписание по дням, выбирай направление — бачата, сальса,
            кизомба — и записывайся в один тап. Видишь свободные места в реальном
            времени.
          </p>
        </div>

        <div className={styles.visual}>
          <div className={styles.scheduleCard}>
            <div className={styles.scheduleCardHeader}>
              <div className={styles.scheduleCardInfo}>
                <span className={styles.scheduleDate}>Сегодня, 19:00</span>
                <span className={styles.scheduleClassName}>
                  Бачата для начинающих
                </span>
              </div>
              <Users size={24} className={styles.scheduleIcon} />
            </div>
            <div className={styles.scheduleCardFooter}>
              <span className={styles.scheduleInstructor}>
                Инструктор: Мария
              </span>
              <span className={styles.scheduleSpots}>
                <Users size={16} />
                3/12 мест
              </span>
            </div>
            <button className={styles.bookButton} type="button">
              Записаться
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Slide 3: Subscriptions ---------- */

function SlideSubscriptions() {
  return (
    <div className={styles.safeArea}>
      <div className={styles.content}>
        <div className={styles.textSection}>
          <h2 className={styles.title}>Покупай абонемент онлайн</h2>
          <p className={styles.description}>
            Выбери тариф — от пробного до безлимита. Оплата прямо в Telegram, без
            переходов на внешние сайты. Баланс занятий всегда под рукой.
          </p>
        </div>

        <div className={styles.visual}>
          <div className={styles.cardsStack}>
            <div className={styles.cardBack} />
            <div className={styles.cardMiddle} />
            <div className={styles.cardFront}>
              <span className={styles.popularBadge}>Популярный</span>
              <span className={styles.cardTitle}>Стандарт</span>
              <span className={styles.cardSubtitle}>8 занятий в месяц</span>
              <span className={styles.cardPrice}>4 900 ₽</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Slide 4: Instructors ---------- */

const AVATARS = [
  { initials: 'МК', variant: 'primary' as const },
  { initials: 'АП', variant: 'dark' as const },
  { initials: 'ЕС', variant: 'primary' as const },
];

const TAGS = ['Бачата', 'Кизомба', 'Реггетон', 'Lady Style'];

function SlideInstructors() {
  return (
    <div className={styles.safeArea}>
      <div className={styles.content}>
        <div className={styles.textSection}>
          <h2 className={styles.title}>Знакомься с командой</h2>
          <p className={styles.description}>
            Бачата, кизомба, реггетон, lady style — выбери своё направление. У
            каждого преподавателя — профиль с опытом, стилем и отзывами.
          </p>
        </div>

        <div className={styles.visual}>
          <div className={styles.instructorsRow}>
            {AVATARS.map((a) => (
              <div
                key={a.initials}
                className={`${styles.avatar} ${
                  a.variant === 'dark' ? styles.avatarDark : styles.avatarPrimary
                }`}
              >
                <span className={styles.avatarText}>{a.initials}</span>
              </div>
            ))}
          </div>
          <div className={styles.tagsRow}>
            {TAGS.map((t) => (
              <span key={t} className={styles.tag}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Slide 5: Add to Home ---------- */

const APP_COLORS = [
  '#2563EB', '#10B981', '#8B5CF6', '#F59E0B',
  '#8D1F1F', '#6B7280', '#EC4899', '#14B8A6',
];

const STEPS = [
  'Нажми \u22EE (меню) в Telegram',
  "Выбери 'Добавить на главный экран'",
  'Готово! Открывай одним тапом',
];

function SlideAddToHome() {
  return (
    <div className={styles.safeArea}>
      <div className={styles.content} style={{ gap: 36 }}>
        <div className={styles.textSection}>
          <h2 className={styles.title}>Всегда под рукой</h2>
          <p className={styles.description}>
            Добавь Dance Max на главный экран телефона — открывай одним тапом, как
            обычное приложение. Никаких скачиваний из App Store или Google Play.
          </p>
        </div>

        <div className={styles.visual} style={{ minHeight: 240 }}>
          <div className={styles.iconRow}>
            <div className={styles.appIcon}>
              <span className={styles.appIconText}>D</span>
            </div>
            <ArrowRight size={24} className={styles.arrowIcon} />
            <div className={styles.phoneScreen}>
              <div className={styles.appsRow}>
                {APP_COLORS.slice(0, 4).map((c) => (
                  <div
                    key={c}
                    className={styles.appDot}
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div className={styles.appsRow}>
                {APP_COLORS.slice(4).map((c, i) => (
                  <div
                    key={c}
                    className={`${styles.appDot} ${i === 0 ? styles.appDotDanceMax : ''}`}
                    style={i === 0 ? undefined : { background: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className={styles.stepsContainer}>
            {STEPS.map((text, i) => (
              <div key={i} className={styles.step}>
                <div className={styles.stepNumber}>{i + 1}</div>
                <span className={styles.stepText}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
