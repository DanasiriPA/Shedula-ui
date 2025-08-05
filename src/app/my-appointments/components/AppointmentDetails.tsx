import Image from 'next/image';
import {
  FaCalendarAlt,
  FaClock,
  FaStethoscope,
  FaNotesMedical,
  FaUserCircle,
  FaCreditCard,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import { Appointment } from '@/types';

interface AppointmentDetailsProps {
  appointment: Appointment;
}

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({ appointment }) => {
  const isUpcoming =
    appointment.status === 'Pending' ||
    appointment.status === 'Accepted' ||
    appointment.status === 'Rescheduled';

  const isCancelled = appointment.status === 'Cancelled';
  const isCompleted = appointment.status === 'Completed';

  return (
    <div className="flex flex-col items-center lg:items-start text-center lg:text-left p-4">
      <div className="relative w-40 h-40 mb-6 rounded-full border-4 border-blue-300 shadow-lg overflow-hidden">
        <Image
          src={appointment.doctorAvatar}
          alt={appointment.doctorName}
          layout="fill"
          objectFit="contain"
          className="rounded-full"
        />
      </div>

      <h2 className="text-4xl font-bold text-gray-900 mb-2">{appointment.doctorName}</h2>
      <p className="text-xl text-blue-600 font-semibold mb-2">{appointment.doctorSpecialization}</p>

      <div className="flex flex-col gap-3 text-lg text-gray-700 w-full lg:w-auto mt-4">
        <p className="flex items-center gap-3">
          <FaCalendarAlt className="text-blue-600" />
          Date: {new Date(appointment.date).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>

        <p className="flex items-center gap-3">
          <FaClock className="text-blue-600" />
          Time: {appointment.time}
        </p>

        <p className="flex items-center gap-3">
          <FaStethoscope className="text-blue-600" />
          Type: {appointment.type}
        </p>

        <p className="flex items-center gap-3">
          <FaNotesMedical className="text-purple-600" />
          Token: <span className="font-bold">{appointment.token}</span>
        </p>

        <p className="flex items-center gap-3">
          <FaUserCircle className="text-blue-600" />
          Patient: {appointment.patientName} ({appointment.patientAge} yrs)
        </p>

        <p className="flex items-center gap-3">
          <FaCreditCard className="text-blue-600" />
          Payment: {appointment.paymentMethod === 'online' ? 'Online Paid' : 'Cash on Visit'}
        </p>

        <p
          className={`font-semibold text-lg flex items-center gap-2 ${
            isUpcoming ? 'text-green-600' :
            isCancelled ? 'text-red-600' :
            isCompleted ? 'text-gray-600' :
            'text-yellow-600'
          }`}
        >
          Status:
          {(isUpcoming || isCompleted) && <FaCheckCircle />}
          {isCancelled && <FaTimesCircle />}
          {appointment.status}
        </p>
      </div>
    </div>
  );
};

export default AppointmentDetails;