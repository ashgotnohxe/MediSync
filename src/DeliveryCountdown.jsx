import { useState, useEffect } from "react";

export default function DeliveryCountdown({ placedAt }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const tick = () => {
      const secondsElapsed = Math.floor((Date.now() - placedAt) / 1000);
      setRemaining(Math.max(300 - secondsElapsed, 0));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [placedAt]);

  if (remaining <= 0) return <span className="countdown-done">Delivered</span>;

  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;

  return (
    <span className="countdown-active">
      Arriving in {min}:{sec.toString().padStart(2, "0")}
    </span>
  );
}