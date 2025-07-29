"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import mockDoctors from "@/lib/mockDoctors";

export default function DoctorDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const doctor = mockDoctors.find((doc) => doc.id === id);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [popup, setPopup] = useState(false);
  const [tokenNumber, setTokenNumber] = useState("");

  const handleBook = () => {
    if (!selectedDate || !selectedTime || !patientName || !patientAge) {
      alert("Please fill all fields.");
      return;
    }

    const token = "A" + Math.floor(10 + Math.random() * 90);
    setTokenNumber(token);
    setPopup(true);

    const existing = JSON.parse(localStorage.getItem("appointments") || "[]");

    const newAppointment = {
      id: Date.now(),
      doctorId: id,
      doctorName: doctor?.name,
      avatar: doctor?.avatar,
      specialization: doctor?.specialization,
      date: selectedDate,
      time: selectedTime,
      token,
      patientName,
      patientAge,
      status: "upcoming",
      createdAt: new Date().toISOString(),
      notes: "",
      rating: 0,
    };

    localStorage.setItem("appointments", JSON.stringify([...existing, newAppointment]));

    setTimeout(() => {
      router.push("/my-appointments");
    }, 2000);
  };

  if (!doctor)
    return <p className="p-4 text-red-600 text-lg font-bold">Doctor not found</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-4">
          <img
            src={doctor.avatar}
            alt={doctor.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{doctor.name}</h2>
            <p className="text-sm text-gray-900">{doctor.specialization}</p>
            <p className="text-sm text-gray-900">
              {doctor.age} yrs · {doctor.experience} yrs exp
            </p>
            <p className="text-sm text-yellow-700 font-semibold">
              ⭐ {doctor.rating}
            </p>
          </div>
        </div>

        <p className="text-gray-900">{doctor.description}</p>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1">Select Date</label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(doctor.availableSlots).map((date) => (
              <button
                key={date}
                onClick={() => {
                  setSelectedDate(date);
                  setSelectedTime("");
                }}
                className={`px-3 py-1 rounded-full border text-sm font-semibold ${
                  selectedDate === date
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {date}
              </button>
            ))}
          </div>
        </div>

        {selectedDate && (
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Select Time Slot
            </label>
            <div className="flex flex-wrap gap-2">
              {doctor.availableSlots[selectedDate]
                .filter((slot: any) => {
                  if (!slot.available) return false;

                  const now = new Date();
                  const [hourStr, minuteStr] = slot.time.split(":");
                  const slotDateTime = new Date(selectedDate);
                  slotDateTime.setHours(parseInt(hourStr));
                  slotDateTime.setMinutes(parseInt(minuteStr));
                  slotDateTime.setSeconds(0);

                  return slotDateTime.getTime() > now.getTime();
                })
                .map((slot: any) => (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`px-3 py-1 rounded-full border text-sm font-semibold
                      ${
                        selectedTime === slot.time
                          ? "ring-2 ring-blue-600"
                          : "bg-green-100 text-green-800 border-green-400"
                      }`}
                  >
                    {slot.time}
                  </button>
                ))}
              {doctor.availableSlots[selectedDate].every((slot: any) => {
                const [hourStr, minuteStr] = slot.time.split(":");
                const slotDateTime = new Date(selectedDate);
                slotDateTime.setHours(parseInt(hourStr));
                slotDateTime.setMinutes(parseInt(minuteStr));
                slotDateTime.setSeconds(0);
                return !slot.available || slotDateTime <= new Date();
              }) && (
                <p className="text-sm text-red-600 mt-2">No available future slots</p>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Your Name
            </label>
            <input
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full border px-3 py-2 rounded text-gray-900"
              placeholder="Enter name"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Your Age
            </label>
            <input
              type="number"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
              className="w-full border px-3 py-2 rounded text-gray-900"
              placeholder="Enter age"
            />
          </div>
        </div>

        <button
          onClick={handleBook}
          className="w-full mt-4 bg-indigo-700 text-white py-2 rounded font-bold hover:bg-indigo-800"
        >
          Book Appointment
        </button>
      </div>

      {popup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 text-center space-y-3 max-w-sm">
            <h2 className="text-xl font-bold text-green-700">
              ✅ Appointment Booked!
            </h2>
            <p className="text-lg text-gray-900">
              Token No: <strong>{tokenNumber}</strong>
            </p>
            <p className="text-gray-900 text-base">
              You’ll receive a reminder 30 mins before the appointment.
              <br />
              Thank you!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}