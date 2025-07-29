"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import mockDoctors from "@/lib/mockDoctors";

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [availability, setAvailability] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Load Lobster font
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Lobster&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const doctorSpecialties = Array.from(
    new Set(mockDoctors.map((doc) => doc.specialization))
  ).map((name) => {
    const emojiMap: Record<string, string> = {
      Gyno: "👩‍⚕️",
      Neuro: "🧠",
      Skin: "🧴",
      Heart: "❤️",
      "Child Specialist": "🧒",
      General: "🩺",
      Ortho: "🦴",
      Dental: "🦷",
      Eye: "👁️",
      Psychiatry: "🧘",
      Oncology: "🎗️",
      Kidney: "🩸",
      Pulmonology: "🌬️",
      Gastroenterology: "🍽️",
    };
    return { name, emoji: emojiMap[name] || "🩺" };
  });

  const filteredDoctors = mockDoctors.filter(
    (doc) =>
      doc.name.toLowerCase().includes(search.toLowerCase()) &&
      (!filter || doc.specialization === filter) &&
      (!availability ||
        (availability === "available" && doc.available) ||
        (availability === "unavailable" && !doc.available))
  );

  const handleDoctorClick = (id: string) => {
    setLoadingId(id);
    router.push(`/doctors/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 p-4 pb-24">
      {/* Logo and Heading */}
      <div className="flex flex-col items-center gap-2">
  <Image
    src="https://i.postimg.cc/SKnMMNcw/360-F-863843181-63-Nv8tgy-BU8-X26-B1-Lq-Qvfi0tn95aj-Sg-X.jpg"
    alt="Shedula Logo"
    width={50}
    height={50}
    className="rounded-full"
  />
  <h1
    className="text-4xl text-blue-700"
    style={{ fontFamily: "'Lobster', cursive" }}
  >
    Shedula
  </h1>
  <p className="text-sm text-gray-600 italic">
    Find the right doctor for your needs
  </p>
</div>
      {/* Search */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="🔍 Search doctors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-5 py-3 rounded-full border border-gray-300 shadow-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        {/* Availability Filters */}
        <div className="flex gap-2 justify-center sm:justify-start">
          {["", "available", "unavailable"].map((type) => {
            const label =
              type === "available"
                ? "🟢 Available"
                : type === "unavailable"
                ? "🔴 Unavailable"
                : "All";
            return (
              <button
                key={type}
                onClick={() => setAvailability(type)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                  availability === type
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600 border-blue-300 hover:bg-blue-100"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Specialization Dropdown */}
        <div className="relative w-full sm:w-64">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-2 rounded-full border border-indigo-300 text-indigo-700 bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">🔽 All Specializations</option>
            {doctorSpecialties.map((tag) => (
              <option key={tag.name} value={tag.name}>
                {tag.emoji} {tag.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters */}
      <div className="text-center mb-6">
        <button
          onClick={() => {
            setSearch("");
            setFilter("");
            setAvailability("");
          }}
          className="text-sm text-gray-600 underline hover:text-blue-600"
        >
          Clear all filters
        </button>
      </div>

      {/* Doctor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            onClick={() => handleDoctorClick(doc.id)}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] p-6 border border-gray-200 cursor-pointer relative"
          >
            {loadingId === doc.id && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-2xl">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            )}
            <div className="flex items-center gap-4 mb-4">
              <Image
                src={doc.avatar}
                alt={doc.name}
                width={70}
                height={70}
                className="rounded-full object-cover border-4 border-white shadow-md"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900">{doc.name}</h3>
                <p className="text-sm text-blue-600 font-medium">{doc.specialization}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              {doc.age} yrs · {doc.experience} yrs exp · {doc.location}
            </p>
            <p className="text-sm text-gray-600 italic">{doc.description}</p>
            <div className="flex justify-between items-center mt-3">
              <span className="text-yellow-600 font-semibold text-sm">⭐ {doc.rating}</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  doc.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                }`}
              >
                {doc.available ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-300 flex justify-around py-3 shadow-xl text-gray-700 font-medium text-sm z-50">
        <button onClick={() => router.push("/dashboard")} className="hover:text-blue-600 flex flex-col items-center">
          🏥 <span>Doctors</span>
        </button>
        <button onClick={() => router.push("/my-appointments")} className="hover:text-blue-600 flex flex-col items-center">
          📅 <span>Appointments</span>
        </button>
        <button onClick={() => router.push("/records")} className="hover:text-blue-600 flex flex-col items-center">
          🗂️ <span>Records</span>
        </button>
        <button onClick={() => router.push("/profile")} className="hover:text-blue-600 flex flex-col items-center">
          👤 <span>Profile</span>
        </button>
      </div>
    </div>
  );
}