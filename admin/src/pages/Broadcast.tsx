import { useState } from 'react';
import {
  Send,
  Users,
  CreditCard,
  Compass,
  Clock,
  Eye,
  CalendarDays,
} from 'lucide-react';
import { FormField } from '../components/ui/FormField';
import styles from './Broadcast.module.css';

type Audience = 'all' | 'active_subs' | 'by_direction';

const directionOptions = [
  { value: 'bachata', label: 'Бачата' },
  { value: 'salsa', label: 'Сальса' },
  { value: 'kizomba', label: 'Кизомба' },
  { value: 'tango', label: 'Танго' },
];

const audienceInfo: Record<Audience, { label: string; count: number; icon: React.ReactNode }> = {
  all: { label: 'Все пользователи', count: 342, icon: <Users size={20} /> },
  active_subs: { label: 'С активным абонементом', count: 184, icon: <CreditCard size={20} /> },
  by_direction: { label: 'По направлению', count: 0, icon: <Compass size={20} /> },
};

const recentBroadcasts = [
  { id: 1, message: 'Напоминаем: завтра в 18:00 открытый урок по бачате!', audience: 'Бачата', sent: '06.02.2026, 10:00', delivered: 78, read: 52 },
  { id: 2, message: 'Новый курс "Сальса-интенсив" стартует 15 февраля. Количество мест ограничено!', audience: 'Все', sent: '04.02.2026, 14:30', delivered: 342, read: 198 },
  { id: 3, message: 'Праздничная скидка 30% по промокоду NY2026 действует до 15 января!', audience: 'Все', sent: '25.12.2025, 09:00', delivered: 310, read: 221 },
];

export function Broadcast() {
  const [audience, setAudience] = useState<Audience>('all');
  const [message, setMessage] = useState('');
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Рассылки</h1>
      </div>

      <div className={styles.mainGrid}>
        {/* Compose panel */}
        <div className={styles.composeCard}>
          <h2 className={styles.cardTitle}>Новая рассылка</h2>

          {/* Audience selector */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Аудитория</span>
            <div className={styles.audienceGrid}>
              {(Object.keys(audienceInfo) as Audience[]).map((key) => {
                const info = audienceInfo[key];
                return (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.audienceCard} ${audience === key ? styles.audienceCardActive : ''}`}
                    onClick={() => setAudience(key)}
                  >
                    <div className={styles.audienceIcon}>{info.icon}</div>
                    <div className={styles.audienceLabel}>{info.label}</div>
                    {key !== 'by_direction' && (
                      <div className={styles.audienceCount}>{info.count} чел.</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {audience === 'by_direction' && (
            <FormField
              label="Направление"
              type="select"
              options={directionOptions}
              required
            />
          )}

          {/* Message */}
          <div className={styles.section}>
            <FormField
              label="Сообщение"
              type="textarea"
              value={message}
              onChange={setMessage}
              placeholder="Введите текст рассылки..."
              required
            />
            <span className={styles.charCount}>{message.length}/4096</span>
          </div>

          {/* Schedule */}
          <div className={styles.section}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={scheduleEnabled}
                onChange={(e) => setScheduleEnabled(e.target.checked)}
                className={styles.checkbox}
              />
              <Clock size={16} />
              Запланировать отправку
            </label>
            {scheduleEnabled && (
              <div className={styles.scheduleRow}>
                <FormField label="Дата" type="date" />
                <FormField label="Время" type="time" />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={styles.composeActions}>
            <button
              className={styles.previewBtn}
              type="button"
              onClick={() => setShowPreview(true)}
            >
              <Eye size={16} />
              Предпросмотр
            </button>
            <button className={styles.sendBtn} type="button">
              <Send size={16} />
              {scheduleEnabled ? 'Запланировать' : 'Отправить'}
            </button>
          </div>
        </div>

        {/* History */}
        <div className={styles.historyCard}>
          <h2 className={styles.cardTitle}>Последние рассылки</h2>
          <div className={styles.historyList}>
            {recentBroadcasts.map((b) => (
              <div key={b.id} className={styles.historyItem}>
                <div className={styles.historyMessage}>{b.message}</div>
                <div className={styles.historyMeta}>
                  <span className={styles.historyAudience}>{b.audience}</span>
                  <span className={styles.historyDate}>
                    <CalendarDays size={12} />
                    {b.sent}
                  </span>
                </div>
                <div className={styles.historyStats}>
                  <span>Доставлено: {b.delivered}</span>
                  <span>Прочитано: {b.read}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview modal */}
      {showPreview && (
        <div className={styles.modalBackdrop} onClick={() => setShowPreview(false)}>
          <div className={styles.previewModal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.previewTitle}>Предпросмотр сообщения</h3>
            <div className={styles.phoneMockup}>
              <div className={styles.phoneHeader}>
                <span>DanceMax Bot</span>
              </div>
              <div className={styles.phoneBody}>
                <div className={styles.messageBubble}>
                  {message || 'Текст сообщения не введён'}
                </div>
              </div>
            </div>
            <button
              className={styles.closePreview}
              onClick={() => setShowPreview(false)}
              type="button"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
