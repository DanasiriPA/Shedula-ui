"use client";

import Image from "next/image";

type Props = {
  appointment: any;
  onCancel?: (appt: any) => void;
  onReschedule?: (appt: any) => void;
};

export default function AppointmentDetails({
  appointment,
  onCancel,
  onReschedule,
}: Props) {
  const { status } = appointment;

  const getStatusBadge = () => {
    switch (status) {
      case "cancelled":
        return <p className="text-sm font-semibold text-red-600 mt-1">🔴 Cancelled</p>;
      case "visited":
        return <p className="text-sm font-semibold text-green-600 mt-1">✅ Visited</p>;
      case "upcoming":
      default:
        return <p className="text-sm font-semibold text-green-600 mt-1">🟢 Upcoming</p>;
    }
  };

  return (
    <div className="bg-white shadow-md p-4 rounded-xl mb-4">
      <div className="flex gap-4 items-center">
        <Image
          src={appointment.avatar}
          alt={appointment.doctorName}
          width={60}
          height={60}
          className="rounded-full object-cover"
        />
        <div className="text-gray-900">
          <h2 className="text-lg font-bold">{appointment.doctorName}</h2>
          <p className="text-sm">{appointment.specialization}</p>
          <p className="text-sm">
            <strong>Date:</strong> {appointment.date}
          </p>
          <p className="text-sm">
            <strong>Time:</strong> {appointment.time}
          </p>
          <p className="text-sm">
            <strong>Token:</strong> {appointment.token}
          </p>
          {getStatusBadge()}
        </div>
      </div>

      {status === "upcoming" && (
        <div className="mt-4 flex gap-3">
          {onReschedule && (
            <button
              onClick={() => onReschedule(appointment)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Reschedule
            </button>
          )}
          {onCancel && (
            <button
              onClick={() => onCancel(appointment)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}