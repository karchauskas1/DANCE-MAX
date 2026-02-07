import {
  Users,
  CreditCard,
  TrendingUp,
  CalendarDays,
  Clock,
  ArrowRight,
  Inbox,
} from 'lucide-react';
import { useTodayLessons, useMyBookings } from '../../api/queries';
import { StatCard } from '../components/StatCard';
import styles from './Dashboard.module.css';

const statusLabels: Record<string, string> = {
  active: 'Активна',
  cancelled: 'Отменена',
  attended: 'Посещено',
  missed: 'Пропущено',
};

export function Dashboard() {
  const { data: todayLessonsData, isLoading: lessonsLoading } = useTodayLessons();
  const { data: bookingsData, isLoading: bookingsLoading } = useMyBookings();

  const todayLessons = todayLessonsData ?? [];
  const recentBookings = bookingsData ?? [];

  const todayDate = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Считаем суммарное количество учеников на сегодняшних занятиях
  const totalStudentsToday = todayLessons.reduce(
    (acc, l) => acc + (l.currentSpots ?? 0),
    0,
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Дашборд</h1>
        <span className={styles.date}>{todayDate}</span>
      </div>

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        <StatCard
          icon={<Users size={20} />}
          label="Учеников сегодня"
          value={lessonsLoading ? '—' : String(totalStudentsToday)}
        />
        <StatCard
          icon={<CreditCard size={20} />}
          label="Активных абонементов"
          value="—"
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="Выручка (месяц)"
          value="—"
        />
        <StatCard
          icon={<CalendarDays size={20} />}
          label="Занятий сегодня"
          value={lessonsLoading ? '—' : String(todayLessons.length)}
        />
      </div>

      {/* Charts + Today schedule */}
      <div className={styles.mainGrid}>
        {/* Revenue chart */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Выручка</h2>
            <span className={styles.cardSubtitle}>За последние 7 месяцев</span>
          </div>
          <div className={styles.chartWrap}>
            <div className={styles.emptyChart}>
              <Inbox size={32} className={styles.emptyIcon} />
              <span className={styles.emptyText}>Нет данных</span>
            </div>
          </div>
        </div>

        {/* Today's schedule */}
        <div className={styles.scheduleCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Сегодня</h2>
            <button className={styles.linkBtn} type="button">
              Все расписание
              <ArrowRight size={14} />
            </button>
          </div>
          <div className={styles.lessonsList}>
            {lessonsLoading && (
              <div className={styles.loadingText}>Загрузка...</div>
            )}
            {!lessonsLoading && todayLessons.length === 0 && (
              <div className={styles.emptyState}>
                <Inbox size={24} className={styles.emptyIcon} />
                <span className={styles.emptyText}>Нет занятий на сегодня</span>
              </div>
            )}
            {todayLessons.map((lesson) => (
              <div key={lesson.id} className={styles.lessonRow}>
                <div
                  className={styles.lessonColor}
                  style={{ background: lesson.direction?.color || '#FF5C35' }}
                />
                <div className={styles.lessonTime}>
                  <Clock size={13} />
                  {lesson.startTime}
                </div>
                <div className={styles.lessonInfo}>
                  <span className={styles.lessonDirection}>{lesson.direction?.name ?? '—'}</span>
                  <span className={styles.lessonTeacher}>{lesson.teacher?.name ?? '—'}</span>
                </div>
                <div className={styles.lessonStudents}>
                  <span
                    className={
                      lesson.currentSpots >= lesson.maxSpots
                        ? styles.studentsFull
                        : styles.studentsNormal
                    }
                  >
                    {lesson.currentSpots}/{lesson.maxSpots}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div className={styles.bookingsCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Последние записи</h2>
          <button className={styles.linkBtn} type="button">
            Все записи
            <ArrowRight size={14} />
          </button>
        </div>
        <div className={styles.tableScroll}>
          {bookingsLoading && (
            <div className={styles.loadingText}>Загрузка...</div>
          )}
          {!bookingsLoading && recentBookings.length === 0 && (
            <div className={styles.emptyState}>
              <Inbox size={24} className={styles.emptyIcon} />
              <span className={styles.emptyText}>Нет данных</span>
            </div>
          )}
          {!bookingsLoading && recentBookings.length > 0 && (
            <table className={styles.bookingsTable}>
              <thead>
                <tr>
                  <th>Занятие</th>
                  <th>Направление</th>
                  <th>Дата</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.slice(0, 5).map((b) => (
                  <tr key={b.id}>
                    <td className={styles.bookingStudent}>
                      {b.lesson?.direction?.name ?? '—'}
                    </td>
                    <td>{b.lesson?.teacher?.name ?? '—'}</td>
                    <td>{b.lesson?.date ?? '—'}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[`badge_${b.status}`] ?? ''}`}>
                        {statusLabels[b.status] ?? b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
