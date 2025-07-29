"use client";

export default function CancelModal({ appointment, onClose }: any) {
  const handleCancel = () => {
    const data = JSON.parse(localStorage.getItem("appointments") || "[]");
    const updated = data.map((a: any) =>
      a.id === appointment.id ? { ...a, status: "cancelled" } : a
    );
    localStorage.setItem("appointments", JSON.stringify(updated));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl text-center max-w-md space-y-3 text-gray-900">
        <h2 className="text-xl font-bold text-red-700">⚠️ Cancel Appointment</h2>
        <p>
          Are you sure you want to cancel your appointment with{" "}
          <strong>{appointment.doctorName}</strong> on{" "}
          <strong>{appointment.date}</strong> at{" "}
          <strong>{appointment.time}</strong>?
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-900 rounded"
          >
            No
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );
}