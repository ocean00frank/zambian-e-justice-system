"use client";

import { useEffect, useState } from "react";

type HearingCountdownProps = {
  date: string;
  time: string;
  className?: string;
};

function formatTimeRemaining(milliseconds: number) {
  if (milliseconds <= 0) return "Scheduled time has passed";

  const totalMinutes = Math.ceil(milliseconds / 60_000);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days} day${days === 1 ? "" : "s"}${hours ? `, ${hours} hour${hours === 1 ? "" : "s"}` : ""} remaining`;
  }
  if (hours > 0) {
    return `${hours} hour${hours === 1 ? "" : "s"}${minutes ? `, ${minutes} minute${minutes === 1 ? "" : "s"}` : ""} remaining`;
  }
  return minutes > 0 ? `${minutes} minute${minutes === 1 ? "" : "s"} remaining` : "Starting now";
}

export function HearingCountdown({ date, time, className }: HearingCountdownProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const scheduledTime = new Date(`${date}T${time}`);
  const text = now === null
    ? "Calculating time remaining…"
    : Number.isNaN(scheduledTime.getTime())
      ? "Time remaining unavailable"
      : formatTimeRemaining(scheduledTime.getTime() - now);

  return <p className={className}>{text}</p>;
}
