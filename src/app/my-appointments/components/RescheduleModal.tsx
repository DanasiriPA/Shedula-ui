"use client";

import { useState } from "react";
import mockDoctors from "@/lib/mockDoctors";
import { format } from "date-fns";

export default function RescheduleModal({ appointment, onClose }: any) {
  const doctor = mockDoctors.find((doc) => doc.id === appointment.doctorId);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const next7 = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return format(d, "yyyy-MM-dd");
  });

  const handleReschedule = () => {
    if (!selectedDate || !selectedTime) {
      alert("Select date and time");
      return;
    }

    const data = JSON.parse(localStorage.getItem("appointments") || "[]");
    const updated = data.map((a: any) =>
      a.id === appointment.id
        ? { ...a, date: selectedDate, time: selectedTime }
        : a
    );
    localStorage.setItem("appointments", JSON.stringify(updated));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-lg w-full space-y-4 text-gray-900">
        <h2 className="text-lg font-bold text-blue-700">🔁 Reschedule Appointment</h2>

        <div>
          <label className="font-semibold">Select Date:</label>
          <div className="flex gap-2 flex-wrap mt-2">
            {next7.map((d) => (
              <button
                key={d}
                onClick={() => {
                  setSelectedDate(d);
                  setSelectedTime("");
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedDate === d
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {selectedDate && (
          <div>
            <label className="font-semibold">Select Time:</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {doctor?.availableSlots?.[selectedDate]?.map((slot: any) => (
                <button
                  key={slot.time}
                  disabled={!slot.available}
                  onClick={() => setSelectedTime(slot.time)}
                  className={`px-3 py-1 rounded-full border text-sm font-medium
                    ${slot.available ? "bg-green-100 text-green-900 border-green-400" : "bg-red-100 text-red-800 border-red-400"}
                    ${selectedTime === slot.time && slot.available ? "ring-2 ring-blue-600" : ""}
                  `}
                >
                  {slot.time}
                </button>
              )) || <p className="text-sm text-gray-600">No slots</p>}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="bg-gray-300 text-gray-900 px-4 py-2 rounded">Close</button>
          <button onClick={handleReschedule} className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">Save</button>
        </div>
      </div>
    </div>
  );
}