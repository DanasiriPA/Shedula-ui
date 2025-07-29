"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const [appointment, setAppointment] = useState<any | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("appointments");
    if (stored) {
      const appointments = JSON.parse(stored);
      const found = appointments.find((a: any) => a.id.toString() === id);
      setAppointment(found);
    }
  }, [id]);

  if (!appointment)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-red-600 font-bold text-xl">
        Appointment not found
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-4">
          <img
            src={appointment.avatar}
            alt={appointment.doctorName}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {appointment.doctorName}
            </h2>
            <p className="text-sm text-gray-700">{appointment.specialization}</p>
            <p className="text-sm text-gray-600">Token: {appointment.token}</p>
          </div>
        </div>

        <div className="text-gray-800">
          <p><strong>Date:</strong> {appointment.date}</p>
          <p><strong>Time:</strong> {appointment.time}</p>
          <p><strong>Patient:</strong> {appointment.patientName} ({appointment.patientAge} yrs)</p>
        </div>
      </div>
    </div>
  );
}
