import { format, isToday, isTomorrow, addDays, startOfWeek } from 'date-fns';
import { ru } from 'date-fns/locale/ru';

/**
 * Форматирует дату занятия в полный вид.
 * Пример: "6 февраля, четверг"
 */
export const formatLessonDate = (date: string): string => {
  const d = new Date(date);
  return format(d, "d MMMM, EEEE", { locale: ru });
};

/**
 * Форматирует временной интервал занятия.
 * Пример: "19:00 — 20:15"
 */
export const formatLessonTime = (start: string, end: string): string => {
  return `${start} — ${end}`;
};

/**
 * Форматирует дату в короткий вид.
 * Пример: "6 фев"
 */
export const formatShortDate = (date: string): string => {
  const d = new Date(date);
  return format(d, "d MMM", { locale: ru });
};

/**
 * Возвращает сокращённое название дня недели.
 * Пример: "Пн", "Вт", "Ср"
 */
export const getDayName = (date: string): string => {
  const d = new Date(date);
  // date-fns выдаёт "пн", "вт" — приводим первую букву к верхнему регистру
  const dayName = format(d, 'EEEEEE', { locale: ru });
  return dayName.charAt(0).toUpperCase() + dayName.slice(1);
};

/**
 * Формирует массив дней недели начиная с понедельника.
 * Используется для горизонтального скролла выбора даты в расписании.
 */
export const getWeekDays = (
  startDate?: Date,
): Array<{
  date: Date;
  dayName: string;
  dayNum: number;
  isToday: boolean;
}> => {
  const base = startDate || new Date();
  // Начало недели — понедельник (weekStartsOn: 1)
  const weekStart = startOfWeek(base, { weekStartsOn: 1 });

  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i);
    const dayName = format(day, 'EEEEEE', { locale: ru });

    return {
      date: day,
      dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
      dayNum: day.getDate(),
      isToday: isToday(day),
    };
  });
};

/**
 * Форматирует цену из копеек в рубли с разделителями.
 * Пример: 560000 → "5 600 ₽"
 */
export const formatPrice = (kopecks: number): string => {
  const rubles = Math.floor(kopecks / 100);
  const formatted = rubles.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} \u20BD`;
};

/**
 * Форматирует дату относительно текущего дня.
 * - Если сегодня → "Сегодня"
 * - Если завтра → "Завтра"
 * - Иначе → "6 февраля"
 */
export const formatRelativeDate = (date: string): string => {
  const d = new Date(date);

  if (isToday(d)) {
    return 'Сегодня';
  }

  if (isTomorrow(d)) {
    return 'Завтра';
  }

  return format(d, 'd MMMM', { locale: ru });
};
