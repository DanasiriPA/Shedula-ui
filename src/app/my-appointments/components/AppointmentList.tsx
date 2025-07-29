"use client";

import AppointmentDetails from "./AppointmentDetails";

export default function AppointmentList({ title, appointments, onCancel, onReschedule }: any) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="space-y-4">
        {appointments.length > 0 ? (
          appointments.map((appt: any) => (
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
