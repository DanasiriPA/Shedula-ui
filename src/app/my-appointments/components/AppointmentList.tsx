"use client";

import AppointmentDetails from "./AppointmentDetails";
import { Appointment } from "@/types/appointment";

type Props = {
  title: string;
  appointments: Appointment[];
  onCancel?: (appt: Appointment) => void;
  onReschedule?: (appt: Appointment) => void;
};

export default function AppointmentList({
  title,
  appointments,
  onCancel,
  onReschedule,
}: Props) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="space-y-4">
        {appointments.length > 0 ? (
          appointments.map((appt) => (
            <AppointmentDetails
              key={appt.id}
              appointment={appt}
              onCancel={onCancel}
              onReschedule={onReschedule}
            />
          ))
        ) : (
          <p className="text-gray-700">No appointments found.</p>
        )}
      </div>
    </div>
  );
}