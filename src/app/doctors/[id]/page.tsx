"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaStar, FaBriefcaseMedical, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaRupeeSign,
    FaChevronLeft, FaCreditCard, FaUserCircle, FaStethoscope, FaCapsules, FaNotesMedical,
    FaTimes, FaCheckCircle, FaLaptopMedical
} from 'react-icons/fa';

import mockDoctors, { Doctor, Slot } from '@/lib/mockDoctors';

// Helper function to format date
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export default function DoctorDetailPage() {
    const params = useParams();
    const router = useRouter();

    const doctorId = useMemo(() => {
        if (!params || !params.id) return null;
        return Array.isArray(params.id) ? params.id[0] : params.id;
    }, [params.id]);

    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [patientName, setPatientName] = useState<string>('');
    const [patientAge, setPatientAge] = useState<string>('');
    const [consultationType, setConsultationType] = useState<'online' | 'clinic' | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online' | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [appointmentDetails, setAppointmentDetails] = useState<any>(null);

    const emojiMap: Record<string, string> = {
        Gyno: "👩‍⚕️", Neuro: "🧠", Skin: "🧴", Heart: "❤️", "Child Specialist": "🧒", General: "🩺", Ortho: "🦴", Dental: "🦷", Psychiatry: "🧘", Oncology: "🎗️"
    };

    useEffect(() => {
        if (doctorId) {
            const foundDoctor = mockDoctors.find(d => d.id === doctorId);
            setDoctor(foundDoctor || null);
        } else {
            setDoctor(null);
        }
    }, [doctorId]);

    const availableDates = useMemo(() => {
        if (!doctor || !consultationType) return [];
        return Object.keys(doctor.availableSlots[consultationType]);
    }, [doctor, consultationType]);

    const availableTimes = useMemo(() => {
        if (!doctor || !consultationType || !selectedDate) return [];
        return doctor.availableSlots[consultationType][selectedDate]?.filter(slot => slot.available) || [];
    }, [doctor, consultationType, selectedDate]);

    useEffect(() => {
        setSelectedDate('');
        setSelectedTime('');
    }, [consultationType]);

    const generateTokenNumber = () => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
        const randomNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${randomLetter}-${randomNumber}`;
    };

    const calculateTimeRemaining = (appointmentDate: string, appointmentTime: string) => {
        const [hours, minutes] = appointmentTime.split(':').map(Number);
        const appointmentDateTime = new Date(appointmentDate);
        appointmentDateTime.setHours(hours, minutes, 0, 0);

        const now = new Date();
        const diffMs = appointmentDateTime.getTime() - now.getTime();

        if (diffMs <= 0) return 'Appointment time has passed';

        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${diffDays}d ${diffHours}h ${diffMinutes}m remaining`;
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsBooking(true);
        setBookingError(null);

        if (!doctor || !selectedDate || !selectedTime || !patientName || !patientAge || !consultationType || !paymentMethod) {
            setBookingError('Please fill out all required fields.');
            setIsBooking(false);
            return;
        }

        try {
            const token = generateTokenNumber();
            const consultationFee = consultationType === 'online' ? doctor.onlinePrice : doctor.clinicPrice;

            const newAppointment = {
                id: Math.random().toString(),
                doctorId: doctor.id,
                doctorName: doctor.name,
                doctorSpecialization: doctor.specialization,
                doctorAvatar: doctor.avatar,
                date: selectedDate,
                time: selectedTime,
                type: consultationType === 'online' ? 'Online Consultation' : 'Clinic Visit',
                token,
                patientName,
                patientAge,
                paymentMethod,
                status: 'upcoming',
                consultationFee,
                location: doctor.location // Adding location to the appointment details
            };

            if (typeof window !== 'undefined') {
                const existingAppointmentsStr = localStorage.getItem('appointments');
                const existingAppointments = existingAppointmentsStr ? JSON.parse(existingAppointmentsStr) : [];
                localStorage.setItem('appointments', JSON.stringify([...existingAppointments, newAppointment]));
            }

            setAppointmentDetails(newAppointment);
            setShowConfirmation(true);
        } catch (error) {
            console.error("Booking failed:", error);
            setBookingError('An error occurred during booking. Please try again.');
        } finally {
            setIsBooking(false);
        }
    };

    if (!doctorId || !doctor) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-200">
                <p className="text-xl text-gray-700">Doctor not found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-200 text-gray-900 font-inter relative overflow-x-hidden">
            <style jsx global>{`
                .bg-medical-pattern {
                    background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2393c5fd' fill-opacity='0.4'%3E%3Cpath d='M20 40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0-20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm40-40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2z'/%3E%3Cpath d='M42 20h-4v-4h-4v4h-4v4h4v4h4v-4h4v-4zm0 40h-4v-4h-4v4h-4v4h4v4h4v-4h4v-4z'/%3E%3C/g%3E%3C/svg%3E");
                    background-size: 80px 80px;
                    opacity: 0.5;
                }
            `}</style>

            <div className="absolute inset-0 z-0 bg-white bg-medical-pattern"></div>

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
                        onClick={() => router.push("/doctors")}
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
                    <motion.a href="/dashboard#reviews" whileHover={{ y: -3, color: "#4F46E5" }} className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                        <FaStar className="text-blue-600" /> Reviews
                    </motion.a>
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

            <div className="relative z-10 pt-28 px-8 pb-16">
                <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors p-3 rounded-xl bg-blue-100 font-semibold"
                    >
                        <FaChevronLeft /> Back to Doctors
                    </button>
                </div>
                <motion.div
                    className="bg-white p-8 mt-8 rounded-3xl shadow-xl border-2 border-transparent bg-origin-border bg-clip-border bg-gradient-to-br from-blue-200 via-white to-purple-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Column: Doctor Details */}
                        <div className="lg:w-1/2 space-y-6">
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-blue-200 shadow-lg">
                                    <Image
                                        src={doctor.avatar}
                                        alt={doctor.name}
                                        width={144}
                                        height={144}
                                        className="rounded-full object-cover"
                                    />
                                </div>
                                <div className="flex-grow text-center md:text-left">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-1">{doctor.name}</h2>
                                    <p className="text-xl text-blue-600 font-medium mb-2">
                                        {emojiMap[doctor.specialization]} {doctor.specialization}
                                    </p>
                                    <div className="flex items-center justify-center md:justify-start gap-4 text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <FaStar className="text-yellow-400" /> {doctor.rating}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FaBriefcaseMedical /> {doctor.experience} years
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600">{doctor.description}</p>
                            <div className="bg-blue-50 p-6 rounded-xl">
                                <h3 className="text-xl font-bold mb-4 text-blue-800 flex items-center gap-2">
                                    <FaMapMarkerAlt /> Location
                                </h3>
                                <p className="text-gray-700">{doctor.location}</p>
                            </div>
                            <div className="bg-purple-50 p-6 rounded-xl">
                                <h3 className="text-xl font-bold mb-4 text-purple-800 flex items-center gap-2">
                                    <FaRupeeSign /> Consultation Fee
                                </h3>
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-gray-500 flex items-center gap-1">
                                            <FaMapMarkerAlt className="text-gray-400" /> Clinic Visit
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">₹{doctor.clinicPrice}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 flex items-center gap-1">
                                            <FaLaptopMedical className="text-gray-400" /> Online
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">₹{doctor.onlinePrice}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Booking Form */}
                        <div className="lg:w-1/2 p-8 bg-gray-50 rounded-2xl shadow-inner">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Book an Appointment</h3>
                            <form onSubmit={handleBooking} className="space-y-6">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <input
                                        type="text"
                                        placeholder="Patient Name"
                                        value={patientName}
                                        onChange={(e) => setPatientName(e.target.value)}
                                        className="w-full p-4 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Patient Age"
                                        value={patientAge}
                                        onChange={(e) => setPatientAge(e.target.value)}
                                        className="w-full p-4 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">Consultation Type:</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setConsultationType('online')}
                                            className={`p-4 rounded-xl text-lg font-medium transition-all flex items-center justify-center gap-2 ${
                                                consultationType === 'online'
                                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-800'
                                            }`}
                                        >
                                            <FaLaptopMedical /> Online
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setConsultationType('clinic')}
                                            className={`p-4 rounded-xl text-lg font-medium transition-all flex items-center justify-center gap-2 ${
                                                consultationType === 'clinic'
                                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-800'
                                            }`}
                                        >
                                            <FaMapMarkerAlt /> Clinic
                                        </button>
                                    </div>
                                </div>

                                {consultationType && (
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-700">Select Date:</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {availableDates.map(date => (
                                                <button
                                                    key={date}
                                                    type="button"
                                                    onClick={() => setSelectedDate(date)}
                                                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                                                        selectedDate === date
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                                                    }`}
                                                >
                                                    {formatDate(date)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedDate && (
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-700">Select Time:</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {availableTimes.map(slot => (
                                                <button
                                                    key={slot.time}
                                                    type="button"
                                                    onClick={() => setSelectedTime(slot.time)}
                                                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                                                        selectedTime === slot.time
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                                                    }`}
                                                >
                                                    {slot.time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">Payment Method:</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('online')}
                                            className={`p-4 rounded-xl text-lg font-medium transition-all flex items-center justify-center gap-2 ${
                                                paymentMethod === 'online'
                                                    ? 'bg-green-600 text-white shadow-lg'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-800'
                                            }`}
                                        >
                                            <FaCreditCard /> Online
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('cash')}
                                            className={`p-4 rounded-xl text-lg font-medium transition-all flex items-center justify-center gap-2 ${
                                                paymentMethod === 'cash'
                                                    ? 'bg-amber-600 text-white shadow-lg'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-amber-100 hover:text-amber-800'
                                            }`}
                                        >
                                            <FaRupeeSign /> Cash
                                        </button>
                                    </div>
                                </div>

                                {bookingError && <p className="text-red-500 text-sm mt-4">{bookingError}</p>}

                                <button
                                    type="submit"
                                    className={`w-full mt-6 py-4 rounded-xl font-bold transition-all shadow-lg text-lg ${
                                        isBooking || !selectedDate || !selectedTime || !patientName || !patientAge || !consultationType || !paymentMethod
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                                    }`}
                                    disabled={isBooking || !selectedDate || !selectedTime || !patientName || !patientAge || !consultationType || !paymentMethod}
                                >
                                    {isBooking ? 'Booking...' : 'Confirm Booking'}
                                </button>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {showConfirmation && appointmentDetails && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-400 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
                        >
                            <button
                                type="button"
                                onClick={() => setShowConfirmation(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FaTimes size={24} />
                            </button>

                            <div className="flex justify-center mb-4">
                                <FaCheckCircle className="w-16 h-16 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
                                Appointment Confirmed!
                            </h3>
                            {appointmentDetails.paymentMethod === 'online' && (
                                <p className="text-center text-sm text-green-600 font-medium mb-4">
                                    Payment is done successfully.
                                </p>
                            )}

                            <div className="bg-blue-50 rounded-lg p-4 mb-6 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Token Number:</span>
                                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full font-bold">
                                        {appointmentDetails.token}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Patient:</span>
                                    <span>{appointmentDetails.patientName} ({appointmentDetails.patientAge} yrs)</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Doctor:</span>
                                    <span>Dr. {appointmentDetails.doctorName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Date & Time:</span>
                                    <span>{formatDate(appointmentDetails.date)} at {appointmentDetails.time}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Consultation Type:</span>
                                    <span>{appointmentDetails.type}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Payment Mode:</span>
                                    <span className={`capitalize ${appointmentDetails.paymentMethod === 'online' ? 'text-green-600' : 'text-amber-600'}`}>
                                        {appointmentDetails.paymentMethod}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Time Remaining:</span>
                                    <span>{calculateTimeRemaining(appointmentDetails.date, appointmentDetails.time)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setShowConfirmation(false);
                                    router.push('/my-appointments');
                                }}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-colors"
                            >
                                View My Appointments
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <footer className="bg-gradient-to-br from-blue-900 to-purple-900 text-white py-12 px-8">
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
                                <a href="/doctors" className="hover:text-white transition-colors">
                                    Find a Doctor
                                </a>
                            </li>
                            <li>
                                <a href="/my-appointments" className="hover:text-white transition-colors">
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