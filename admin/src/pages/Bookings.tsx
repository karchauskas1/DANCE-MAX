import { useState } from 'react';
import { Check, X as XIcon, Filter } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import styles from './Bookings.module.css';

interface Booking {
  id: number;
  student: string;
  direction: string;
  teacher: string;
  date: string;
  time: string;
  status: string;
  [key: string]: unknown;
}

const mockBookings: Booking[] = [
  { id: 1, student: 'Мария Иванова', direction: 'Бачата', teacher: 'Анна К.', date: '07.02.2026', time: '10:00', status: 'active' },
  { id: 2, student: 'Алексей Петров', direction: 'Сальса', teacher: 'Мигель Р.', date: '07.02.2026', time: '12:00', status: 'active' },
  { id: 3, student: 'Ольга Смирнова', direction: 'Кизомба', teacher: 'Дмитрий П.', date: '07.02.2026', time: '14:00', status: 'cancelled' },
  { id: 4, student: 'Дмитрий Козлов', direction: 'Танго', teacher: 'Елена С.', date: '07.02.2026', time: '18:00', status: 'active' },
  { id: 5, student: 'Екатерина Волкова', direction: 'Бачата', teacher: 'Анна К.', date: '07.02.2026', time: '19:30', status: 'active' },
  { id: 6, student: 'Иван Новиков', direction: 'Сальса', teacher: 'Мигель Р.', date: '06.02.2026', time: '10:00', status: 'attended' },
  { id: 7, student: 'Анна Морозова', direction: 'Кизомба', teacher: 'Дмитрий П.', date: '06.02.2026', time: '15:00', status: 'attended' },
  { id: 8, student: 'Сергей Лебедев', direction: 'Бачата', teacher: 'Анна К.', date: '06.02.2026', time: '11:00', status: 'missed' },
  { id: 9, student: 'Наталья Соколова', direction: 'Танго', teacher: 'Елена С.', date: '05.02.2026', time: '18:00', status: 'attended' },
  { id: 10, student: 'Павел Кузнецов', direction: 'Бачата', teacher: 'Анна К.', date: '05.02.2026', time: '10:00', status: 'attended' },
  { id: 11, student: 'Елена Попова', direction: 'Сальса', teacher: 'Мигель Р.', date: '04.02.2026', time: '12:00', status: 'cancelled' },
  { id: 12, student: 'Максим Федоров', direction: 'Кизомба', teacher: 'Дмитрий П.', date: '04.02.2026', time: '14:00', status: 'attended' },
];

const statusLabels: Record<string, string> = {
  active: 'Активна',
  cancelled: 'Отменена',
  attended: 'Посещено',
  missed: 'Пропущено',
};

const dateFilters = ['Все', 'Сегодня', 'Вчера', 'Эта неделя'];

export function Bookings() {
  const [activeFilter, setActiveFilter] = useState('Все');

  const columns: Column<Booking>[] = [
    { key: 'student', header: 'Ученик', sortable: true },
    {
      key: 'direction',
      header: 'Направление',
      render: (row) => (
        <span className={styles.directionBadge}>{row.direction}</span>
      ),
    },
    { key: 'teacher', header: 'Преподаватель' },
    { key: 'date', header: 'Дата', sortable: true },
    { key: 'time', header: 'Время' },
    {
      key: 'status',
      header: 'Статус',
      render: (row) => (
        <span className={`${styles.badge} ${styles[`badge_${row.status}`] ?? ''}`}>
          {statusLabels[row.status] ?? row.status}
        </span>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Записи</h1>
      </div>

      <div className={styles.filters}>
        <Filter size={16} className={styles.filterIcon} />
        {dateFilters.map((f) => (
          <button
            key={f}
            type="button"
            className={`${styles.filterBtn} ${activeFilter === f ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={mockBookings}
        searchKey="student"
        searchPlaceholder="Поиск по ученику..."
        actions={(row) => (
          <>
            {row.status === 'active' && (
              <>
                <button className={styles.attendBtn} type="button" title="Отметить посещение">
                  <Check size={16} />
                </button>
                <button className={styles.missBtn} type="button" title="Отметить пропуск">
                  <XIcon size={16} />
                </button>
              </>
            )}
          </>
        )}
      />
    </div>
  );
}
