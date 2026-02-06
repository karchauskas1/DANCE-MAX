import type { CSSProperties, ComponentType } from 'react';
import {
  Flame,
  Heart,
  Moon,
  Music,
  Sparkles,
  Star,
  Zap,
  type LucideProps,
} from 'lucide-react';
import styles from './DirectionCard.module.css';

interface DirectionCardProps {
  name: string;
  slug: string;
  color: string;
  icon: string;
  shortDescription?: string;
  onClick?: () => void;
}

const iconMap: Record<string, ComponentType<LucideProps>> = {
  flame: Flame,
  heart: Heart,
  moon: Moon,
  music: Music,
  sparkles: Sparkles,
  star: Star,
  zap: Zap,
};

export default function DirectionCard({
  name,
  color,
  icon,
  shortDescription,
  onClick,
}: DirectionCardProps) {
  const IconComponent = iconMap[icon] ?? Sparkles;
  const cardStyle = { '--card-color': color } as CSSProperties;

  return (
    <button
      className={styles.card}
      style={cardStyle}
      onClick={onClick}
      type="button"
    >
      <div className={styles.glowOrb} />
      <div className={styles.iconWrap}>
        <IconComponent size={28} strokeWidth={1.8} />
      </div>
      <span className={styles.name}>{name}</span>
      {shortDescription && (
        <span className={styles.description}>{shortDescription}</span>
      )}
    </button>
  );
}
