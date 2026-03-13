import { useEffect, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  symbol?: string;
}

export function AnimatedNumber({ value, symbol = "$" }: AnimatedNumberProps) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const duration = 600;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(value * eased);
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span>
      {symbol}
      &nbsp;
      {Math.abs(displayed).toFixed(2)}
    </span>
  );
}
