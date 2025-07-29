"use client";

import { useEffect, useState } from "react";
import AppointmentDetails from "./AppointmentDetails";
import { Appointment } from "@/types/appointment";

export default function HistoryTab() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem("appointments") || "[]");
    setAppointments(
      (all as Appointment[]).filter(
        (a) => a.status === "completed" || a.status === "cancelled"
      )
    );
  }, []);

  return (
    <div>
      {appointments.length === 0 ? (
        <p>No past appointments.</p>
      ) : (
        appointments.map((appt) => (
          <AppointmentDetails key={appt.id} appointment={appt} />
        ))
      )}
    </div>
  );
}