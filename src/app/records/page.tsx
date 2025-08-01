// app/records/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaStethoscope,
  FaCalendarAlt,
  FaCapsules,
  FaNotesMedical,
  FaUserCircle,
  FaChevronLeft,
  FaFileMedical, // New icon for medical history/documents
  FaHeartbeat,    // New icon for vitals
  FaPrescriptionBottleAlt, // New icon for prescriptions
  FaUserMd,       // New icon for doctor notes
  FaBullseye,     // New icon for health goals
  FaUpload,       // New icon for upload
  FaMapMarkerAlt, // For footer
  FaBriefcaseMedical // For footer
} from "react-icons/fa";

// ✅ Type Definitions
interface EmergencySummary {
  allergies: string;
  medications: string;
  conditions: string;
  emergencyContact: string;
}

// MedicalHistoryItem will now essentially just hold a single string note
interface MedicalHistoryItem {
  id: number;
  department: string;
  date: string;
  notes: string;
}

// Vitals interface updated to include 'temperature' and reflects flat structure
interface Vitals {
  bloodPressure: string;
  heartRate: string;
  glucose: string;
  weight: string;
  temperature: string; // Added temperature
}

// Prescription will now essentially just hold a single string for medicine
interface Prescription {
  id: number;
  medicine: string;
  dosage: string;
  frequency: string;
  doctor: string;
  date: string;
}

// DoctorNote will now essentially just hold a single string note
interface DoctorNote {
  id: number;
  doctor: string;
  note: string;
}

// HealthGoal will now essentially just hold a single string goal
interface HealthGoal {
  id: number;
  goal: string;
}

export default function RecordsPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFileUploadSuccess, setShowFileUploadSuccess] = useState(false);

  const [emergency, setEmergency] = useState<EmergencySummary | null>(null);
  const [history, setHistory] = useState<MedicalHistoryItem[]>([]);
  const [vitals, setVitals] = useState<Vitals | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [doctorNotes, setDoctorNotes] = useState<DoctorNote[]>([]);
  const [goals, setGoals] = useState<HealthGoal[]>([]);

  useEffect(() => {
    // This line adds the Google Font for 'Lobster' for consistency
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Lobster&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const fetchData = async () => {
      try {
        const res = await fetch("https://6888ba66adf0e59551bb2689.mockapi.io/v1/patientlogin/1");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();

        // Populate state with fetched data, with fallbacks
        setEmergency({
          allergies: data.allergies || "None known",
          medications: data.currentMedications || "None",
          conditions: data.chronicConditions || "None",
          emergencyContact: `${data.emergencyContactName || "N/A"} (${data.emergencyContactRelation || "N/A"}) - ${data.emergencyContactPhone || "N/A"}`,
        });

        // --- Adjustments for Simplified Data from MockAPI ---

        // Medical History (now a single string in MockAPI, so we make it a single-item array)
        setHistory([
          {
            id: 1,
            department: "Summary", // Categorize as summary since it's one string
            date: data.lastUpdated ? new Date(data.lastUpdated).toLocaleDateString() : "N/A", // Use lastUpdated for date
            notes: data.medicalHistory || "No medical history recorded."
          }
        ]);

        // Vitals (now flattened in MockAPI, directly at top level)
        setVitals({
          bloodPressure: data.bloodPressure || "N/A",
          heartRate: data.heartRate || "N/A",
          glucose: data.glucose || "N/A",
          weight: data.weight || "N/A",
          temperature: data.temperature || "N/A" // Access directly
        });

        // Prescriptions (now a single string in MockAPI, so we make it a single-item array)
        setPrescriptions([
          {
            id: 1,
            medicine: data.prescriptions || "No prescriptions",
            dosage: "N/A", // Default for simplified data
            frequency: "N/A", // Default for simplified data
            doctor: "N/A",    // Default for simplified data
            date: "N/A"       // Default for simplified data
          }
        ]);

        // Doctor Notes (now a single string in MockAPI, so we make it a single-item array)
        setDoctorNotes([
          {
            id: 1,
            doctor: "General Notes", // Categorize as general notes
            note: data.doctorNotes || "No doctor's notes recorded."
          }
        ]);

        // Health Goals (now a single string in MockAPI, so we make it a single-item array)
        setGoals([
          {
            id: 1,
            goal: data.healthGoals || "No health goals set."
          }
        ]);

      } catch (error) {
        console.error("Error fetching patient data:", error);
        // Set default/empty states on error, ensuring consistent types
        setEmergency({
          allergies: "N/A", medications: "N/A", conditions: "N/A", emergencyContact: "N/A (N/A) - N/A",
        });
        setHistory([{ id: 1, department: "General", date: "N/A", notes: "Could not load medical history." }]);
        setVitals({ bloodPressure: "N/A", heartRate: "N/A", glucose: "N/A", weight: "N/A", temperature: "N/A" });
        setPrescriptions([{ id: 1, medicine: "Could not load prescriptions", dosage: "", frequency: "", doctor: "", date: "" }]);
        setDoctorNotes([{ id: 1, doctor: "System", note: "Could not load doctor notes." }]);
        setGoals([{ id: 1, goal: "Could not load health goals." }]);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      setShowFileUploadSuccess(true);
      setTimeout(() => setShowFileUploadSuccess(false), 3000); // Hide message after 3 seconds
      // In a real application, you would send this file to a server.
      console.log("File selected for upload:", e.target.files[0].name);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 text-gray-900 font-inter relative overflow-x-hidden">
      <style jsx global>{`
        .bg-medical-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2393c5fd' fill-opacity='0.6'%3E%3Cpath d='M20 40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0-20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm40-40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2z'/%3E%3Cpath d='M42 20h-4v-4h-4v4h-4v4h4v4h4v-4h4v-4zm0 40h-4v-4h-4v4h-4v4h4v4h4v-4h4v-4z'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 80px 80px;
          opacity: 0.5;
        }
      `}</style>

      {/* Background with Medical Pattern */}
      <div className="absolute inset-0 z-0 bg-white bg-medical-pattern"></div>

      {/* --- Header (Top Nav) --- */}
      <motion.div
        className={`fixed top-0 left-0 right-0 z-50 py-5 px-8 flex justify-between items-center transition-all duration-300 rounded-b-3xl shadow-xl bg-white/90 backdrop-blur-md border-b-2 border-transparent bg-origin-border bg-clip-border bg-gradient-to-br from-blue-200 via-white to-purple-200`}
      >
        <div className="flex items-center gap-4">
          <Image
            src="https://i.postimg.cc/SKnMMNcw/360-F-863843181-63-Nv8tgy-BU8-X26-B1-Lq-Qvfi0tn95aj-Sg-X.jpg"
            alt="Shedula Logo"
            width={45}
            height={45}
            className="rounded-full shadow-md"
          />
          <motion.h1
            className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-lobster"
            style={{ fontFamily: "'Lobster', cursive" }}
            whileHover={{ scale: 1.05, textShadow: "0px 0px 8px rgba(0, 0, 0, 0.2)" }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Shedula
          </motion.h1>
        </div>
        <div className="flex gap-8 text-gray-600 font-medium text-lg items-center">
          <motion.button
            onClick={() => router.push("/dashboard")}
            whileHover={{ y: -3, color: "#4F46E5" }}
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaStethoscope className="text-blue-600" /> Doctors
          </motion.button>
          <motion.button
            onClick={() => router.push("/my-appointments")}
            whileHover={{ y: -3, color: "#4F46E5" }}
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaCalendarAlt className="text-blue-600" /> Appointments
          </motion.button>
          <motion.button
            onClick={() => router.push("/medicines")}
            whileHover={{ y: -3, color: "#4F46E5" }}
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaCapsules className="text-blue-600" /> Medicines
          </motion.button>
          <motion.button
            onClick={() => router.push("/records")}
            whileHover={{ y: -3, color: "#4F46E5" }}
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaNotesMedical className="text-blue-600" /> Records
          </motion.button>
        </div>
        <motion.button
          onClick={() => router.push("/profile")}
          className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors shadow-md"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaUserCircle className="text-2xl" />
        </motion.button>
      </motion.div>

      <div className="relative z-10 pt-28 px-8 pb-16 w-full min-h-screen flex flex-col items-center">
        <motion.button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6 text-lg font-medium self-start ml-4 md:ml-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FaChevronLeft /> Back to Dashboard
        </motion.button>

        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 mb-10 mt-4">
          My Health Records
        </h1>

        <div className="w-full max-w-5xl space-y-8">
          {/* Emergency Summary */}
          {emergency && (
            <motion.div
              className="bg-red-50 border-l-8 border-red-500 p-6 rounded-2xl shadow-xl transform hover:scale-[1.005] transition-transform duration-200 ease-in-out"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center gap-3">
                <FaNotesMedical className="text-3xl" /> Emergency Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
                <p>
                  <strong className="text-red-600">Allergies:</strong>{" "}
                  {emergency.allergies}
                </p>
                <p>
                  <strong className="text-red-600">Medications:</strong>{" "}
                  {emergency.medications}
                </p>
                <p>
                  <strong className="text-red-600">Conditions:</strong>{" "}
                  {emergency.conditions}
                </p>
                <p>
                  <strong className="text-red-600">Emergency Contact:</strong>{" "}
                  {emergency.emergencyContact}
                </p>
              </div>
            </motion.div>
          )}

          {/* Medical History */}
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 transform hover:scale-[1.005] transition-transform duration-200 ease-in-out"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-3">
              <FaFileMedical className="text-3xl" /> Medical History
            </h2>
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-blue-50 rounded-xl p-4 shadow-sm border border-blue-100"
                >
                  <p className="text-lg font-semibold text-gray-800 mb-1">
                    {item.department} <span className="font-normal text-gray-500 text-sm">· {item.date}</span>
                  </p>
                  <p className="text-gray-700">{item.notes}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Vitals Tracking */}
          {vitals && (
            <motion.div
              className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 transform hover:scale-[1.005] transition-transform duration-200 ease-in-out"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center gap-3">
                <FaHeartbeat className="text-3xl" /> Vitals
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg text-gray-800">
                <div className="bg-purple-50 rounded-xl p-4 shadow-sm border border-purple-100 flex items-center gap-2">
                  <span className="font-semibold">Blood Pressure:</span> {vitals.bloodPressure}
                </div>
                <div className="bg-purple-50 rounded-xl p-4 shadow-sm border border-purple-100 flex items-center gap-2">
                  <span className="font-semibold">Heart Rate:</span> {vitals.heartRate} bpm
                </div>
                <div className="bg-purple-50 rounded-xl p-4 shadow-sm border border-purple-100 flex items-center gap-2">
                  <span className="font-semibold">Glucose:</span> {vitals.glucose} mg/dL
                </div>
                <div className="bg-purple-50 rounded-xl p-4 shadow-sm border border-purple-100 flex items-center gap-2">
                  <span className="font-semibold">Weight:</span> {vitals.weight} kg
                </div>
                 <div className="bg-purple-50 rounded-xl p-4 shadow-sm border border-purple-100 flex items-center gap-2">
                  <span className="font-semibold">Temperature:</span> {vitals.temperature}
                </div>
              </div>
            </motion.div>
          )}

          {/* Prescriptions */}
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 transform hover:scale-[1.005] transition-transform duration-200 ease-in-out"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-3">
              <FaPrescriptionBottleAlt className="text-3xl" /> Prescriptions
            </h2>
            <div className="space-y-4">
              {prescriptions.map((p) => (
                <div
                  key={p.id}
                  className="bg-green-50 rounded-xl p-4 shadow-sm border border-green-100"
                >
                  <p className="text-lg font-semibold text-gray-800">
                    {p.medicine}
                  </p>
                  <p className="text-gray-700 text-sm">
                    {p.dosage} · {p.frequency}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Prescribed by {p.doctor} · {p.date}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Doctor Notes */}
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 transform hover:scale-[1.005] transition-transform duration-200 ease-in-out"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-orange-700 mb-4 flex items-center gap-3">
              <FaUserMd className="text-3xl" /> Doctor Notes
            </h2>
            <div className="space-y-4">
              {doctorNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-orange-50 rounded-xl p-4 shadow-sm border border-orange-100"
                >
                  <p className="text-lg font-semibold text-gray-800">
                    {note.doctor}:
                  </p>
                  <p className="text-gray-700">{note.note}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Health Goals */}
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 transform hover:scale-[1.005] transition-transform duration-200 ease-in-out"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center gap-3">
              <FaBullseye className="text-3xl" /> Health Goals
            </h2>
            <ul className="list-disc pl-8 space-y-2 text-lg text-gray-700">
              {goals.map((g) => (
                <li key={g.id}>{g.goal}</li>
              ))}
            </ul>
          </motion.div>

          {/* Upload Documents */}
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 transform hover:scale-[1.005] transition-transform duration-200 ease-in-out"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-teal-700 mb-4 flex items-center gap-3">
              <FaUpload className="text-3xl" /> Upload New Documents
            </h2>
            <label htmlFor="file-upload" className="cursor-pointer bg-teal-500 text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:bg-teal-600 transition-colors duration-200 flex items-center justify-center gap-2">
                <FaUpload /> Choose File
            </label>
            <input id="file-upload" type="file" onChange={handleFileUpload} className="hidden" />
            {selectedFile && (
              <motion.p
                className="mt-4 text-md font-medium text-green-700 bg-green-100 p-3 rounded-lg flex items-center gap-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: showFileUploadSuccess ? 1 : 0, y: showFileUploadSuccess ? 0 : -10 }}
                transition={{ duration: 0.3 }}
              >
                File selected: <span className="font-bold">{selectedFile.name}</span> (Ready for upload)
              </motion.p>
            )}
            {!selectedFile && (
                <p className="mt-4 text-md text-gray-500">No file selected.</p>
            )}
          </motion.div>
        </div>
      </div>

      {/* --- Footer --- */}
      <footer className="bg-gradient-to-br from-blue-900 to-purple-900 text-white py-12 px-8 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3
              className="text-2xl font-bold font-lobster mb-4"
              style={{ fontFamily: "'Lobster', cursive" }}
            >
              Shedula
            </h3>
            <p className="text-gray-300 text-sm">
              Your all-in-one healthcare platform for booking appointments,
              consulting online, and managing health records.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Find a Doctor
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  My Appointments
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Health Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <p className="text-gray-300 text-sm flex items-center gap-2 mb-2">
              <FaMapMarkerAlt /> 123 Health Ave, Wellness City, 10001
            </p>
            <p className="text-gray-300 text-sm flex items-center gap-2 mb-2">
              <FaBriefcaseMedical /> contact@shedula.com
            </p>
            <p className="text-gray-300 text-sm flex items-center gap-2 mb-2">
              <FaCalendarAlt /> +91 98765 43210
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2025 Shedula. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}