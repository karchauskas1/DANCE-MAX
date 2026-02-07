import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Copy, Tag, Inbox } from 'lucide-react';
import { usePromotions } from '../../api/queries';
import { FormField } from '../components/FormField';
import styles from './PromosCRUD.module.css';
import type { Promotion } from '../../types';

const discountTypeOptions = [
  { value: 'percent', label: 'Процент (%)' },
  { value: 'fixed', label: 'Фиксированная сумма (руб.)' },
];

export function PromosCRUD() {
  const { data: promosData, isLoading } = usePromotions();
  const promos = promosData ?? [];

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Promotion | null>(null);

  function openCreate() {
    setEditItem(null);
    setShowModal(true);
  }

  function openEdit(promo: Promotion) {
    setEditItem(promo);
    setShowModal(true);
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Акции</h1>
          <p className={styles.subtitle}>{promos.length} акций</p>
        </div>
        <button className={styles.createBtn} onClick={openCreate} type="button">
          <Plus size={16} />
          Создать
        </button>
      </div>

      {isLoading ? (
        <div className={styles.loadingText}>Загрузка...</div>
      ) : promos.length === 0 ? (
        <div className={styles.emptyState}>
          <Inbox size={32} className={styles.emptyIcon} />
          <span className={styles.emptyText}>Нет данных</span>
        </div>
      ) : (
        <div className={styles.list}>
          {promos.map((promo) => (
            <div key={promo.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.cardIcon}>
                  <Tag size={18} />
                </div>
                <div className={styles.cardActions}>
                  <button
                    className={styles.cardActionBtn}
                    onClick={() => openEdit(promo)}
                    type="button"
                  >
                    <Pencil size={15} />
                  </button>
                  <button className={styles.cardActionBtnDanger} type="button">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardTitleRow}>
                  <h3 className={styles.cardName}>{promo.title}</h3>
                  <span className={`${styles.statusBadge} ${promo.isActive ? styles.statusActive : styles.statusInactive}`}>
                    {promo.isActive ? 'Активна' : 'Завершена'}
                  </span>
                </div>
                <p className={styles.cardDesc}>{promo.description}</p>
                <div className={styles.cardMeta}>
                  {promo.promoCode && (
                    <div className={styles.codeWrap}>
                      <code className={styles.promoCode}>{promo.promoCode}</code>
                      <button className={styles.copyBtn} type="button" title="Скопировать">
                        <Copy size={13} />
                      </button>
                    </div>
                  )}
                  <span className={styles.metaItem}>
                    {promo.discountPercent
                      ? `${promo.discountPercent}%`
                      : promo.discountAmount
                        ? `${promo.discountAmount} руб.`
                        : '—'}
                  </span>
                  <span className={styles.metaItem}>
                    {promo.validFrom} -- {promo.validUntil}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal -- bottom-sheet style on mobile */}
      {showModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editItem ? 'Редактировать акцию' : 'Новая акция'}
              </h2>
              <button
                className={styles.modalClose}
                onClick={() => setShowModal(false)}
                type="button"
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <FormField
                label="Название"
                type="text"
                value={editItem?.title ?? ''}
                placeholder="Новичок"
                required
              />
              <FormField
                label="Описание"
                type="textarea"
                value={editItem?.description ?? ''}
                placeholder="Описание акции..."
                required
              />
              <FormField
                label="Промокод"
                type="text"
                value={editItem?.promoCode ?? ''}
                placeholder="NEW20"
                required
              />
              <FormField
                label="Тип скидки"
                type="select"
                options={discountTypeOptions}
                required
              />
              <FormField
                label="Размер скидки"
                type="number"
                value={editItem?.discountPercent ?? editItem?.discountAmount ?? ''}
                placeholder="20"
                required
              />
              <div className={styles.formRow}>
                <FormField label="Действует с" type="date" required />
                <FormField label="Действует до" type="date" required />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowModal(false)}
                type="button"
              >
                Отмена
              </button>
              <button className={styles.submitBtn} type="button">
                {editItem ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
