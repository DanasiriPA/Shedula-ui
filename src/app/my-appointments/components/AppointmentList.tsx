// app/my-appointments/components/AppointmentList.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaStethoscope, FaNotesMedical, FaRegSadTear } from 'react-icons/fa';
import { Appointment } from '@/types';

interface AppointmentListProps {
  appointments: Appointment[];
}

const AppointmentList: React.FC<AppointmentListProps> = ({ appointments }) => {
  if (appointments.length === 0) {
    return (
      <motion.div
        className="text-center py-10 text-gray-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FaRegSadTear className="text-6xl mx-auto mb-4 text-blue-400" />
        <p className="text-xl font-medium">No upcoming appointments found.</p>
        <p className="text-md mt-2">Book an appointment from the Doctors section!</p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {appointments.map((appointment) => (
        <motion.div
          key={appointment.id}
          className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 * appointments.indexOf(appointment) }}
          whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
        >
          <div className="relative w-24 h-24 mb-4 rounded-full border-2 border-blue-300 overflow-hidden">
            <Image 
              src={appointment.doctorAvatar} 
              alt={appointment.doctorName} 
              layout="fill" 
              objectFit="cover" 
              className="rounded-full"
            />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{appointment.doctorName}</h3>
          <p className="text-md text-blue-600 font-medium mb-3">{appointment.doctorSpecialization}</p>

          <div className="text-gray-700 text-base space-y-2 mb-4 w-full">
            <p className="flex items-center justify-center gap-2"><FaCalendarAlt className="text-blue-500" /> {new Date(appointment.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            <p className="flex items-center justify-center gap-2"><FaClock className="text-blue-500" /> {appointment.time}</p>
            <p className="flex items-center justify-center gap-2"><FaStethoscope className="text-blue-500" /> {appointment.type}</p>
            <p className="flex items-center justify-center gap-2 text-sm text-purple-600"><FaNotesMedical /> Token: <span className="font-semibold">{appointment.token}</span></p>
          </div>

          <Link href={`/my-appointments/${appointment.id}`} passHref>
            <motion.button
              className="mt-4 w-full py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Details
            </motion.button>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default AppointmentList;