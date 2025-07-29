import { useEffect, useState } from "react";
import AppointmentDetails from "./AppointmentDetails";

export default function HistoryTab() {
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem("appointments") || "[]");
    // Show only completed or cancelled appointments
    setAppointments(
      all.filter(
        (a: any) => a.status === "completed" || a.status === "cancelled"
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
