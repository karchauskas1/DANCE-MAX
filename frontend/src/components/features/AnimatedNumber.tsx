import { useSpring, animated } from '@react-spring/web';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
}

export default function AnimatedNumber({
  value,
  duration = 800,
}: AnimatedNumberProps) {
  const { number } = useSpring({
    number: value,
    from: { number: 0 },
    config: { duration },
  });

  return (
    <animated.span>
      {number.to((n) => Math.floor(n))}
    </animated.span>
  );
}
