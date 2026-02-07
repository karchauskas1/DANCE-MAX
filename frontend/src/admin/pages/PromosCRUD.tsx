import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Copy, Tag, Inbox, Loader2 } from 'lucide-react';
import { usePromotions, useCreatePromo, useUpdatePromo, useDeletePromo } from '../../api/queries';
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

  const createMutation = useCreatePromo();
  const updateMutation = useUpdatePromo();
  const deleteMutation = useDeletePromo();

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Promotion | null>(null);

  // Поля формы
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');

  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title);
      setDescription(editItem.description);
      setPromoCode(editItem.promoCode ?? '');
      if (editItem.discountPercent) {
        setDiscountType('percent');
        setDiscountValue(String(editItem.discountPercent));
      } else if (editItem.discountAmount) {
        setDiscountType('fixed');
        setDiscountValue(String(editItem.discountAmount));
      } else {
        setDiscountType('percent');
        setDiscountValue('');
      }
      setValidFrom(editItem.validFrom);
      setValidUntil(editItem.validUntil);
    }
  }, [editItem]);

  function resetForm() {
    setTitle('');
    setDescription('');
    setPromoCode('');
    setDiscountType('percent');
    setDiscountValue('');
    setValidFrom('');
    setValidUntil('');
  }

  function openCreate() {
    setEditItem(null);
    resetForm();
    setShowModal(true);
  }

  function openEdit(promo: Promotion) {
    setEditItem(promo);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditItem(null);
    resetForm();
  }

  async function handleSubmit() {
    const discountNum = Number(discountValue) || 0;
    const payload = {
      title,
      description,
      promo_code: promoCode,
      discount_percent: discountType === 'percent' ? discountNum : undefined,
      discount_amount: discountType === 'fixed' ? discountNum : undefined,
      valid_from: validFrom,
      valid_until: validUntil,
    };

    if (editItem) {
      await updateMutation.mutateAsync({ id: editItem.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    closeModal();
  }

  async function handleDelete(promo: Promotion) {
    if (!window.confirm(`Удалить акцию "${promo.title}"?`)) return;
    await deleteMutation.mutateAsync({ id: promo.id });
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

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
                  <button
                    className={styles.cardActionBtnDanger}
                    onClick={() => handleDelete(promo)}
                    disabled={deleteMutation.isPending}
                    type="button"
                  >
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
                      <button
                        className={styles.copyBtn}
                        type="button"
                        title="Скопировать"
                        onClick={() => navigator.clipboard.writeText(promo.promoCode ?? '')}
                      >
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
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editItem ? 'Редактировать акцию' : 'Новая акция'}
              </h2>
              <button
                className={styles.modalClose}
                onClick={closeModal}
                type="button"
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <FormField
                label="Название"
                type="text"
                value={title}
                onChange={setTitle}
                placeholder="Новичок"
                required
              />
              <FormField
                label="Описание"
                type="textarea"
                value={description}
                onChange={setDescription}
                placeholder="Описание акции..."
                required
              />
              <FormField
                label="Промокод"
                type="text"
                value={promoCode}
                onChange={setPromoCode}
                placeholder="NEW20"
                required
              />
              <FormField
                label="Тип скидки"
                type="select"
                value={discountType}
                onChange={(v) => setDiscountType(v as 'percent' | 'fixed')}
                options={discountTypeOptions}
                required
              />
              <FormField
                label="Размер скидки"
                type="number"
                value={discountValue}
                onChange={setDiscountValue}
                placeholder="20"
                required
              />
              <div className={styles.formRow}>
                <FormField
                  label="Действует с"
                  type="date"
                  value={validFrom}
                  onChange={setValidFrom}
                  required
                />
                <FormField
                  label="Действует до"
                  type="date"
                  value={validUntil}
                  onChange={setValidUntil}
                  required
                />
              </div>
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
                onClick={handleSubmit}
                disabled={isSaving}
                type="button"
              >
                {isSaving && <Loader2 size={16} className={styles.spinner} />}
                {editItem ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
