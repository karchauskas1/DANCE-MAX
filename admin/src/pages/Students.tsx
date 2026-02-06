import { useState } from 'react';
import { Eye, PencilLine, X } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { FormField } from '../components/ui/FormField';
import styles from './Students.module.css';

interface Student {
  id: number;
  name: string;
  username: string;
  phone: string;
  balance: number;
  totalLessons: number;
  lastVisit: string;
  [key: string]: unknown;
}

const mockStudents: Student[] = [
  { id: 1, name: 'Мария Иванова', username: '@mariya_i', phone: '+7 (999) 123-45-67', balance: 8, totalLessons: 42, lastVisit: '07.02.2026' },
  { id: 2, name: 'Алексей Петров', username: '@alex_p', phone: '+7 (999) 234-56-78', balance: 3, totalLessons: 28, lastVisit: '06.02.2026' },
  { id: 3, name: 'Ольга Смирнова', username: '@olga_sm', phone: '+7 (999) 345-67-89', balance: 0, totalLessons: 15, lastVisit: '01.02.2026' },
  { id: 4, name: 'Дмитрий Козлов', username: '@dmitry_k', phone: '+7 (999) 456-78-90', balance: 12, totalLessons: 67, lastVisit: '07.02.2026' },
  { id: 5, name: 'Екатерина Волкова', username: '@kate_v', phone: '+7 (999) 567-89-01', balance: 5, totalLessons: 34, lastVisit: '05.02.2026' },
  { id: 6, name: 'Иван Новиков', username: '@ivan_n', phone: '+7 (999) 678-90-12', balance: 1, totalLessons: 8, lastVisit: '04.02.2026' },
  { id: 7, name: 'Анна Морозова', username: '@anna_m', phone: '+7 (999) 789-01-23', balance: 7, totalLessons: 53, lastVisit: '07.02.2026' },
  { id: 8, name: 'Сергей Лебедев', username: '@sergey_l', phone: '+7 (999) 890-12-34', balance: 0, totalLessons: 20, lastVisit: '30.01.2026' },
  { id: 9, name: 'Наталья Соколова', username: '@nataly_s', phone: '+7 (999) 901-23-45', balance: 4, totalLessons: 11, lastVisit: '03.02.2026' },
  { id: 10, name: 'Павел Кузнецов', username: '@pavel_k', phone: '+7 (999) 012-34-56', balance: 10, totalLessons: 91, lastVisit: '07.02.2026' },
  { id: 11, name: 'Елена Попова', username: '@elena_p', phone: '+7 (999) 111-22-33', balance: 2, totalLessons: 6, lastVisit: '02.02.2026' },
  { id: 12, name: 'Максим Федоров', username: '@max_f', phone: '+7 (999) 222-33-44', balance: 6, totalLessons: 38, lastVisit: '06.02.2026' },
];

export function Students() {
  const [balanceModal, setBalanceModal] = useState<Student | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');

  const columns: Column<Student>[] = [
    {
      key: 'name',
      header: 'Ученик',
      sortable: true,
      render: (row) => (
        <div className={styles.studentCell}>
          <div className={styles.studentAvatar}>
            {row.name.charAt(0)}
          </div>
          <div>
            <div className={styles.studentName}>{row.name}</div>
            <div className={styles.studentUsername}>{row.username}</div>
          </div>
        </div>
      ),
    },
    { key: 'phone', header: 'Телефон' },
    {
      key: 'balance',
      header: 'Баланс',
      sortable: true,
      render: (row) => (
        <span className={row.balance === 0 ? styles.balanceZero : styles.balanceNormal}>
          {row.balance} зан.
        </span>
      ),
    },
    { key: 'totalLessons', header: 'Всего занятий', sortable: true },
    { key: 'lastVisit', header: 'Последний визит', sortable: true },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Ученики</h1>
        <span className={styles.count}>{mockStudents.length} учеников</span>
      </div>

      <DataTable
        columns={columns}
        data={mockStudents}
        searchKey="name"
        searchPlaceholder="Поиск по имени..."
        actions={(row) => (
          <>
            <button className={styles.actionBtn} type="button" title="Просмотр">
              <Eye size={16} />
            </button>
            <button
              className={styles.actionBtn}
              type="button"
              title="Корректировка баланса"
              onClick={() => {
                setBalanceModal(row);
                setAdjustAmount('');
              }}
            >
              <PencilLine size={16} />
            </button>
          </>
        )}
      />

      {/* Balance adjustment modal */}
      {balanceModal && (
        <div className={styles.modalBackdrop} onClick={() => setBalanceModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Корректировка баланса</h2>
              <button
                className={styles.modalClose}
                onClick={() => setBalanceModal(null)}
                type="button"
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.currentBalance}>
                <span className={styles.balanceLabel}>Текущий баланс:</span>
                <span className={styles.balanceValue}>{balanceModal.balance} занятий</span>
              </div>
              <FormField
                label="Корректировка"
                type="number"
                value={adjustAmount}
                onChange={setAdjustAmount}
                placeholder="Например: +5 или -2"
                required
              />
              <FormField
                label="Причина"
                type="textarea"
                placeholder="Укажите причину корректировки..."
              />
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.cancelBtn}
                onClick={() => setBalanceModal(null)}
                type="button"
              >
                Отмена
              </button>
              <button className={styles.submitBtn} type="button">
                Применить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
