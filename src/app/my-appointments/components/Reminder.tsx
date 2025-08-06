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
    if (typeof window !== 'undefined') {
      const storedReminder = localStorage.getItem(`reminder_${appointment.id}`);
      if (storedReminder === 'set') {
        setReminderSet(true);
      }
    }
  }, [appointment.id]);

  const handleSetReminder = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`reminder_${appointment.id}`, 'set');
      setReminderSet(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      console.log(`Reminder set for appointment with ${appointment.doctorName} on ${appointment.date} at ${appointment.time}`);
    }
  };

  const handleRemoveReminder = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`reminder_${appointment.id}`);
      setReminderSet(false);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      console.log(`Reminder removed for appointment with ${appointment.doctorName}`);
    }
  };

  const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
  const isPastAppointment = appointmentDateTime < new Date();
  const isUpcoming = !isPastAppointment && appointment.status !== 'Cancelled';

  if (!isUpcoming) {
    return null;
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
              <span className="flex items-center justify-center gap-2">
                <FaCheckCircle /> Reminder Set Successfully!
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <FaTimesCircle /> Reminder Removed!
              </span>
            )}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Reminder;