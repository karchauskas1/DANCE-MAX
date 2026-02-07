import { useState } from 'react';
import { Eye, PencilLine, X, Inbox, Loader2 } from 'lucide-react';
import { useAdminStudents, useAdjustBalance } from '../../api/queries';
import type { AdminStudent } from '../../api/queries';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { FormField } from '../components/FormField';
import styles from './Students.module.css';

export function Students() {
  const { data: studentsData, isLoading } = useAdminStudents();
  const students: AdminStudent[] = studentsData ?? [];

  const adjustMutation = useAdjustBalance();

  const [balanceModal, setBalanceModal] = useState<AdminStudent | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  function closeModal() {
    setBalanceModal(null);
    setAdjustAmount('');
    setAdjustReason('');
  }

  async function handleAdjustBalance() {
    if (!balanceModal) return;
    await adjustMutation.mutateAsync({
      studentId: balanceModal.id,
      amount: Number(adjustAmount) || 0,
      reason: adjustReason,
    });
    closeModal();
  }

  const columns: Column<AdminStudent>[] = [
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
        <span className={styles.count}>{students.length} учеников</span>
      </div>

      {isLoading ? (
        <div className={styles.loadingText}>Загрузка...</div>
      ) : students.length === 0 ? (
        <div className={styles.emptyState}>
          <Inbox size={32} className={styles.emptyIcon} />
          <span className={styles.emptyText}>Нет данных</span>
          <span className={styles.emptyHint}>Список учеников появится после подключения admin API</span>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <DataTable
            columns={columns}
            data={students}
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
                    setAdjustReason('');
                  }}
                >
                  <PencilLine size={16} />
                </button>
              </>
            )}
          />
        </div>
      )}

      {/* Balance adjustment modal -- bottom-sheet on mobile */}
      {balanceModal && (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Корректировка баланса</h2>
              <button
                className={styles.modalClose}
                onClick={closeModal}
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
                value={adjustReason}
                onChange={setAdjustReason}
                placeholder="Укажите причину корректировки..."
              />
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.cancelBtn}
                onClick={closeModal}
                type="button"
              >
                Отмена
              </button>
              <button
                className={styles.submitBtn}
                onClick={handleAdjustBalance}
                disabled={adjustMutation.isPending}
                type="button"
              >
                {adjustMutation.isPending && <Loader2 size={16} className={styles.spinner} />}
                Применить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
