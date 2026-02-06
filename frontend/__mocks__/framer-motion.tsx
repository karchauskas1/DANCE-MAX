import React from 'react';
import type { ReactNode, ComponentPropsWithoutRef, ElementType } from 'react';

/**
 * Lightweight framer-motion mock.
 * Every motion.* component renders the corresponding HTML element and
 * passes through all standard DOM props while silently dropping
 * framer-specific props (variants, initial, animate, exit, etc.).
 */

const FRAMER_PROPS = new Set([
  'variants',
  'initial',
  'animate',
  'exit',
  'transition',
  'whileHover',
  'whileTap',
  'whileFocus',
  'whileDrag',
  'whileInView',
  'layout',
  'layoutId',
  'onAnimationStart',
  'onAnimationComplete',
  'drag',
  'dragConstraints',
  'dragElastic',
  'dragMomentum',
  'dragTransition',
  'onDragStart',
  'onDrag',
  'onDragEnd',
]);

function stripFramerProps(props: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const key of Object.keys(props)) {
    if (!FRAMER_PROPS.has(key)) {
      clean[key] = props[key];
    }
  }
  return clean;
}

function createMotionComponent(tag: string) {
  const MotionComponent = React.forwardRef<unknown, Record<string, unknown>>(
    (props, ref) => React.createElement(tag, { ...stripFramerProps(props), ref }),
  );
  MotionComponent.displayName = `motion.${tag}`;
  return MotionComponent;
}

const motionHandler: ProxyHandler<Record<string, unknown>> = {
  get(_target, prop: string) {
    return createMotionComponent(prop);
  },
};

export const motion = new Proxy({} as Record<string, unknown>, motionHandler);

export function AnimatePresence({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export function useAnimation() {
  return {
    start: () => Promise.resolve(),
    stop: () => {},
    set: () => {},
  };
}

export function useMotionValue(initial: number) {
  return {
    get: () => initial,
    set: () => {},
    onChange: () => () => {},
  };
}

export function useTransform(value: unknown, _input: number[], output: number[]) {
  return {
    get: () => output[0],
    set: () => {},
    onChange: () => () => {},
  };
}

export function useSpring(value: unknown) {
  return value;
}

export function useInView() {
  return [null, true] as const;
}

export function useScroll() {
  return {
    scrollX: { get: () => 0 },
    scrollY: { get: () => 0 },
    scrollXProgress: { get: () => 0 },
    scrollYProgress: { get: () => 0 },
  };
}
