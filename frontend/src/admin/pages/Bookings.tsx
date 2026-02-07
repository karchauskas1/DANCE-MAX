import { useState } from 'react';
import { Check, X as XIcon, Filter, Inbox } from 'lucide-react';
import { useMyBookings, useMarkAttendance } from '../../api/queries';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';
import styles from './Bookings.module.css';

// Плоская структура для DataTable
interface BookingRow {
  id: number;
  student: string;
  direction: string;
  teacher: string;
  date: string;
  time: string;
  status: string;
  [key: string]: unknown;
}

const statusLabels: Record<string, string> = {
  active: 'Активна',
  cancelled: 'Отменена',
  attended: 'Посещено',
  missed: 'Пропущено',
};

const dateFilters = ['Все', 'Сегодня', 'Вчера', 'Эта неделя'];

export function Bookings() {
  const [activeFilter, setActiveFilter] = useState('Все');
  const { data: bookingsData, isLoading } = useMyBookings();
  const attendanceMutation = useMarkAttendance();

  // Маппим данные из API в плоскую структуру для DataTable
  const bookings: BookingRow[] = (bookingsData ?? []).map((b) => ({
    id: b.id,
    student: '—', // admin endpoint нужен для имени ученика
    direction: b.lesson?.direction?.name ?? '—',
    teacher: b.lesson?.teacher?.name ?? '—',
    date: b.lesson?.date ?? '—',
    time: b.lesson?.startTime ?? '—',
    status: b.status,
  }));

  async function handleMarkAttendance(bookingId: number) {
    await attendanceMutation.mutateAsync({ bookingId });
  }

  const columns: Column<BookingRow>[] = [
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
        <Filter size={14} className={styles.filterIcon} />
        <div className={styles.filtersScroll}>
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
      </div>

      {isLoading ? (
        <div className={styles.loadingText}>Загрузка...</div>
      ) : bookings.length === 0 ? (
        <div className={styles.emptyState}>
          <Inbox size={32} className={styles.emptyIcon} />
          <span className={styles.emptyText}>Нет данных</span>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <DataTable
            columns={columns}
            data={bookings}
            searchKey="student"
            searchPlaceholder="Поиск по ученику..."
            actions={(row) => (
              <>
                {row.status === 'active' && (
                  <>
                    <button
                      className={styles.attendBtn}
                      type="button"
                      title="Отметить посещение"
                      onClick={() => handleMarkAttendance(row.id)}
                      disabled={attendanceMutation.isPending}
                    >
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
      )}
    </div>
  );
}
