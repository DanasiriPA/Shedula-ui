"use client";

import { useEffect, useState } from "react";
import { Appointment } from "@/types/appointment";

type EnrichedAppointment = Appointment & { dateTime: Date };

export default function Reminder() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem("appointments") || "[]") as Appointment[];
    const now = new Date();

    // Find the next upcoming appointment
    const next = all
      .filter((a) => a.status === "upcoming" || a.status === "confirmed")
      .map((a): EnrichedAppointment => ({
        ...a,
        dateTime: new Date(`${a.date}T${a.time.length === 5 ? a.time : a.time.padStart(5, "0")}`),
      }))
      .filter((a) => a.dateTime > now)
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())[0];

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
      ⏰ Reminder: You have an appointment in less than 30 minutes!
    </div>
  );
}