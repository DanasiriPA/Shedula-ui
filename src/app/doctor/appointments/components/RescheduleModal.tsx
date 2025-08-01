// src/app/doctor/appointments/components/RescheduleModal.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import { PatientAppointment, DoctorProfile } from '@/types'; // Import DoctorProfile
import { mockDoctorProfiles } from '@/lib/doctorData'; // Import mockDoctorProfiles

interface RescheduleModalProps {
  appointment: PatientAppointment;
  onClose: () => void;
  onConfirm: (newDate: string, newTime: string) => void;
}

const DoctorRescheduleModal: React.FC<RescheduleModalProps> = ({ appointment, onClose, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [availableSlots, setAvailableSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [error, setError] = useState<string>('');
  const [currentDoctor, setCurrentDoctor] = useState<DoctorProfile | null>(null);

  useEffect(() => {
    // Find the doctor associated with the current appointment
    const doctor = mockDoctorProfiles.find(d => d.id === appointment.doctorId);
    if (doctor) {
      setCurrentDoctor(doctor);
    } else {
      setError("Doctor not found for this appointment.");
    }
    // Pre-fill with current appointment date/time for convenience
    setSelectedDate(appointment.date);
    setSelectedTime(appointment.time);
  }, [appointment]);

  const fetchAvailableSlotsForDoctor = async (date: string, doctorId: string, type: 'online' | 'clinic') => {
    setLoadingSlots(true);
    setError('');
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const doctor = mockDoctorProfiles.find(d => d.id === doctorId);
    if (!doctor) {
      setError("Doctor data not available for fetching slots.");
      setLoadingSlots(false);
      return;
    }

    const slotsForDate = doctor.availableSlots[type]?.[date] || [];
    const now = new Date();
    const filteredSlots = slotsForDate.filter(slot => {
      const slotDateTime = new Date(`${date}T${slot.time}:00`);
      return slot.available && slotDateTime > now;
    });

    setAvailableSlots(filteredSlots);
    setLoadingSlots(false);
  };

  useEffect(() => {
    if (selectedDate && currentDoctor && appointment.type) {
      const consultationType = appointment.type === 'Online Consultation' ? 'online' : 'clinic';
      fetchAvailableSlotsForDoctor(selectedDate, currentDoctor.id, consultationType);
    }
  }, [selectedDate, currentDoctor, appointment.type]);

  const handleRescheduleConfirm = () => {
    if (!selectedDate || !selectedTime) {
      setError("Please select a new date and time.");
      return;
    }
    onConfirm(selectedDate, selectedTime);
  };

  // Generate next 7 days for date selection buttons
  const getNext7Days = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]); // Format as YYYY-MM-DD
    }
    return dates;
  };
  const next7Days = getNext7Days();

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
        <h3 className="text-3xl font-bold text-blue-800 mb-6">Reschedule Appointment</h3>
        <p className="text-gray-700 mb-4">Current Appointment: <strong>{appointment.doctorName}</strong> on {new Date(appointment.date).toLocaleDateString()} at {appointment.time}</p>

        <div className="space-y-6">
          <div>
            <label className="block text-blue-800 text-lg font-semibold mb-2">Select New Date</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-40 overflow-y-auto pr-2">
              {next7Days.map((dateString) => (
                <motion.button
                  key={dateString}
                  onClick={() => setSelectedDate(dateString)}
                  className={`flex-1 min-w-[80px] py-2 rounded-lg font-medium transition-colors border-2 ${
                    selectedDate === dateString
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {new Date(dateString).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </motion.button>
              ))}
            </div>
          </div>

          {selectedDate && (
            <div>
              <label className="block text-blue-800 text-lg font-semibold mb-2">Select New Time Slot</label>
              {loadingSlots ? (
                <div className="flex justify-center items-center h-20">
                  <FaSpinner className="animate-spin text-blue-500 text-3xl" />
                  <p className="ml-3 text-gray-600">Loading slots...</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-40 overflow-y-auto pr-2">
                  {availableSlots.length > 0 ? (
                    availableSlots.map((slot) => (
                      <motion.button
                        key={slot.time}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`flex-1 min-w-[80px] py-2 rounded-lg font-medium transition-colors border-2 ${
                          selectedTime === slot.time
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                        } ${!slot.available && 'opacity-50 cursor-not-allowed'}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={!slot.available}
                      >
                        {slot.time}
                      </motion.button>
                    ))
                  ) : (
                    <p className="col-span-full text-gray-500 text-center">No available slots for this date.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <motion.p
              className="text-red-600 text-center text-md font-medium mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.p>
          )}

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
              onClick={handleRescheduleConfirm}
              className="flex-1 py-3 px-4 rounded-xl font-semibold text-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!selectedDate || !selectedTime}
            >
              Confirm Reschedule
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DoctorRescheduleModal;
