import { useState } from 'react';
import {
  Send,
  Users,
  CreditCard,
  Compass,
  Clock,
  Eye,
  Inbox,
  Loader2,
} from 'lucide-react';
import { useDirections, useSendBroadcast } from '../../api/queries';
import { FormField } from '../components/FormField';
import styles from './Broadcast.module.css';

type Audience = 'all' | 'active_subs' | 'by_direction';

const audienceInfo: Record<Audience, { label: string; count: number; icon: React.ReactNode }> = {
  all: { label: 'Все пользователи', count: 0, icon: <Users size={20} /> },
  active_subs: { label: 'С абонементом', count: 0, icon: <CreditCard size={20} /> },
  by_direction: { label: 'По направлению', count: 0, icon: <Compass size={20} /> },
};

export function Broadcast() {
  const [audience, setAudience] = useState<Audience>('all');
  const [message, setMessage] = useState('');
  const [directionId, setDirectionId] = useState('');
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const { data: directionsData } = useDirections();
  const broadcastMutation = useSendBroadcast();

  // Формируем опции направлений из реальных данных
  const directionOptions = (directionsData ?? []).map((d) => ({
    value: String(d.id),
    label: d.name,
  }));

  async function handleSend() {
    if (!message.trim()) return;

    const payload = {
      audience,
      direction_id: audience === 'by_direction' ? Number(directionId) : undefined,
      message,
      schedule_at: scheduleEnabled && scheduleDate && scheduleTime
        ? `${scheduleDate}T${scheduleTime}`
        : undefined,
    };

    await broadcastMutation.mutateAsync(payload);
    // Очищаем форму после успешной отправки
    setMessage('');
    setDirectionId('');
    setScheduleEnabled(false);
    setScheduleDate('');
    setScheduleTime('');
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Рассылки</h1>
      </div>

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
            value={directionId}
            onChange={setDirectionId}
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
              <FormField
                label="Дата"
                type="date"
                value={scheduleDate}
                onChange={setScheduleDate}
              />
              <FormField
                label="Время"
                type="time"
                value={scheduleTime}
                onChange={setScheduleTime}
              />
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
          <button
            className={styles.sendBtn}
            type="button"
            onClick={handleSend}
            disabled={broadcastMutation.isPending || !message.trim()}
          >
            {broadcastMutation.isPending
              ? <Loader2 size={16} className={styles.spinner} />
              : <Send size={16} />
            }
            {scheduleEnabled ? 'Запланировать' : 'Отправить'}
          </button>
        </div>

        {broadcastMutation.isSuccess && (
          <div className={styles.successMessage}>
            Рассылка успешно {scheduleEnabled ? 'запланирована' : 'отправлена'}
          </div>
        )}
      </div>

      {/* History */}
      <div className={styles.historyCard}>
        <h2 className={styles.cardTitle}>Последние рассылки</h2>
        <div className={styles.emptyState}>
          <Inbox size={28} className={styles.emptyIcon} />
          <span className={styles.emptyText}>Нет данных</span>
        </div>
      </div>

      {/* Preview modal -- bottom-sheet on mobile */}
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
