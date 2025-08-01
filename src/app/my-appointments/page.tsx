'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaCalendarAlt,
    FaClock,
    FaStethoscope,
    FaUserCircle,
    FaCheckCircle,
    FaTimesCircle,
    FaInfoCircle,
    FaHourglassHalf,
    FaRedo,
    FaMapMarkerAlt,
    FaBriefcaseMedical,
    FaCapsules,
    FaNotesMedical,
    FaStar,
    FaSignOutAlt,
} from 'react-icons/fa';

// Combined storage functions for ALL appointments (patient and doctor)
type Appointment = {
    id: string;
    doctorId: string;
    doctorName: string;
    doctorSpecialization: string;
    doctorAvatar: string;
    date: string;
    time: string;
    type: 'Online Consultation' | 'Clinic Visit';
    token: string;
    patientName: string;
    patientAge: string;
    paymentMethod: 'cash' | 'online';
    status: 'Pending' | 'Accepted' | 'Rescheduled' | 'Cancelled' | 'Completed';
    reason: string;
};

// Use a single, consistent key for all appointments
const APPOINTMENTS_STORAGE_KEY = 'allAppointments';

const getAppointments = (): Appointment[] => {
    if (typeof window === 'undefined') return [];
    try {
        const storedAppointments = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
        const parsedAppointments: any[] = storedAppointments ? JSON.parse(storedAppointments) : [];
        return parsedAppointments.map(app => ({
            ...app,
            status: app.status as Appointment['status'],
            type: app.type as Appointment['type'],
            paymentMethod: app.paymentMethod as Appointment['paymentMethod'],
        })) as Appointment[];
    } catch (error) {
        console.error("Failed to parse appointments from localStorage", error);
        return [];
    }
};

const saveAppointments = (appointments: Appointment[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
    }
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

const mockAvailableTimes = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
];

export default function MyAppointmentsPage() {
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
    const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
    const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [appointmentToReschedule, setAppointmentToReschedule] = useState<Appointment | null>(null);
    const [rescheduleDate, setRescheduleDate] = useState<string>('');
    const [rescheduleTime, setRescheduleTime] = useState<string>('');
    const router = useRouter();

    const fetchAppointments = useCallback(() => {
        const today = new Date().toISOString().split('T')[0];
        let allAppointments = getAppointments();

        // Initialize mock data if none exists
        if (allAppointments.length === 0) {
            const mockData: Appointment[] = [
                {
                    id: 'mock1', doctorId: 'doc1', doctorName: 'Dr. Emily Turner', doctorSpecialization: 'Cardiology',
                    doctorAvatar: 'https://i.pravatar.cc/100?u=doc1', date: getNext7Days()[0],
                    time: '10:00 AM', type: 'Online Consultation', token: 'ABCDE1', patientName: 'John Doe',
                    patientAge: '35', paymentMethod: 'online', status: 'Pending', reason: 'Routine checkup'
                },
                {
                    id: 'mock2', doctorId: 'doc2', doctorName: 'Dr. Alex Chen', doctorSpecialization: 'Dermatology',
                    doctorAvatar: 'https://i.pravatar.cc/100?u=doc2', date: getNext7Days()[1],
                    time: '02:30 PM', type: 'Clinic Visit', token: 'FGHIJ2', patientName: 'Jane Smith',
                    patientAge: '28', paymentMethod: 'cash', status: 'Accepted', reason: 'Skin rash'
                },
                {
                    id: 'mock3', doctorId: 'doc3', doctorName: 'Dr. Sarah Patel', doctorSpecialization: 'Pediatrics',
                    doctorAvatar: 'https://i.pravatar.cc/100?u=doc3', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    time: '11:00 AM', type: 'Online Consultation', token: 'KLMNO3', patientName: 'Alice Johnson',
                    patientAge: '5', paymentMethod: 'online', status: 'Completed', reason: 'Fever'
                },
            ];
            saveAppointments(mockData);
            allAppointments = mockData; // Use the mock data after saving
        }

        // Update appointments to 'Completed' if their date is in the past
        const updatedAppointments = allAppointments.map(app => {
            const appDate = new Date(app.date);
            const todayDate = new Date(today);
            if (appDate < todayDate && app.status !== 'Cancelled' && app.status !== 'Completed') {
                // Corrected line with 'as const' assertion
                return { ...app, status: 'Completed' as const };
            }
            return app;
        });
        saveAppointments(updatedAppointments);

        const upcoming = updatedAppointments.filter(app => {
            const isFutureOrToday = new Date(app.date) >= new Date(today);
            return (app.status === 'Pending' || app.status === 'Accepted' || app.status === 'Rescheduled') && isFutureOrToday;
        });
        const past = updatedAppointments.filter(app => {
            const isPast = new Date(app.date) < new Date(today);
            return app.status === 'Completed' || app.status === 'Cancelled' || isPast;
        });
        setUpcomingAppointments(upcoming);
        setPastAppointments(past);

    }, []);

    useEffect(() => {
        fetchAppointments();
        const lobsterLink = document.createElement("link");
        lobsterLink.href = "https://fonts.googleapis.com/css2?family=Lobster&display=swap";
        lobsterLink.rel = "stylesheet";
        document.head.appendChild(lobsterLink);

        const interLink = document.createElement("link");
        interLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap";
        interLink.rel = "stylesheet";
        document.head.appendChild(interLink);

    }, [fetchAppointments]);

    const handleCancelAppointment = (appointment: Appointment) => {
        setAppointmentToCancel(appointment);
        setShowCancelConfirmModal(true);
    };

    const confirmCancel = () => {
        if (appointmentToCancel) {
            const allAppointments = getAppointments();
            const updatedAppointments = allAppointments.map(app =>
                app.id === appointmentToCancel.id ? { ...app, status: 'Cancelled' as const, reason: "Patient cancelled." } : app
            );
            saveAppointments(updatedAppointments);
            fetchAppointments(); // Re-fetch to update the UI
            setShowCancelConfirmModal(false);
            setAppointmentToCancel(null);
        }
    };

    const handleRescheduleAppointment = (appointment: Appointment) => {
        setAppointmentToReschedule(appointment);
        setRescheduleDate(appointment.date);
        setRescheduleTime('');
        setShowRescheduleModal(true);
    };

    const confirmReschedule = () => {
        if (appointmentToReschedule && rescheduleDate && rescheduleTime) {
            const allAppointments = getAppointments();
            const updatedAppointment = {
                ...appointmentToReschedule,
                date: rescheduleDate,
                time: rescheduleTime,
                // Corrected line with 'as const' assertion
                status: 'Rescheduled' as const,
            };
            const updatedAppointments = allAppointments.map(app =>
                app.id === updatedAppointment.id ? updatedAppointment : app
            );
            saveAppointments(updatedAppointments);
            fetchAppointments(); // Re-fetch to update the UI
            setShowRescheduleModal(false);
            setAppointmentToReschedule(null);
            setRescheduleDate('');
            setRescheduleTime('');
        }
    };

    const renderAppointmentCard = (appointment: Appointment) => {
        const isUpcoming = appointment.status === 'Pending' || appointment.status === 'Accepted' || appointment.status === 'Rescheduled';
        
        let statusConfig = { color: 'text-gray-500', icon: <FaInfoCircle className="inline mr-2" /> };
        switch (appointment.status) {
            case 'Accepted':
                statusConfig = { color: 'text-green-600', icon: <FaCheckCircle className="inline mr-2" /> };
                break;
            case 'Pending':
                statusConfig = { color: 'text-yellow-600', icon: <FaHourglassHalf className="inline mr-2" /> };
                break;
            case 'Rescheduled':
                statusConfig = { color: 'text-blue-600', icon: <FaRedo className="inline mr-2" /> };
                break;
            case 'Completed':
                statusConfig = { color: 'text-purple-600', icon: <FaCheckCircle className="inline mr-2" /> };
                break;
            case 'Cancelled':
                statusConfig = { color: 'text-red-600', icon: <FaTimesCircle className="inline mr-2" /> };
                break;
        }

        return (
            <motion.div
                key={appointment.id}
                className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 relative overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                whileHover={{
                    y: -8,
                    scale: 1.02,
                    boxShadow: "0px 15px 25px rgba(99, 102, 241, 0.3)",
                }}
            >
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-shrink-0">
                        <Image src={appointment.doctorAvatar} alt={appointment.doctorName} width={100} height={100} className="rounded-2xl object-cover shadow-md border-2 border-blue-100" />
                    </div>
                    <div className="flex-grow">
                        <h3 className="text-2xl font-bold text-gray-900">{appointment.doctorName}</h3>
                        <p className="text-md text-blue-600 font-medium">{appointment.doctorSpecialization}</p>
                        <p className={`mt-2 font-semibold text-lg ${statusConfig.color}`}>
                            {statusConfig.icon}
                            {appointment.status}
                        </p>
                        <div className="mt-4 border-t pt-4 space-y-2 text-gray-700">
                            <div className="flex items-center gap-3">
                                <FaCalendarAlt className="text-blue-500" />
                                <span>{new Date(appointment.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <FaClock className="text-blue-500" />
                                <span>{appointment.time}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <FaInfoCircle className="text-blue-500" />
                                <span>{appointment.type}</span>
                            </div>
                        </div>
                    </div>
                    {isUpcoming && (
                        <div className="flex flex-col gap-3 justify-center">
                            <motion.button
                                onClick={() => handleRescheduleAppointment(appointment)}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaRedo className="inline-block mr-2" />
                                Reschedule
                            </motion.button>
                            <motion.button
                                onClick={() => handleCancelAppointment(appointment)}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg hover:bg-red-600 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaTimesCircle className="inline-block mr-2" />
                                Cancel
                            </motion.button>
                        </div>
                    )}
                </div>
            </motion.div>
        );
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
                    <motion.button onClick={() => router.push("/dashboard")} whileHover={{ y: -3, color: "#4F46E5" }} className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                        <FaStethoscope className="text-blue-600" /> Doctors
                    </motion.button>
                    <motion.button onClick={() => router.push("/my-appointments")} whileHover={{ y: -3, color: "#4F46E5" }} className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 font-bold text-blue-600">
                        <FaCalendarAlt className="text-blue-600" /> Appointments
                    </motion.button>
                    <motion.button onClick={() => router.push("/medicines")} whileHover={{ y: -3, color: "#4F46E5" }} className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                        <FaCapsules className="text-blue-600" /> Medicines
                    </motion.button>
                    <motion.button onClick={() => router.push("/records")} whileHover={{ y: -3, color: "#4F46E5" }} className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                        <FaNotesMedical className="text-blue-600" /> Records
                    </motion.button>
                </div>
                <div className="flex items-center gap-4">
                    <motion.button
                        onClick={() => router.push("/profile")}
                        className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors shadow-md"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <FaUserCircle className="text-2xl" />
                    </motion.button>
                    <motion.button
                        onClick={() => router.push("/")}
                        className="flex items-center gap-2 py-2 px-4 rounded-full text-red-500 bg-red-100/50 hover:bg-red-100 transition-colors shadow"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaSignOutAlt />
                        <span>Logout</span>
                    </motion.button>
                </div>
            </motion.div>

            <main className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 pt-32">
                <motion.h2
                    className="text-center text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 mb-10"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    My Appointments
                </motion.h2>

                <div className="flex justify-center border-b-2 border-gray-200 mb-8 bg-white/50 backdrop-blur-sm rounded-t-xl p-2">
                    <button
                        className={`py-3 px-6 text-lg font-semibold transition-all duration-300 rounded-lg relative ${activeTab === 'upcoming' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        Upcoming ({upcomingAppointments.length})
                        {activeTab === 'upcoming' && <motion.div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600" layoutId="underline" />}
                    </button>
                    <button
                        className={`py-3 px-6 text-lg font-semibold transition-all duration-300 rounded-lg relative ${activeTab === 'past' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
                        onClick={() => setActiveTab('past')}
                    >
                        Past ({pastAppointments.length})
                        {activeTab === 'past' && <motion.div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600" layoutId="underline" />}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'upcoming' && (
                        <motion.div key="upcoming-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                            {upcomingAppointments.length > 0 ? (
                                upcomingAppointments.map(renderAppointmentCard)
                            ) : (
                                <div className="bg-white p-8 rounded-2xl shadow-lg text-center text-gray-500">
                                    <p className="text-xl font-semibold">You have no upcoming appointments.</p>
                                    <motion.button onClick={() => router.push('/dashboard')} className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg">
                                        Book Now
                                    </motion.button>
                                </div>
                            )}
                        </motion.div>
                    )}
                    {activeTab === 'past' && (
                        <motion.div key="past-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                            {pastAppointments.length > 0 ? (
                                pastAppointments.map(renderAppointmentCard)
                            ) : (
                                <div className="bg-white p-8 rounded-2xl shadow-lg text-center text-gray-500">
                                    <p className="text-xl font-semibold">No past appointments found.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <AnimatePresence>
                {showCancelConfirmModal && appointmentToCancel && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
                        <motion.div initial={{ scale: 0.9, y: -30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Confirm Cancellation</h3>
                            <p className="text-gray-600 mb-6">Are you sure you want to cancel your appointment with <span className="font-semibold text-blue-600">{appointmentToCancel.doctorName}</span>?</p>
                            <div className="flex justify-center space-x-4">
                                <motion.button onClick={() => setShowCancelConfirmModal(false)} className="bg-gray-200 text-gray-800 font-semibold px-6 py-3 rounded-xl hover:bg-gray-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Go Back</motion.button>
                                <motion.button onClick={confirmCancel} className="bg-red-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-red-600" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Confirm</motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showRescheduleModal && appointmentToReschedule && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
                        <motion.div initial={{ scale: 0.9, y: -30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Reschedule Appointment</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Select New Date</label>
                                    <div className="flex overflow-x-auto space-x-3 pb-2">
                                        {getNext7Days().map(date => (
                                            <motion.button key={date} onClick={() => setRescheduleDate(date)} className={`py-2 px-4 rounded-full text-sm font-medium whitespace-nowrap ${rescheduleDate === date ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Select New Time</label>
                                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                        {mockAvailableTimes.map(time => (
                                            <motion.button key={time} onClick={() => setRescheduleTime(time)} className={`py-2 px-3 rounded-lg text-sm font-medium ${rescheduleTime === time ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                {time}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-center space-x-4 mt-8">
                                <motion.button onClick={() => setShowRescheduleModal(false)} className="bg-gray-200 text-gray-800 font-semibold px-6 py-3 rounded-xl hover:bg-gray-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Cancel</motion.button>
                                <motion.button onClick={confirmReschedule} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Confirm Reschedule</motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <footer className="bg-gradient-to-br from-blue-900 to-purple-900 text-white py-12 px-8 mt-16 relative z-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-2xl font-bold font-lobster mb-4" style={{ fontFamily: "'Lobster', cursive" }}>Shedula</h3>
                        <p className="text-gray-300 text-sm">Your all-in-one healthcare platform for booking appointments, consulting online, and managing health records.</p>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-gray-300 text-sm">
                            <li><a href="/dashboard" className="hover:text-white transition-colors">Find a Doctor</a></li>
                            <li><a href="/my-appointments" className="hover:text-white transition-colors">My Appointments</a></li>
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