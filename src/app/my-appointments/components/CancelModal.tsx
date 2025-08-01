// app/my-appointments/components/CancelModal.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { Appointment } from '@/types';

interface CancelModalProps {
  appointment: Appointment;
  onClose: () => void;
  onConfirm: () => void;
}

const CancelModal: React.FC<CancelModalProps> = ({ appointment, onClose, onConfirm }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center relative"
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
        <FaExclamationTriangle className="text-red-500 text-6xl mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-3">Confirm Cancellation</h3>
        <p className="text-gray-600 mb-6">Are you sure you want to cancel your appointment with <strong>{appointment.doctorName}</strong> on <strong>{new Date(appointment.date).toLocaleDateString()}</strong> at <strong>{appointment.time}</strong>?</p>
        
        <div className="flex gap-4">
          <motion.button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-lg bg-gray-300 text-gray-800 hover:bg-gray-400 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Keep Appointment
          </motion.button>
          <motion.button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-lg bg-red-600 text-white hover:bg-red-700 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Yes, Cancel
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CancelModal;