"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { 
  FaCalendarCheck, FaClock, FaCalendarTimes, FaTimes, FaChevronLeft, 
  FaUserCircle, FaStethoscope, FaCapsules, FaNotesMedical, FaStar, FaBriefcaseMedical,
  FaMapMarkerAlt, FaRupeeSign, FaEdit, FaTrash, FaLaptopMedical, FaCalendarAlt
} from 'react-icons/fa';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface Appointment {
    id: string;
    doctorId: string;
    doctorName: string;
    doctorSpecialization: string;
    doctorAvatar: string;
    date: string;
    time: string;
    type: string;
    token: string;
    patientName: string;
    patientAge: string;
    patientId: string;
    status: 'upcoming' | 'completed' | 'canceled' | 'rescheduled' | 'booked' | 'confirmed';
    consultationFee: number;
    location: string;
    createdAt: string;
    paymentMethod: string;
    timeRemaining?: string;
}

export default function MyAppointmentsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'canceled' | 'rescheduled'>('upcoming');
    const [reschedulingId, setReschedulingId] = useState<string | null>(null);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const router = useRouter();

    // Handle different date formats from Firebase
    const normalizeDate = (date: string | Timestamp | Date): Date => {
    if (date instanceof Timestamp) return date.toDate();
    if (typeof date === 'string') return new Date(date);
    return date; // Already a Date
    };

    const formatDate = (dateInput: string | Timestamp): string => {
    const date = normalizeDate(dateInput);
    const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString(undefined, options);
    };

    const calculateTimeRemaining = useCallback((date: string | Timestamp, time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const appointmentDate = normalizeDate(date);
    appointmentDate.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const diffMs = appointmentDate.getTime() - now.getTime();

    if (diffMs <= 0) return 'Appointment completed';

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} remaining`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} remaining`;
    return 'Less than an hour remaining';
}, []);

    const generateNext7Days = (): string[] => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    };

    const fetchAppointments = useCallback(async (uid: string) => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "appointments"),
                where("patientId", "==", uid)
            );
            const querySnapshot = await getDocs(q);

            const allAppointments: Appointment[] = [];
            const now = new Date();
            const updatePromises: Promise<void>[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                
                // Skip if essential fields are missing
                if (!data.doctorName || !data.date || !data.time || !data.status || !data.patientId) {
                    console.warn('Skipping incomplete appointment:', doc.id);
                    return;
                }

                // Normalize status
                let status = data.status;
                if (['booked', 'confirmed'].includes(data.status)) {
                    status = 'upcoming';
                }

                // Convert date to string format if it's a Timestamp
                const dateStr = normalizeDate(data.date).toISOString().split('T')[0];

                // Check if appointment is completed
                const appointmentDateTime = new Date(`${dateStr}T${data.time}`);
                const isCompleted = appointmentDateTime < now && 
                    (status === 'upcoming' || status === 'rescheduled');

                if (isCompleted) {
                    updatePromises.push(
                        updateDoc(doc.ref, { 
                            status: 'completed',
                            timeRemaining: 'Appointment completed'
                        })
                    );
                }

                const appointment: Appointment = {
                    id: doc.id,
                    doctorId: data.doctorId || '',
                    doctorName: data.doctorName,
                    doctorSpecialization: data.doctorSpecialization || 'General Practitioner',
                    doctorAvatar: data.doctorAvatar || '/default-avatar.png',
                    date: dateStr,
                    time: data.time,
                    type: data.type || 'Clinic Visit',
                    token: data.token || '',
                    patientName: data.patientName || '',
                    patientAge: data.patientAge || '',
                    patientId: data.patientId,
                    status: isCompleted ? 'completed' : status,
                    consultationFee: data.consultationFee || 0,
                    location: data.location || '',
                    createdAt: data.createdAt || new Date().toISOString(),
                    paymentMethod: data.paymentMethod || 'unknown',
                    timeRemaining: isCompleted 
                        ? 'Appointment completed'
                        : calculateTimeRemaining(dateStr, data.time)
                };

                allAppointments.push(appointment);
            });

            if (updatePromises.length > 0) {
                await Promise.all(updatePromises);
            }

            setAppointments(allAppointments);
            console.log('Fetched appointments:', allAppointments);

        } catch (error) {
            console.error("Error fetching appointments:", error);
        } finally {
            setLoading(false);
        }
    }, [calculateTimeRemaining]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchAppointments(currentUser.uid);
            } else {
                setUser(null);
                setLoading(false);
                router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [router, fetchAppointments]);

    useEffect(() => {
        setAvailableDates(generateNext7Days());
    }, []);

    const handleReschedule = async (appointmentId: string) => {
        if (!newDate || !newTime) return;

        try {
            const appointmentRef = doc(db, "appointments", appointmentId);
            await updateDoc(appointmentRef, {
                date: newDate,
                time: newTime,
                status: 'rescheduled',
                timeRemaining: calculateTimeRemaining(newDate, newTime)
            });
            
            if (user) {
                await fetchAppointments(user.uid);
            }
            setReschedulingId(null);
            setNewDate('');
            setNewTime('');
        } catch (error) {
            console.error("Error rescheduling appointment:", error);
        }
    };

    const handleCancel = async (appointmentId: string) => {
        try {
            const appointmentRef = doc(db, "appointments", appointmentId);
            await updateDoc(appointmentRef, {
                status: 'canceled'
            });
            
            if (user) {
                await fetchAppointments(user.uid);
            }
            setShowCancelConfirm(null);
        } catch (error) {
            console.error("Error canceling appointment:", error);
        }
    };

    // Categorize appointments
    const upcomingAppointments = appointments.filter(app => {
        const appDateTime = new Date(`${app.date}T${app.time}`);
        return (app.status === 'upcoming' || app.status === 'rescheduled') && 
               appDateTime >= new Date();
    });
    
    const pastAppointments = appointments.filter(app => {
        const appDateTime = new Date(`${app.date}T${app.time}`);
        return app.status === 'completed' || 
               (appDateTime < new Date() && app.status !== 'canceled');
    });
    
    const canceledAppointments = appointments.filter(app => app.status === 'canceled');
    const rescheduledAppointments = appointments.filter(app => app.status === 'rescheduled');

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-200">
                <p className="text-xl text-gray-700">Loading appointments...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const renderAppointmentCard = (app: Appointment, isPast = false) => {
        const availableTimes = [
            '09:00', '10:00', '11:00', '12:00', '13:00',
            '14:00', '15:00', '16:00', '17:00', '18:00'
        ].map(time => ({ time, available: true }));

        return (
            <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`bg-white p-6 rounded-2xl shadow-xl border-2 border-transparent bg-origin-border bg-clip-border bg-gradient-to-br from-blue-50 via-white to-purple-50 ${isPast ? 'opacity-80' : ''}`}
            >
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                        <Image 
                            src={app.doctorAvatar} 
                            alt={app.doctorName} 
                            width={100} 
                            height={100} 
                            className="rounded-full border-4 border-blue-200 shadow-md" 
                        />
                    </div>
                    <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Dr. {app.doctorName}</h3>
                                <p className="text-blue-600 font-medium text-lg">{app.doctorSpecialization}</p>
                                <div className="mt-4 space-y-2">
                                    <p className="flex items-center gap-2 text-gray-700">
                                        <FaCalendarCheck className="text-blue-500" /> 
                                        {formatDate(app.date)} at {app.time}
                                    </p>
                                    <p className="flex items-center gap-2 text-gray-700">
                                        {app.type === 'Online Consultation' ? 
                                            <FaLaptopMedical className="text-purple-500" /> : 
                                            <FaMapMarkerAlt className="text-purple-500" />}
                                        {app.type} ({app.paymentMethod})
                                    </p>
                                    <p className="flex items-center gap-2 text-gray-700">
                                        <FaUserCircle className="text-blue-500" /> 
                                        {app.patientName} ({app.patientAge} yrs)
                                    </p>
                                    {app.timeRemaining && (
                                        <p className="flex items-center gap-2 text-gray-700">
                                            <FaClock className={
                                                app.timeRemaining === 'Appointment completed' 
                                                    ? "text-gray-500" 
                                                    : "text-green-500"
                                            } /> 
                                            {app.timeRemaining}
                                        </p>
                                    )}
                                    <p className="flex items-center gap-2 text-gray-700">
                                        <FaRupeeSign className="text-amber-500" /> 
                                        ₹{app.consultationFee}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                    app.status === 'upcoming' ? 'bg-green-100 text-green-800' :
                                    app.status === 'canceled' ? 'bg-red-100 text-red-800' :
                                    app.status === 'rescheduled' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                }`}>
                                    {app.status.toUpperCase()}
                                </span>
                                {app.status === 'upcoming' && (
                                    <div className="flex gap-2 mt-2">
                                        <button 
                                            onClick={() => setReschedulingId(app.id)}
                                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button 
                                            onClick={() => setShowCancelConfirm(app.id)}
                                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {reschedulingId === app.id && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-bold text-blue-800 mb-2">Reschedule Appointment</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                            {availableDates.map(date => (
                                                <button
                                                    key={date}
                                                    type="button"
                                                    onClick={() => setNewDate(date)}
                                                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                                                        newDate === date
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                                                    }`}
                                                >
                                                    {formatDate(date)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {newDate && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {availableTimes.map(slot => (
                                                    <button
                                                        key={slot.time}
                                                        type="button"
                                                        onClick={() => setNewTime(slot.time)}
                                                        className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                                                            newTime === slot.time
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

                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => handleReschedule(app.id)}
                                            disabled={!newDate || !newTime}
                                            className={`px-4 py-2 rounded-md text-white ${
                                                !newDate || !newTime ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                        >
                                            Confirm Reschedule
                                        </button>
                                        <button
                                            onClick={() => {
                                                setReschedulingId(null);
                                                setNewDate('');
                                                setNewTime('');
                                            }}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-200 text-gray-900 font-inter relative overflow-x-hidden">
            <style jsx global>{`
                .bg-medical-pattern {
                    background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2393c5fd' fill-opacity='0.4'%3E%3Cpath d='M20 40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0-20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm40-40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2z'/%3E%3Cpath d='M42 20h-4v-4h-4v4h-4v4h4v4h4v-4h4v-4z'/%3E%3C/g%3E%3C/svg%3E");
                    background-size: 80px 80px;
                    opacity: 0.5;
                }
            `}</style>

            <div className="absolute inset-0 z-0 bg-white bg-medical-pattern"></div>

            {/* Header/Navbar */}
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
                    <motion.button 
                        onClick={() => router.push("/my-appointments")} 
                        whileHover={{ y: -3, color: "#4F46E5" }} 
                        className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 bg-blue-50 text-blue-700"
                    >
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
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors p-3 rounded-xl bg-blue-100 font-semibold"
                    >
                        <FaChevronLeft /> Back
                    </button>
                    
                    <div className="flex gap-4 bg-white p-2 rounded-xl shadow-md">
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`px-6 py-2 rounded-lg transition-colors ${
                                activeTab === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Upcoming
                        </button>
                        <button
                            onClick={() => setActiveTab('past')}
                            className={`px-6 py-2 rounded-lg transition-colors ${
                                activeTab === 'past' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Past
                        </button>
                        <button
                            onClick={() => setActiveTab('canceled')}
                            className={`px-6 py-2 rounded-lg transition-colors ${
                                activeTab === 'canceled' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Canceled
                        </button>
                        <button
                            onClick={() => setActiveTab('rescheduled')}
                            className={`px-6 py-2 rounded-lg transition-colors ${
                                activeTab === 'rescheduled' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Rescheduled
                        </button>
                    </div>
                </div>

                <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    My Appointments
                </h1>

                {activeTab === 'upcoming' && (
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-3">
                            <FaCalendarCheck /> Upcoming Appointments
                        </h2>
                        {upcomingAppointments.length > 0 ? (
                            upcomingAppointments.map(app => renderAppointmentCard(app))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white p-8 text-center rounded-2xl shadow-xl border-2 border-transparent bg-origin-border bg-clip-border bg-gradient-to-br from-blue-50 via-white to-purple-50"
                            >
                                <FaCalendarTimes className="text-gray-400 mx-auto mb-4" size={50} />
                                <p className="text-xl text-gray-600">You have no upcoming appointments scheduled.</p>
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                                >
                                    Book an Appointment
                                </button>
                            </motion.div>
                        )}
                    </section>
                )}

                {activeTab === 'past' && (
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-purple-800 mb-6 flex items-center gap-3">
                            <FaCalendarTimes /> Past Appointments
                        </h2>
                        {pastAppointments.length > 0 ? (
                            pastAppointments.map(app => renderAppointmentCard(app, true))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white p-8 text-center rounded-2xl shadow-xl border-2 border-transparent bg-origin-border bg-clip-border bg-gradient-to-br from-blue-50 via-white to-purple-50"
                            >
                                <FaCalendarTimes className="text-gray-400 mx-auto mb-4" size={50} />
                                <p className="text-xl text-gray-600">You have no past appointments on record.</p>
                            </motion.div>
                        )}
                    </section>
                )}

                {activeTab === 'canceled' && (
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-red-800 mb-6 flex items-center gap-3">
                            <FaTimes /> Canceled Appointments
                        </h2>
                        {canceledAppointments.length > 0 ? (
                            canceledAppointments.map(app => renderAppointmentCard(app, true))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white p-8 text-center rounded-2xl shadow-xl border-2 border-transparent bg-origin-border bg-clip-border bg-gradient-to-br from-blue-50 via-white to-purple-50"
                            >
                                <FaCalendarTimes className="text-gray-400 mx-auto mb-4" size={50} />
                                <p className="text-xl text-gray-600">You have no canceled appointments.</p>
                            </motion.div>
                        )}
                    </section>
                )}

                {activeTab === 'rescheduled' && (
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-yellow-800 mb-6 flex items-center gap-3">
                            <FaCalendarCheck /> Rescheduled Appointments
                        </h2>
                        {rescheduledAppointments.length > 0 ? (
                            rescheduledAppointments.map(app => renderAppointmentCard(app))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white p-8 text-center rounded-2xl shadow-xl border-2 border-transparent bg-origin-border bg-clip-border bg-gradient-to-br from-blue-50 via-white to-purple-50"
                            >
                                <FaCalendarTimes className="text-gray-400 mx-auto mb-4" size={50} />
                                <p className="text-xl text-gray-600">You have no rescheduled appointments.</p>
                            </motion.div>
                        )}
                    </section>
                )}
            </div>

            {/* Cancel Confirmation Modal */}
            <AnimatePresence>
                {showCancelConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-400 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
                        onClick={() => setShowCancelConfirm(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={() => setShowCancelConfirm(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FaTimes size={24} />
                            </button>

                            <div className="flex justify-center mb-4">
                                <FaTimes className="w-16 h-16 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
                                Cancel Appointment?
                            </h3>
                            <p className="text-center text-gray-600 mb-6">
                                Are you sure you want to cancel this appointment? This action cannot be undone.
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleCancel(showCancelConfirm)}
                                    className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FaTimes /> Cancel Appointment
                                </button>
                                <button
                                    onClick={() => setShowCancelConfirm(null)}
                                    className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition-colors"
                                >
                                    Go Back
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
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