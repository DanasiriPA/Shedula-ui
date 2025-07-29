"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function RecordsPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [emergency, setEmergency] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [vitals, setVitals] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [doctorNotes, setDoctorNotes] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Lobster&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const fetchData = async () => {
      try {
        const res = await fetch("https://6888ba66adf0e59551bb2689.mockapi.io/v1/patientlogin/1");
        const data = await res.json();

        setEmergency({
          allergies: data.emergencysummary || "N/A",
          medications: data.prescriptions || "N/A",
          conditions: data.medicalhistory || "N/A",
          emergencyContact: `${data.contactnumber || "N/A"} (${data.relation || "N/A"})`,
        });

        setHistory([
          {
            id: 1,
            department: "General",
            date: data.dateofbirth || "N/A",
            notes: data.medicalhistory || "N/A",
          },
        ]);

        setVitals({
          bloodPressure: "120/80",
          heartRate: "72",
          glucose: "90",
          weight: "70",
        });

        setPrescriptions([
          {
            id: 1,
            medicine: data.prescriptions || "N/A",
            dosage: "500mg",
            frequency: "Twice daily",
            doctor: data.doctorid || "Dr. Unknown",
            date: "2025-07-29",
          },
        ]);

        setDoctorNotes([
          {
            id: 1,
            doctor: data.doctorid || "Dr. Unknown",
            note: data.doctornotes || "No notes available",
          },
        ]);

        setGoals([
          {
            id: 1,
            goal: data.healthgoals || "No goals set",
          },
        ]);
      } catch (error) {
        console.error("Error fetching patient data:", error);
      }
    };

    fetchData();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.push("/dashboard")} className="text-blue-600 hover:text-blue-800 text-xl font-bold">←</button>
        <div className="flex flex-col items-center flex-grow">
          <Image src="https://i.postimg.cc/SKnMMNcw/360-F-863843181-63-Nv8tgy-BU8-X26-B1-Lq-Qvfi0tn95aj-Sg-X.jpg" alt="Shedula Logo" width={40} height={40} className="rounded-full" />
          <h1 className="text-2xl text-blue-700" style={{ fontFamily: "'Lobster', cursive" }}>Shedula</h1>
          <p className="text-sm text-gray-600 italic">Your personal health record vault</p>
        </div>
        <div className="w-6" />
      </div>

      {/* Emergency Summary */}
      {emergency && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-xl mb-6 shadow">
          <h2 className="text-lg font-bold text-red-700 mb-2">🚨 Emergency Summary</h2>
          <ul className="text-sm text-gray-800 space-y-1">
            <li><strong>Allergies:</strong> {emergency.allergies}</li>
            <li><strong>Medications:</strong> {emergency.medications}</li>
            <li><strong>Conditions:</strong> {emergency.conditions}</li>
            <li><strong>Emergency Contact:</strong> {emergency.emergencyContact}</li>
          </ul>
        </div>
      )}

      {/* Medical History */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">📅 Medical History</h2>
        <div className="space-y-3">
          {history.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-4 shadow">
              <p className="text-sm text-gray-700">🩺 {item.department} · {item.date}</p>
              <p className="text-xs text-gray-500">{item.notes}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Documents */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">📤 Upload Documents</h2>
        <input type="file" onChange={handleFileUpload} className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
        {selectedFile && <p className="mt-2 text-sm text-green-700">Uploaded: {selectedFile.name}</p>}
      </div>

      {/* Vitals Tracking */}
      {vitals && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">📈 Vitals</h2>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-800">
            <div className="bg-white rounded-xl p-4 shadow">
              <p><strong>Blood Pressure:</strong> {vitals.bloodPressure}</p>
              <p><strong>Heart Rate:</strong> {vitals.heartRate} bpm</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow">
              <p><strong>Glucose:</strong> {vitals.glucose} mg/dL</p>
              <p><strong>Weight:</strong> {vitals.weight} kg</p>
            </div>
          </div>
        </div>
      )}

      {/* Prescriptions */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">💊 Prescriptions</h2>
        <div className="space-y-3 text-sm text-gray-800">
          {prescriptions.map((p) => (
            <div key={p.id} className="bg-white rounded-xl p-4 shadow">
              <p><strong>{p.medicine}</strong> · {p.dosage} · {p.frequency}</p>
              <p className="text-xs text-gray-500">Prescribed by {p.doctor} · {p.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Doctor Notes */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">🧑‍⚕️ Doctor Notes</h2>
        {doctorNotes.map((note) => (
          <div key={note.id} className="bg-white rounded-xl p-4 shadow text-sm text-gray-800">
            <p><strong>{note.doctor}:</strong> {note.note}</p>
          </div>
        ))}
      </div>

      {/* Health Goals */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">🎯 Health Goals</h2>
        <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
          {goals.map((g) => (
            <li key={g.id}>{g.goal}</li>
                      ))}
        </ul>
      </div>

      {/* Footer */}
      <footer className="mt-10 text-center text-xs text-gray-500">
        <p>© 2025 Shedula. All rights reserved.</p>
      </footer>
    </div>
  );
}