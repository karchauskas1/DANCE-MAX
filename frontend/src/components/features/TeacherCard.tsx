import { Award } from 'lucide-react';
import styles from './TeacherCard.module.css';

interface TeacherCardProps {
  name: string;
  photoUrl?: string;
  specializations: string[];
  experienceYears: number;
  onClick?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function pluralizeYears(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} год`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} года`;
  return `${n} лет`;
}

export default function TeacherCard({
  name,
  photoUrl,
  specializations,
  experienceYears,
  onClick,
}: TeacherCardProps) {
  const initials = getInitials(name);

  return (
    <div
      className={styles.card}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Photo or avatar fallback */}
      <div className={styles.photoWrap}>
        {photoUrl ? (
          <img
            className={styles.photo}
            src={photoUrl}
            alt={name}
            loading="lazy"
          />
        ) : (
          <div className={styles.avatarFallback}>{initials}</div>
        )}
      </div>

      {/* Info section */}
      <div className={styles.info}>
        <h3 className={styles.name}>{name}</h3>

        {specializations.length > 0 && (
          <div className={styles.badges}>
            {specializations.map((spec) => (
              <span key={spec} className={styles.badge}>
                {spec}
              </span>
            ))}
          </div>
        )}

        <div className={styles.experience}>
          <Award size={14} strokeWidth={2} />
          <span>{pluralizeYears(experienceYears)} опыта</span>
        </div>
      </div>
    </div>
  );
}
