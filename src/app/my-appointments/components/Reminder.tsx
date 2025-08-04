// app/my-appointments/components/Reminder.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Appointment } from '@/types';

interface ReminderProps {
  appointment: Appointment;
}

const Reminder: React.FC<ReminderProps> = ({ appointment }) => {
  const [reminderSet, setReminderSet] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);

  useEffect(() => {
    // In a real app, this would check if a reminder is set for this appointment
    // For this mock, we'll just simulate it.
    if (typeof window !== 'undefined') {
      const storedReminder = localStorage.getItem(`reminder_${appointment.id}`);
      if (storedReminder === 'set') {
        setReminderSet(true);
      }
    }
  }, [appointment.id]);

  const handleSetReminder = () => {
    if (typeof window !== 'undefined') {
      // In a real application, you would integrate with browser notifications API
      // or a backend service to send actual reminders (email/SMS).
      // For this frontend example, we'll just simulate a confirmation.
      localStorage.setItem(`reminder_${appointment.id}`, 'set');
      setReminderSet(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000); // Hide after 3 seconds
      console.log(`Reminder set for appointment with ${appointment.doctorName} on ${appointment.date} at ${appointment.time}`);
    }
  };

  const handleRemoveReminder = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`reminder_${appointment.id}`);
      setReminderSet(false);
      setShowNotification(true); // Show a confirmation of removal
      setTimeout(() => setShowNotification(false), 3000);
      console.log(`Reminder removed for appointment with ${appointment.doctorName}`);
    }
  };

  // Determine if the appointment is in the past
  const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
  const isPastAppointment = appointmentDateTime < new Date();

  if (isPastAppointment || appointment.status !== 'Pending') {
    return null; // Don't show reminder option for past or non-upcoming appointments
  }

  return (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h4 className="text-2xl font-bold text-blue-700 mb-4 flex items-center justify-center gap-2">
        <FaBell className="text-orange-500" /> Set Reminder
      </h4>
      
      {!reminderSet ? (
        <motion.button
          onClick={handleSetReminder}
          className="w-full py-3 px-4 rounded-xl font-semibold text-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaBell /> Set Appointment Reminder
        </motion.button>
      ) : (
        <motion.button
          onClick={handleRemoveReminder}
          className="w-full py-3 px-4 rounded-xl font-semibold text-lg bg-gray-500 text-white hover:bg-gray-600 transition-all shadow-md flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaBell /> Reminder Set (Click to remove)
        </motion.button>
      )}

      <AnimatePresence>
        {showNotification && (
          <motion.p
            className={`mt-4 text-center text-md font-medium ${reminderSet ? 'text-green-600' : 'text-red-600'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            {reminderSet ? (
                <span className="flex items-center justify-center gap-2"><FaCheckCircle /> Reminder Set Successfully!</span>
            ) : (
                <span className="flex items-center justify-center gap-2"><FaTimesCircle /> Reminder Removed!</span>
            )}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Reminder;