// src/app/doctor/appointments/components/UpdateModal.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaSave } from 'react-icons/fa';
import { PatientAppointment } from '@/types';

interface UpdateModalProps {
  appointment: PatientAppointment;
  onClose: () => void;
  onConfirm: (doctorNotes: string, newStatus: PatientAppointment['status']) => void;
}

const DoctorUpdateModal: React.FC<UpdateModalProps> = ({ appointment, onClose, onConfirm }) => {
  const [doctorNotes, setDoctorNotes] = useState<string>(appointment.doctorNotes || '');
  const [newStatus, setNewStatus] = useState<PatientAppointment['status']>(appointment.status);

  useEffect(() => {
    // Load fonts
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Lobster&family=Poppins:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const handleSave = () => {
    onConfirm(doctorNotes, newStatus);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full text-center relative"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          <FaTimes />
        </button>
        <h3 className="text-3xl font-bold text-purple-800 mb-6">Update Appointment Details</h3>
        <p className="text-gray-700 mb-4">Patient: <strong>{appointment.patientName}</strong> on {new Date(appointment.date).toLocaleDateString()} at {appointment.time}</p>

        <div className="space-y-6">
          <div>
            <label htmlFor="doctorNotes" className="block text-purple-800 text-lg font-semibold mb-2">Doctor's Notes</label>
            <textarea
              id="doctorNotes"
              className="w-full p-3 rounded-lg border-2 border-gray-300 focus:ring-purple-500 focus:border-purple-500 text-black h-32 resize-none"
              placeholder="Add or update notes for this appointment..."
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-purple-800 text-lg font-semibold mb-2">Update Status</label>
            <select
              id="status"
              className="w-full p-3 rounded-lg border-2 border-gray-300 focus:ring-purple-500 focus:border-purple-500 bg-white text-black"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as PatientAppointment['status'])}
            >
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rescheduled">Rescheduled</option>
            </select>
          </div>

          <div className="flex gap-4 mt-6">
            <motion.button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl font-semibold text-lg bg-gray-300 text-gray-800 hover:bg-gray-400 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handleSave}
              className="flex-1 py-3 px-4 rounded-xl font-semibold text-lg bg-purple-600 text-white hover:bg-purple-700 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaSave className="inline mr-2" /> Save Changes
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DoctorUpdateModal;
