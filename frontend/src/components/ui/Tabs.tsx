import { useRef, useEffect, useState, useCallback } from 'react';
import styles from './Tabs.module.css';

interface TabsProps {
  tabs: string[];
  activeIndex: number;
  onChange: (index: number) => void;
}

export default function Tabs({ tabs, activeIndex, onChange }: TabsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });

  const updateIndicator = useCallback(() => {
    const activeTab = tabRefs.current[activeIndex];
    if (!activeTab || !scrollerRef.current) return;

    const scrollerRect = scrollerRef.current.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();

    setIndicatorStyle({
      left: tabRect.left - scrollerRect.left + scrollerRef.current.scrollLeft,
      width: tabRect.width,
    });
  }, [activeIndex]);

  useEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  useEffect(() => {
    const activeTab = tabRefs.current[activeIndex];
    if (!activeTab || !scrollerRef.current) return;

    const scroller = scrollerRef.current;
    const tabRect = activeTab.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();

    if (tabRect.right > scrollerRect.right) {
      scroller.scrollBy({
        left: tabRect.right - scrollerRect.right + 16,
        behavior: 'smooth',
      });
    } else if (tabRect.left < scrollerRect.left) {
      scroller.scrollBy({
        left: tabRect.left - scrollerRect.left - 16,
        behavior: 'smooth',
      });
    }
  }, [activeIndex]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.scroller} ref={scrollerRef}>
        {tabs.map((tab, index) => (
          <button
            key={tab}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            className={`${styles.tab} ${
              index === activeIndex ? styles.active : styles.inactive
            }`}
            onClick={() => onChange(index)}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className={styles.indicatorTrack}>
        <div
          className={styles.indicator}
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
          }}
        />
      </div>
    </div>
  );
}
