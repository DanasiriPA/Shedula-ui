"use client";

import { useState, useEffect } from "react";
import { Appointment } from "@/types/appointment";

export default function NotesSection({ appointment }: { appointment?: Appointment }) {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (appointment && appointment.notes) {
      setNotes(appointment.notes);
    }
  }, [appointment]);

  const handleSave = () => {
    if (!appointment) return;
    const all = JSON.parse(localStorage.getItem("appointments") || "[]");
    const updated = (all as Appointment[]).map((a) =>
      a.id === appointment.id ? { ...a, notes } : a
    );
    localStorage.setItem("appointments", JSON.stringify(updated));
    alert("Notes saved!");
  };

  return (
    <div className="mt-2">
      <textarea
        className="w-full border rounded p-2"
        placeholder="Add notes or doctor's advice..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      {appointment && (
        <button
          className="mt-2 px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          onClick={handleSave}
        >
          Save Notes
        </button>
      )}
    </div>
  );
}