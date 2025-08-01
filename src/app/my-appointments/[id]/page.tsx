"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaBriefcaseMedical, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaRupeeSign, FaChevronLeft, FaCreditCard, FaUserCircle, FaStethoscope, FaCapsules, FaNotesMedical, FaUserMd } from 'react-icons/fa';
import { saveAppointment, getAppointments } from '@/lib/appointmentStorage';
import { Appointment, Doctor } from '@/types';

// The mock data and related helper functions have been removed.
// You will need to fetch doctor data from your API here based on the 'id' parameter.

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');
  const [patientAge, setPatientAge] = useState<string>('');
  const [consultationType, setConsultationType] = useState<'online' | 'clinic' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online' | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<{ doctorName: string; date: string; time: string; type: string; token: string; } | null>(null);
  const [bookingError, setBookingError] = useState<string>('');

  useEffect(() => {
    if (id && typeof id === 'string') {
      // TODO: Implement your API call here to fetch the doctor data
      // Example:
      // fetch(`/api/doctors/${id}`)
      //   .then(res => res.json())
      //   .then(data => setDoctor(data));
    }
  }, [id]);

  useEffect(() => {
    setSelectedDate('');
    setSelectedTime('');
  }, [id, consultationType]);

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
        <p className="text-xl text-gray-700">Doctor not found.</p>
        <motion.button
          onClick={() => router.push('/dashboard')}
          className="mt-4 px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Go to Dashboard
        </motion.button>
      </div>
    );
  }

  const generateToken = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleBooking = () => {
    setBookingError('');
    if (!selectedDate || !selectedTime || !patientName || !patientAge || !consultationType || !paymentMethod) {
      setBookingError("Please fill all booking details and select a payment method.");
      return;
    }

    const token = generateToken();
    const newBooking: Appointment = {
      id: `${doctor.id}-${selectedDate}-${selectedTime}-${token}`,
      doctorName: doctor.name,
      doctorSpecialization: doctor.specialization,
      doctorAvatar: doctor.avatar,
      date: selectedDate,
      time: selectedTime,
      type: consultationType === 'online' ? 'Online Consultation' : 'Clinic Visit',
      token: token,
      patientName: patientName,
      patientAge: patientAge,
      paymentMethod: paymentMethod,
      status: 'Upcoming',
    };

    saveAppointment(newBooking);

    setBookingDetails({
      doctorName: doctor.name,
      date: selectedDate,
      time: selectedTime,
      type: consultationType === 'online' ? 'Online Consultation' : 'Clinic Visit',
      token: token
    });

    if (paymentMethod === 'online') {
      setTimeout(() => {
        setShowBookingModal(true);
      }, 1000);
    } else {
      setShowBookingModal(true);
    }
  };

  const handleModalClose = () => {
    setShowBookingModal(false);
    router.push('/my-appointments');
  };

  const getNext7Days = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const next7Days = getNext7Days();

  const getAvailableTimeSlots = (date: string, type: 'online' | 'clinic') => {
    if (!doctor.availableSlots[type] || !doctor.availableSlots[type][date]) {
      return [];
    }
    const now = new Date();
    return doctor.availableSlots[type][date].filter(slot => {
      const slotDateTime = new Date(`${date}T${slot.time}:00`);
      return slot.available && slotDateTime > now;
    });
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
            onClick={() => router.push("/dashboard")}
            whileHover={{ y: -3, color: "#4F46E5" }} 
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaStethoscope className="text-blue-600" /> Doctors
          </motion.button>
          <motion.button onClick={() => router.push("/my-appointments")} whileHover={{ y: -3, color: "#4F46E5" }} className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
            <FaCalendarAlt className="text-blue-600" /> Appointments
          </motion.button>
          <motion.button onClick={() => router.push("/medicines")} whileHover={{ y: -3, color: "#4F46E5" }} className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
            <FaCapsules className="text-blue-600" /> Medicines
          </motion.button>
          <motion.button onClick={() => router.push("/records")} whileHover={{ y: -3, color: "#4F46E5" }} className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
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
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6 text-lg font-medium self-start ml-4 md:ml-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <FaChevronLeft /> Back to Doctors
        </motion.button>

        <motion.div
            className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 flex flex-col lg:flex-row gap-8 w-full max-w-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            {/* Doctor Info Section */}
            <div className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left p-4"></div>
                <div className="relative w-48 h-48 mb-6 rounded-full border-4 border-blue-300 shadow-lg overflow-hidden">
                    <Image 
                        src={doctor.avatar} 
                        alt={doctor.name} 
                        layout="fill" 
                        objectFit="cover"
                        className="rounded-full"
                    />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">{doctor.name}</h2>
                <p className="text-xl text-blue-600 font-semibold mb-2">{doctor.specialization}</p>
                <p className="text-lg text-gray-700 mb-4">{doctor.education}</p>
                
                <div className="flex items-center text-gray-600 text-lg mb-4">
                    <FaStar className="text-yellow-400 mr-2" />
                    <span>{doctor.rating} (150 Reviews)</span>
                </div>

                <div className="flex flex-col gap-3 text-lg text-gray-700 w-full lg:w-auto">
                    <p className="flex items-center gap-3"><FaBriefcaseMedical className="text-blue-600" /> {doctor.experience} years experience</p>
                    <p className="flex items-center gap-3"><FaMapMarkerAlt className="text-blue-600" /> {doctor.location}</p>
                    <p className={`font-semibold text-lg ${doctor.available ? "text-green-600" : "text-red-600"}`}>
                        Status: {doctor.available ? "Available" : "Unavailable"}
                    </p>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-md">
                    <div className="bg-blue-50 p-4 rounded-xl text-center shadow-sm">
                        <p className="text-md font-medium text-gray-700">Clinic Visit</p>
                        <p className="text-2xl font-bold text-blue-800 flex items-center justify-center mt-1"><FaRupeeSign className="text-xl" />{doctor.clinicPrice}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl text-center shadow-sm">
                        <p className="text-md font-medium text-gray-700">Online Consulting</p>
                        <p className="text-2xl font-bold text-purple-800 flex items-center justify-center mt-1"><FaRupeeSign className="text-xl" />{doctor.onlinePrice}</p>
                    </div>
                </div>

            {/* Booking Section */}
            <div className="lg:w-1/2 bg-blue-50 p-8 rounded-2xl shadow-inner border border-blue-200">
                <h3 className="text-3xl font-bold text-blue-800 mb-6 text-center">Book an Appointment</h3>

                {!doctor.available && (
                    <p className="text-red-600 text-center font-bold text-xl mb-6">This doctor is currently unavailable for bookings.</p>
                )}

                <div className="space-y-6" style={{ pointerEvents: doctor.available ? 'auto' : 'none', opacity: doctor.available ? 1 : 0.6 }}>
                    <div>
                        <label htmlFor="consultation-type" className="block text-blue-800 text-lg font-semibold mb-2">Select Consultation Type</label>
                        <div className="flex gap-4">
                            {doctor.clinicPrice && (
                                <motion.button
                                    className={`flex-1 py-3 px-4 rounded-xl font-semibold text-lg transition-all border-2 ${
                                        consultationType === 'clinic' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                                    }`}
                                    onClick={() => setConsultationType('clinic')}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={!doctor.available}
                                >
                                    Clinic Visit
                                </motion.button>
                            )}
                            {doctor.onlinePrice && (
                                <motion.button
                                    className={`flex-1 py-3 px-4 rounded-xl font-semibold text-lg transition-all border-2 ${
                                        consultationType === 'online' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                                    }`}
                                    onClick={() => setConsultationType('online')}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={!doctor.available}
                                >
                                    Online
                                </motion.button>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-blue-800 text-lg font-semibold mb-2">Select an Available Date</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-40 overflow-y-auto pr-2">
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
                                    disabled={!doctor.available}
                                >
                                    {new Date(dateString).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {selectedDate && consultationType && (
                        <div>
                            <label className="block text-blue-800 text-lg font-semibold mb-2">Select a Time Slot</label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-40 overflow-y-auto pr-2">
                                {getAvailableTimeSlots(selectedDate, consultationType).length > 0 ? (
                                    getAvailableTimeSlots(selectedDate, consultationType).map((slot) => (
                                        <motion.button
                                            key={slot.time}
                                            onClick={() => setSelectedTime(slot.time)}
                                            className={`flex-1 min-w-[80px] py-2 rounded-lg font-medium transition-colors border-2 ${
                                                selectedTime === slot.time
                                                    ? 'bg-green-600 text-white border-green-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                                            }`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            disabled={!doctor.available || !slot.available}
                                        >
                                            {slot.time}
                                        </motion.button>
                                    ))
                                ) : (
                                    <p className="col-span-full text-gray-500 text-center">No available slots for this date.</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="name" className="block text-blue-800 text-lg font-semibold mb-2">Your Name</label>
                        <input
                            type="text"
                            id="name"
                            className="w-full p-3 rounded-lg border-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-black"
                            placeholder="Full Name"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            disabled={!doctor.available}
                        />
                    </div>

                    <div>
                        <label htmlFor="age" className="block text-blue-800 text-lg font-semibold mb-2">Your Age</label>
                        <input
                            type="number"
                            id="age"
                            className="w-full p-3 rounded-lg border-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-black"
                            placeholder="Age"
                            value={patientAge}
                            onChange={(e) => setPatientAge(e.target.value)}
                            disabled={!doctor.available}
                        />
                    </div>

                    <div>
                        <p className="block text-blue-800 text-lg font-semibold mb-2">Select Payment Method</p>
                        <div className="flex gap-4">
                            <motion.button
                                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-lg transition-all border-2 ${
                                    paymentMethod === 'cash' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                                }`}
                                onClick={() => setPaymentMethod('cash')}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={!doctor.available}
                            >
                                Cash on Visit
                            </motion.button>
                            <motion.button
                                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-lg transition-all border-2 ${
                                    paymentMethod === 'online' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                                }`}
                                onClick={() => setPaymentMethod('online')}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={!doctor.available}
                            >
                                <FaCreditCard className="inline mr-2" /> Online Payment
                            </motion.button>
                        </div>
                    </div>

                    {bookingError && (
                        <motion.p
                            className="text-center text-md mt-4 font-medium text-red-600"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                        >
                            {bookingError}
                        </motion.p>
                    )}

                    <motion.button
                        onClick={handleBooking}
                        className={`w-full py-4 rounded-xl font-bold text-xl transition-all shadow-lg ${
                            doctor.available
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        whileHover={doctor.available ? { scale: 1.02 } : {}}
                        whileTap={doctor.available ? { scale: 0.98 } : {}}
                        disabled={!doctor.available}
                    >
                        Book Now
                    </motion.button>
                </div>
            </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showBookingModal && bookingDetails && (
          <motion.div
            className="fixed inset-0 bg-gray-900/75 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center relative"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <button
                onClick={handleModalClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
              <h3 className="text-3xl font-bold text-green-600 mb-4">Booking Confirmed!</h3>
              <p className="text-gray-700 text-lg mb-2">Your appointment with</p>
              <p className="text-blue-800 text-2xl font-bold mb-4">{bookingDetails.doctorName}</p>
              
              <div className="space-y-2 text-left text-gray-800 mb-6 bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="flex items-center gap-2"><FaCalendarAlt className="text-green-600" /> <strong>Date:</strong> {bookingDetails.date}</p>
                <p className="flex items-center gap-2"><FaClock className="text-green-600" /> <strong>Time:</strong> {bookingDetails.time}</p>
                <p className="flex items-center gap-2"><FaStethoscope className="text-green-600" /> <strong>Type:</strong> {bookingDetails.type}</p>
                <p className="flex items-center gap-2"><FaCreditCard className="text-green-600" /> <strong>Payment:</strong> {paymentMethod === 'online' ? 'Online Paid' : 'Cash on Visit'}</p>
                <p className="flex items-center gap-2 text-xl font-bold text-purple-700"><FaNotesMedical className="text-purple-700" /> Token: {bookingDetails.token}</p>
              </div>
              
              <motion.button
                onClick={handleModalClose}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Go to My Appointments
              </motion.button>
            </motion.div>
          </motion.div>
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