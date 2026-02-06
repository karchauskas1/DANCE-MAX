import { useMemo, useRef, useEffect } from 'react';
import { addDays, format, isToday, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from './DayPicker.module.css';

interface DayPickerProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  daysCount?: number;
}

const SHORT_DAY_NAMES: Record<string, string> = {
  понедельник: 'Пн',
  вторник: 'Вт',
  среда: 'Ср',
  четверг: 'Чт',
  пятница: 'Пт',
  суббота: 'Сб',
  воскресенье: 'Вс',
};

function getShortDay(date: Date): string {
  const full = format(date, 'EEEE', { locale: ru }).toLowerCase();
  return SHORT_DAY_NAMES[full] ?? full.slice(0, 2);
}

export default function DayPicker({
  selectedDate,
  onSelectDate,
  daysCount = 14,
}: DayPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: daysCount }, (_, i) => addDays(today, i));
  }, [daysCount]);

  // Scroll selected item into view on mount and when selection changes
  useEffect(() => {
    if (selectedRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = selectedRef.current;
      const offsetLeft = el.offsetLeft - container.offsetLeft;
      container.scrollTo({
        left: offsetLeft - container.clientWidth / 2 + el.clientWidth / 2,
        behavior: 'smooth',
      });
    }
  }, [selectedDate]);

  return (
    <div className={styles.wrapper} ref={scrollRef}>
      <div className={styles.track}>
        {days.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          const today = isToday(date);

          return (
            <button
              key={date.toISOString()}
              ref={isSelected ? selectedRef : undefined}
              className={`${styles.day} ${isSelected ? styles.selected : ''}`}
              onClick={() => onSelectDate(date)}
              type="button"
            >
              <span className={styles.dayName}>{getShortDay(date)}</span>
              <span className={styles.dayNumber}>
                {format(date, 'd')}
              </span>
              {today && <span className={styles.todayDot} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
