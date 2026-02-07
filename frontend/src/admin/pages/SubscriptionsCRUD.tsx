import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Zap, Crown, Sparkles, Inbox, Loader2 } from 'lucide-react';
import { usePaymentPlans, useCreateSubscription, useUpdateSubscription, useDeleteSubscription } from '../../api/queries';
import type { SubscriptionPlanWithPrice } from '../../api/mappers';
import { FormField } from '../components/FormField';
import styles from './SubscriptionsCRUD.module.css';

function getPlanIcon(name: string) {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('безлимит') || nameLower.includes('unlimit')) return <Crown size={22} />;
  if (nameLower.includes('стандарт') || nameLower.includes('standard')) return <Sparkles size={22} />;
  return <Zap size={22} />;
}

export function SubscriptionsCRUD() {
  const { data: plansData, isLoading } = usePaymentPlans();
  const plans = plansData ?? [];

  const createMutation = useCreateSubscription();
  const updateMutation = useUpdateSubscription();
  const deleteMutation = useDeleteSubscription();

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<SubscriptionPlanWithPrice | null>(null);

  // Поля формы
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [lessonsCount, setLessonsCount] = useState('');
  const [validityDays, setValidityDays] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setDescription(editItem.description ?? '');
      setLessonsCount(String(editItem.lessonsCount));
      setValidityDays(String(editItem.validityDays));
      setPrice(String(editItem.price));
    }
  }, [editItem]);

  function resetForm() {
    setName('');
    setDescription('');
    setLessonsCount('');
    setValidityDays('');
    setPrice('');
  }

  function openCreate() {
    setEditItem(null);
    resetForm();
    setShowModal(true);
  }

  function openEdit(sub: SubscriptionPlanWithPrice) {
    setEditItem(sub);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditItem(null);
    resetForm();
  }

  async function handleSubmit() {
    const payload = {
      name,
      description: description || undefined,
      lessons_count: Number(lessonsCount) || 0,
      validity_days: Number(validityDays) || 0,
      price: Number(price) || 0,
    };

    if (editItem) {
      await updateMutation.mutateAsync({ id: editItem.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    closeModal();
  }

  async function handleDelete(sub: SubscriptionPlanWithPrice) {
    if (!window.confirm(`Удалить абонемент "${sub.name}"?`)) return;
    await deleteMutation.mutateAsync({ id: sub.id });
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Абонементы</h1>
          <p className={styles.subtitle}>{plans.length} тарифа</p>
        </div>
        <button className={styles.createBtn} onClick={openCreate} type="button">
          <Plus size={16} />
          Создать
        </button>
      </div>

      {isLoading ? (
        <div className={styles.loadingText}>Загрузка...</div>
      ) : plans.length === 0 ? (
        <div className={styles.emptyState}>
          <Inbox size={32} className={styles.emptyIcon} />
          <span className={styles.emptyText}>Нет данных</span>
        </div>
      ) : (
        <div className={styles.grid}>
          {plans.map((sub) => (
            <div
              key={sub.id}
              className={`${styles.card} ${sub.isPopular ? styles.cardPopular : ''}`}
            >
              {sub.isPopular && (
                <div className={styles.popularLabel}>Популярный</div>
              )}
              <div className={styles.cardTop}>
                <div className={styles.cardIcon}>
                  {getPlanIcon(sub.name)}
                </div>
                <div className={styles.cardActions}>
                  <button
                    className={styles.cardActionBtn}
                    onClick={() => openEdit(sub)}
                    type="button"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className={styles.cardActionBtnDanger}
                    onClick={() => handleDelete(sub)}
                    disabled={deleteMutation.isPending}
                    type="button"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.cardName}>{sub.name}</h3>
                <div className={styles.priceRow}>
                  <span className={styles.price}>{sub.price.toLocaleString('ru-RU')}</span>
                  <span className={styles.priceCurrency}> &#8381;</span>
                </div>
                <p className={styles.cardDesc}>{sub.description ?? ''}</p>
                <ul className={styles.features}>
                  <li className={styles.feature}>
                    {sub.lessonsCount >= 999 ? 'Безлимит занятий' : `${sub.lessonsCount} занятий`}
                  </li>
                  <li className={styles.feature}>
                    Срок действия: {sub.validityDays} дней
                  </li>
                  {sub.pricePerLesson > 0 && (
                    <li className={styles.feature}>
                      {sub.pricePerLesson.toLocaleString('ru-RU')} &#8381; за занятие
                    </li>
                  )}
                </ul>
              </div>

              <div className={styles.cardFooter}>
                <span className={`${styles.statusBadge} ${sub.isActive ? styles.statusActive : styles.statusInactive}`}>
                  {sub.isActive ? 'Активен' : 'Скрыт'}
                </span>
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
                {editItem ? 'Редактировать абонемент' : 'Новый абонемент'}
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
                value={name}
                onChange={setName}
                placeholder="Стандарт"
                required
              />
              <FormField
                label="Описание"
                type="textarea"
                value={description}
                onChange={setDescription}
                placeholder="Описание абонемента..."
              />
              <div className={styles.formRow}>
                <FormField
                  label="Кол-во занятий"
                  type="number"
                  value={lessonsCount}
                  onChange={setLessonsCount}
                  placeholder="8"
                  required
                />
                <FormField
                  label="Срок (дней)"
                  type="number"
                  value={validityDays}
                  onChange={setValidityDays}
                  placeholder="30"
                  required
                />
              </div>
              <FormField
                label="Цена (руб.)"
                type="number"
                value={price}
                onChange={setPrice}
                placeholder="5600"
                required
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
