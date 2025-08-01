// src/app/doctor/appointments/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaBriefcaseMedical } from "react-icons/fa";

import { FaCalendarAlt, FaClock, FaUserMd, FaStethoscope, FaNotesMedical, FaTimes, FaCheckCircle, FaExclamationCircle, FaUserCircle, FaCapsules, FaChevronLeft } from 'react-icons/fa';
import DoctorRescheduleModal from "./components/RescheduleModal";
import DoctorUpdateModal from "./components/UpdateModal"; // Assuming you have an UpdateModal
import { PatientAppointment, getAppointments, updateAppointment, deleteAppointment } from '@/types'; // Import functions from types

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  // State to hold appointments, initialized from localStorage
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<PatientAppointment | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'cancelled' | 'rescheduled'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Function to load appointments from localStorage
  const loadAppointments = useCallback(() => {
    const stored = getAppointments();
    setAppointments(stored);
  }, []);

  useEffect(() => {
    // Load appointments when the component mounts
    loadAppointments();

    // Load fonts
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Lobster&family=Poppins:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, [loadAppointments]);

  const handleReschedule = (appointment: PatientAppointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const handleUpdate = (appointment: PatientAppointment) => {
    setSelectedAppointment(appointment);
    setShowUpdateModal(true);
  };

  const handleConfirmReschedule = (newDate: string, newTime: string) => {
    if (selectedAppointment) {
      const updatedApp: PatientAppointment = {
        ...selectedAppointment,
        date: newDate,
        time: newTime,
        status: 'Rescheduled', // Set status to Rescheduled
        doctorNotes: selectedAppointment.doctorNotes ? selectedAppointment.doctorNotes + ` (Rescheduled to ${newDate} at ${newTime})` : `Rescheduled to ${newDate} at ${newTime}`,
      };
      updateAppointment(updatedApp);
      loadAppointments(); // Reload appointments to reflect changes
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
    }
  };

  const handleConfirmUpdate = (updatedNotes: string, newStatus: PatientAppointment['status']) => {
    if (selectedAppointment) {
      const updatedApp: PatientAppointment = {
        ...selectedAppointment,
        doctorNotes: updatedNotes,
        status: newStatus,
      };
      updateAppointment(updatedApp);
      loadAppointments(); // Reload appointments to reflect changes
      setShowUpdateModal(false);
      setSelectedAppointment(null);
    }
  };

  const handleDelete = (appointmentId: string) => {
    // In a real app, you might ask for confirmation here
    deleteAppointment(appointmentId);
    loadAppointments(); // Reload appointments to reflect changes
  };

  const filteredAppointments = appointments.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status.toLowerCase() === filterStatus;
    const matchesSearch = searchTerm === '' ||
      app.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.token.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }).sort((a, b) => {
    // Sort by date and time for consistent display
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  const getStatusColor = (status: PatientAppointment['status']) => {
    switch (status) {
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      case 'Accepted': return 'text-green-600 bg-green-100';
      case 'Completed': return 'text-blue-600 bg-blue-100';
      case 'Cancelled': return 'text-red-600 bg-red-100';
      case 'Rescheduled': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: PatientAppointment['status']) => {
    switch (status) {
      case 'Pending': return <FaExclamationCircle className="inline mr-1" />;
      case 'Accepted': return <FaCheckCircle className="inline mr-1" />;
      case 'Completed': return <FaCheckCircle className="inline mr-1" />;
      case 'Cancelled': return <FaTimes className="inline mr-1" />;
      case 'Rescheduled': return <FaCalendarAlt className="inline mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-inter relative overflow-x-hidden">
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
          <Image src="https://i.postimg.cc/SKnMMNcw/360-F-863843181-63-Nv8tgy-BU8-X26-B1-Lq-Qvfi0tn95aj-Sg-X.jpg" alt="Shedula Logo" width={45} height={45} className="rounded-full shadow-md" />
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
            onClick={() => router.push("/doctor/dashboard")}
            whileHover={{ y: -3, color: "#4F46E5" }} 
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaStethoscope className="text-blue-600" /> Dashboard
          </motion.button>
          <motion.button onClick={() => router.push("/doctor/appointments")} whileHover={{ y: -3, color: "#4F46E5" }} className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
            <FaCalendarAlt className="text-blue-600" /> Appointments
          </motion.button>
          <motion.button onClick={() => router.push("/doctor/patients")} whileHover={{ y: -3, color: "#4F46E5" }} className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
            <FaUserMd className="text-blue-600" /> Patients
          </motion.button>
          <motion.button onClick={() => router.push("/doctor/profile")} whileHover={{ y: -3, color: "#4F46E5" }} className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
            <FaUserCircle className="text-blue-600" /> Profile
          </motion.button>
        </div>
        <motion.button
          onClick={() => router.push("/doctor/login")} // Assuming a doctor login page
          className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors shadow-md"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaUserCircle className="text-2xl" />
        </motion.button>
      </motion.div>

      <div className="relative z-10 pt-28 px-8 pb-16 w-full min-h-screen flex flex-col items-center">
        <motion.button
            onClick={() => router.push('/doctor/dashboard')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6 text-lg font-medium self-start ml-4 md:ml-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <FaChevronLeft /> Back to Dashboard
        </motion.button>

        <motion.div
          className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 w-full max-w-7xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-4xl font-bold text-blue-800 mb-8 text-center">Your Appointments</h2>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by patient name, reason, or token..."
              className="flex-1 p-3 rounded-lg border-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="p-3 rounded-lg border-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="text-center py-10 text-gray-600 text-xl">
              No appointments found for the selected filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAppointments.map((appointment) => (
                <motion.div
                  key={appointment.id}
                  className="bg-blue-50 p-6 rounded-2xl shadow-md border border-blue-200 flex flex-col justify-between"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ translateY: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                >
                  <div>
                    <div className="flex items-center mb-4">
                      <Image
                        src={appointment.doctorAvatar} // Using doctorAvatar from PatientAppointment
                        alt={appointment.patientName}
                        width={60}
                        height={60}
                        className="rounded-full border-2 border-blue-400 mr-4"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-blue-800">{appointment.patientName}</h3>
                        <p className="text-sm text-gray-600">Patient ID: {appointment.patientId}</p>
                      </div>
                    </div>
                    <p className="text-lg text-gray-700 mb-2 flex items-center"><FaCalendarAlt className="mr-2 text-blue-600" /> {new Date(appointment.date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    <p className="text-lg text-gray-700 mb-2 flex items-center"><FaClock className="mr-2 text-blue-600" /> {appointment.time}</p>
                    <p className="text-lg text-gray-700 mb-2 flex items-center"><FaStethoscope className="mr-2 text-blue-600" /> {appointment.type}</p>
                    <p className="text-lg text-gray-700 mb-2 flex items-center"><FaNotesMedical className="mr-2 text-blue-600" /> Reason: {appointment.reason}</p>
                    {appointment.doctorNotes && (
                      <p className="text-sm text-gray-600 mb-2 flex items-start"><FaNotesMedical className="mr-2 text-blue-600 mt-1" /> Doctor Notes: {appointment.doctorNotes}</p>
                    )}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mt-3 ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)} {appointment.status}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col space-y-2">
                    <motion.button
                      onClick={() => handleUpdate(appointment)}
                      className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Update
                    </motion.button>
                    <motion.button
                      onClick={() => handleReschedule(appointment)}
                      className="w-full py-2 px-4 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors shadow-md"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Reschedule
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(appointment.id)}
                      className="w-full py-2 px-4 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-md"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {showRescheduleModal && selectedAppointment && (
          <DoctorRescheduleModal
            appointment={selectedAppointment}
            onClose={() => setShowRescheduleModal(false)}
            onConfirm={handleConfirmReschedule}
          />
        )}
      </AnimatePresence>

      {/* Update Modal */}
      <AnimatePresence>
        {showUpdateModal && selectedAppointment && (
          <DoctorUpdateModal
            appointment={selectedAppointment}
            onClose={() => setShowUpdateModal(false)}
            onConfirm={handleConfirmUpdate}
          />
        )}
      </AnimatePresence>

      {/* --- Footer --- */}
      <footer className="bg-gradient-to-br from-blue-900 to-purple-900 text-white py-12 px-8 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold font-lobster mb-4" style={{ fontFamily: "'Lobster', cursive" }}>Shedula</h3>
            <p className="text-gray-300 text-sm">Your all-in-one healthcare platform for booking appointments, consulting online, and managing health records.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Find a Doctor</a></li>
              <li><a href="#" className="hover:text-white transition-colors">My Appointments</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Health Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <p className="text-gray-300 text-sm flex items-center gap-2 mb-2"><FaMapMarkerAlt /> 123 Health Ave, Wellness City, 10001</p>
            <p className="text-gray-300 text-sm flex items-center gap-2 mb-2"><FaBriefcaseMedical /> contact@shedula.com</p>
            <p className="text-gray-300 text-sm flex items-center gap-2 mb-2"><FaCalendarAlt /> +91 98765 43210</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2025 Shedula. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
