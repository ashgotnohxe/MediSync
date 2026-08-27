import { useState, useEffect } from "react";

export default function DeliveryCountdown({ placedAt }) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const elapsed = Math.floor((Date.now() - placedAt) / 1000);
    return Math.max(0, 300 - elapsed);
  });

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - placedAt) / 1000);
      const remaining = Math.max(0, 300 - elapsed);
      setSecondsLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [placedAt, secondsLeft]);

  if (secondsLeft <= 0) {
    return <span className="med-delivery-done">🎉 Delivered to your address</span>;
  }

  const mins = Math.floor(secondsLeft / 60);
  const secs = String(secondsLeft % 60).padStart(2, "0");

  return (
    <span className="med-delivery-active">
      🚚 Arriving in {mins}:{secs}
    </span>
  );
}
