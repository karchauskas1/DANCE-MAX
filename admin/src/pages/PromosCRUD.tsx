import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Copy, Tag } from 'lucide-react';
import { FormField } from '../components/ui/FormField';
import styles from './PromosCRUD.module.css';

interface Promo {
  id: number;
  title: string;
  description: string;
  code: string;
  discount: number;
  discountType: 'percent' | 'fixed';
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

const mockPromos: Promo[] = [
  { id: 1, title: 'Новичок', description: 'Скидка 20% на первый абонемент для новых учеников', code: 'NEW20', discount: 20, discountType: 'percent', usageLimit: 100, usedCount: 47, validFrom: '01.01.2026', validTo: '31.03.2026', isActive: true },
  { id: 2, title: 'Приведи друга', description: 'Бонусное занятие за приглашённого друга', code: 'FRIEND', discount: 1, discountType: 'fixed', usageLimit: 50, usedCount: 23, validFrom: '01.02.2026', validTo: '28.02.2026', isActive: true },
  { id: 3, title: 'Новый Год', description: 'Скидка 30% на годовой абонемент', code: 'NY2026', discount: 30, discountType: 'percent', usageLimit: 30, usedCount: 30, validFrom: '25.12.2025', validTo: '15.01.2026', isActive: false },
];

const discountTypeOptions = [
  { value: 'percent', label: 'Процент (%)' },
  { value: 'fixed', label: 'Фиксированная сумма (руб.)' },
];

export function PromosCRUD() {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Promo | null>(null);

  function openCreate() {
    setEditItem(null);
    setShowModal(true);
  }

  function openEdit(promo: Promo) {
    setEditItem(promo);
    setShowModal(true);
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Акции</h1>
          <p className={styles.subtitle}>{mockPromos.length} акций</p>
        </div>
        <button className={styles.createBtn} onClick={openCreate} type="button">
          <Plus size={18} />
          Создать акцию
        </button>
      </div>

      <div className={styles.list}>
        {mockPromos.map((promo) => (
          <div key={promo.id} className={styles.card}>
            <div className={styles.cardLeft}>
              <div className={styles.cardIcon}>
                <Tag size={20} />
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
                <div className={styles.codeWrap}>
                  <code className={styles.promoCode}>{promo.code}</code>
                  <button className={styles.copyBtn} type="button" title="Скопировать">
                    <Copy size={13} />
                  </button>
                </div>
                <span className={styles.metaItem}>
                  {promo.discount}{promo.discountType === 'percent' ? '%' : ' руб.'}
                </span>
                <span className={styles.metaItem}>
                  {promo.validFrom} — {promo.validTo}
                </span>
                <span className={styles.metaItem}>
                  {promo.usedCount}/{promo.usageLimit} использований
                </span>
              </div>
              <div className={styles.usageBar}>
                <div
                  className={styles.usageFill}
                  style={{ width: `${(promo.usedCount / promo.usageLimit) * 100}%` }}
                />
              </div>
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
        ))}
      </div>

      {/* Modal */}
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
                value={editItem?.code ?? ''}
                placeholder="NEW20"
                required
              />
              <div className={styles.formRow}>
                <FormField
                  label="Тип скидки"
                  type="select"
                  options={discountTypeOptions}
                  required
                />
                <FormField
                  label="Размер скидки"
                  type="number"
                  value={editItem?.discount ?? ''}
                  placeholder="20"
                  required
                />
              </div>
              <div className={styles.formRow}>
                <FormField label="Действует с" type="date" required />
                <FormField label="Действует до" type="date" required />
              </div>
              <FormField
                label="Лимит использований"
                type="number"
                value={editItem?.usageLimit ?? ''}
                placeholder="100"
                required
              />
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
