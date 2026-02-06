import {
  Users,
  CreditCard,
  TrendingUp,
  CalendarDays,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { StatCard } from '../components/ui/StatCard';
import styles from './Dashboard.module.css';

/* -- Мок-данные -- */
const revenueData = [
  { month: 'Авг', value: 124000 },
  { month: 'Сен', value: 189000 },
  { month: 'Окт', value: 215000 },
  { month: 'Ноя', value: 198000 },
  { month: 'Дек', value: 267000 },
  { month: 'Янв', value: 312000 },
  { month: 'Фев', value: 285000 },
];

const todayLessons = [
  { id: 1, time: '10:00', direction: 'Бачата', teacher: 'Анна К.', students: 8, max: 12, color: '#FF5C35' },
  { id: 2, time: '12:00', direction: 'Сальса', teacher: 'Мигель Р.', students: 15, max: 15, color: '#FFB84D' },
  { id: 3, time: '14:00', direction: 'Кизомба', teacher: 'Дмитрий П.', students: 6, max: 10, color: '#A78BFA' },
  { id: 4, time: '18:00', direction: 'Танго', teacher: 'Елена С.', students: 11, max: 14, color: '#F472B6' },
  { id: 5, time: '19:30', direction: 'Бачата (продвинутые)', teacher: 'Анна К.', students: 10, max: 10, color: '#FF5C35' },
];

const recentBookings = [
  { id: 1, student: 'Мария Иванова', lesson: 'Бачата', date: '07.02.2026', status: 'active' },
  { id: 2, student: 'Алексей Петров', lesson: 'Сальса', date: '07.02.2026', status: 'active' },
  { id: 3, student: 'Ольга Смирнова', lesson: 'Кизомба', date: '07.02.2026', status: 'cancelled' },
  { id: 4, student: 'Дмитрий Козлов', lesson: 'Танго', date: '06.02.2026', status: 'attended' },
  { id: 5, student: 'Екатерина Волкова', lesson: 'Бачата', date: '06.02.2026', status: 'attended' },
];

const statusLabels: Record<string, string> = {
  active: 'Активна',
  cancelled: 'Отменена',
  attended: 'Посещено',
};

export function Dashboard() {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Дашборд</h1>
        <span className={styles.date}>7 февраля 2026</span>
      </div>

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        <StatCard
          icon={<Users size={20} />}
          label="Учеников сегодня"
          value="50"
          trend={{ value: '+12%', direction: 'up' }}
        />
        <StatCard
          icon={<CreditCard size={20} />}
          label="Активных абонементов"
          value="184"
          trend={{ value: '+5%', direction: 'up' }}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="Выручка (месяц)"
          value="285 000 ₽"
          trend={{ value: '-8%', direction: 'down' }}
        />
        <StatCard
          icon={<CalendarDays size={20} />}
          label="Занятий сегодня"
          value="5"
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
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF5C35" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#FF5C35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#A3A3A3' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#A3A3A3' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                  formatter={(v: number) => [`${v.toLocaleString('ru-RU')} ₽`, 'Выручка']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#FF5C35"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
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
            {todayLessons.map((lesson) => (
              <div key={lesson.id} className={styles.lessonRow}>
                <div
                  className={styles.lessonColor}
                  style={{ background: lesson.color }}
                />
                <div className={styles.lessonTime}>
                  <Clock size={13} />
                  {lesson.time}
                </div>
                <div className={styles.lessonInfo}>
                  <span className={styles.lessonDirection}>{lesson.direction}</span>
                  <span className={styles.lessonTeacher}>{lesson.teacher}</span>
                </div>
                <div className={styles.lessonStudents}>
                  <span
                    className={
                      lesson.students >= lesson.max
                        ? styles.studentsFull
                        : styles.studentsNormal
                    }
                  >
                    {lesson.students}/{lesson.max}
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
        <table className={styles.bookingsTable}>
          <thead>
            <tr>
              <th>Ученик</th>
              <th>Занятие</th>
              <th>Дата</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {recentBookings.map((b) => (
              <tr key={b.id}>
                <td className={styles.bookingStudent}>{b.student}</td>
                <td>{b.lesson}</td>
                <td>{b.date}</td>
                <td>
                  <span className={`${styles.badge} ${styles[`badge_${b.status}`]}`}>
                    {statusLabels[b.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
