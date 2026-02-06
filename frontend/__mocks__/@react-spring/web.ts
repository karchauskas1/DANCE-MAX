import React from 'react';

export function useSpring(_config: Record<string, unknown>) {
  return {
    number: {
      to: (fn: (n: number) => number) => fn(0),
    },
  };
}

export function useSprings(count: number, _fn: unknown) {
  return [Array.from({ length: count }, () => ({})), () => {}] as const;
}

export function useTrail(count: number, _config: unknown) {
  return Array.from({ length: count }, () => ({}));
}

export function useTransition(items: unknown[], _config: unknown) {
  const arr = Array.isArray(items) ? items : [items];
  return arr.map((item, index) => ({
    item,
    key: index,
    props: {},
  }));
}

function createAnimatedComponent(tag: string) {
  const AnimatedComponent = React.forwardRef<unknown, Record<string, unknown>>(
    (props, ref) => React.createElement(tag, { ...props, ref }),
  );
  AnimatedComponent.displayName = `animated.${tag}`;
  return AnimatedComponent;
}

const animatedHandler: ProxyHandler<Record<string, unknown>> = {
  get(_target, prop: string) {
    return createAnimatedComponent(prop);
  },
};

export const animated = new Proxy({} as Record<string, unknown>, animatedHandler);

export const config = {
  default: { tension: 170, friction: 26 },
  gentle: { tension: 120, friction: 14 },
  wobbly: { tension: 180, friction: 12 },
  stiff: { tension: 210, friction: 20 },
  slow: { tension: 280, friction: 60 },
  molasses: { tension: 280, friction: 120 },
};
