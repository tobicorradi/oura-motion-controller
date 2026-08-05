import { useEffect, useState } from "react";
import "./ringBattery.css";

type BatteryStatus = { battery: number | null; checkedAt: string };

export function RingBattery() {
  const [status, setStatus] = useState<BatteryStatus | null>(null);

  useEffect(() => {
    let active = true;
    const load = () =>
      fetch(`/oura-status.json?${Date.now()}`, { cache: "no-store" })
        .then((response) =>
          response.ok ? (response.json() as Promise<BatteryStatus>) : null,
        )
        .then((value) => {
          if (active) setStatus(value);
        })
        .catch(() => {
          if (active) setStatus(null);
        });
    void load();
    const timer = window.setInterval(() => void load(), 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  if (status?.battery === null || !status) return null;
  return (
    <span
      className="ring-battery"
      title={`Last checked ${new Date(status.checkedAt).toLocaleTimeString()}`}
    >
      <i />
      Oura battery <strong>{status.battery}%</strong>
    </span>
  );
}
