import { useEffect, useState } from "react";

export default function Reminder() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem("appointments") || "[]");
    const now = new Date();

    // Find the next upcoming appointment
    const next = all
      .filter((a: any) => a.status === "upcoming" || a.status === "confirmed")
      .map((a: any) => ({
        ...a,
        dateTime: new Date(`${a.date}T${a.time.length === 5 ? a.time : a.time.padStart(5, "0")}`),
      }))
      .filter((a: any) => a.dateTime > now)
      .sort((a: any, b: any) => a.dateTime - b.dateTime)[0];

    if (next) {
      const diffMs = next.dateTime.getTime() - now.getTime();
      const diffMins = diffMs / 60000;
      if (diffMins <= 30 && diffMins > 0) {
        setShow(true);
      }
    }
  }, []);

  if (!show) return null;

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
      Reminder: Appointment in 30 minutes
      </div>
      );
      }
      