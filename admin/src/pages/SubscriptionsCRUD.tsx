import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Zap, Crown, Sparkles } from 'lucide-react';
import { FormField } from '../components/ui/FormField';
import styles from './SubscriptionsCRUD.module.css';

interface Subscription {
  id: number;
  name: string;
  lessons: number;
  price: number;
  validDays: number;
  description: string;
  isPopular: boolean;
  isActive: boolean;
  activeSubs: number;
}

const mockSubscriptions: Subscription[] = [
  { id: 1, name: 'Старт', lessons: 4, price: 3200, validDays: 30, description: '4 занятия в месяц. Для тех, кто только начинает.', isPopular: false, isActive: true, activeSubs: 28 },
  { id: 2, name: 'Стандарт', lessons: 8, price: 5600, validDays: 30, description: '8 занятий в месяц. Оптимальный вариант для регулярных тренировок.', isPopular: true, isActive: true, activeSubs: 89 },
  { id: 3, name: 'Безлимит', lessons: 999, price: 8900, validDays: 30, description: 'Безлимитное посещение. Танцуй каждый день!', isPopular: false, isActive: true, activeSubs: 42 },
  { id: 4, name: 'Пробный', lessons: 1, price: 500, validDays: 7, description: 'Одно пробное занятие. Познакомься со студией!', isPopular: false, isActive: true, activeSubs: 15 },
];

function getPlanIcon(name: string) {
  if (name === 'Безлимит') return <Crown size={22} />;
  if (name === 'Стандарт') return <Sparkles size={22} />;
  return <Zap size={22} />;
}

export function SubscriptionsCRUD() {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Subscription | null>(null);

  function openCreate() {
    setEditItem(null);
    setShowModal(true);
  }

  function openEdit(sub: Subscription) {
    setEditItem(sub);
    setShowModal(true);
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Абонементы</h1>
          <p className={styles.subtitle}>{mockSubscriptions.length} тарифа</p>
        </div>
        <button className={styles.createBtn} onClick={openCreate} type="button">
          <Plus size={18} />
          Создать абонемент
        </button>
      </div>

      <div className={styles.grid}>
        {mockSubscriptions.map((sub) => (
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
                <button className={styles.cardActionBtnDanger} type="button">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <div className={styles.cardBody}>
              <h3 className={styles.cardName}>{sub.name}</h3>
              <div className={styles.priceRow}>
                <span className={styles.price}>{sub.price.toLocaleString('ru-RU')}</span>
                <span className={styles.priceCurrency}> ₽</span>
              </div>
              <p className={styles.cardDesc}>{sub.description}</p>
              <ul className={styles.features}>
                <li className={styles.feature}>
                  {sub.lessons >= 999 ? 'Безлимит занятий' : `${sub.lessons} занятий`}
                </li>
                <li className={styles.feature}>
                  Срок действия: {sub.validDays} дней
                </li>
                <li className={styles.feature}>
                  {sub.activeSubs} активных подписок
                </li>
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

      {/* Modal */}
      {showModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editItem ? 'Редактировать абонемент' : 'Новый абонемент'}
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
                value={editItem?.name ?? ''}
                placeholder="Стандарт"
                required
              />
              <FormField
                label="Описание"
                type="textarea"
                value={editItem?.description ?? ''}
                placeholder="Описание абонемента..."
              />
              <div className={styles.formRow}>
                <FormField
                  label="Кол-во занятий"
                  type="number"
                  value={editItem?.lessons ?? ''}
                  placeholder="8"
                  required
                />
                <FormField
                  label="Срок (дней)"
                  type="number"
                  value={editItem?.validDays ?? ''}
                  placeholder="30"
                  required
                />
              </div>
              <FormField
                label="Цена (руб.)"
                type="number"
                value={editItem?.price ?? ''}
                placeholder="5600"
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
