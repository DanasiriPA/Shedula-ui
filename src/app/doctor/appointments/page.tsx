"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { enUS } from 'date-fns/locale/en-US';
import { 
  FaCalendarCheck, FaClock, FaCalendarTimes, FaTimes, FaUserMd, FaChevronLeft, 
  FaUserCircle, FaStethoscope, FaBriefcaseMedical,
  FaMapMarkerAlt, FaRupeeSign, FaEdit, FaTrash, FaLaptopMedical, FaCalendarAlt,
  FaSignOutAlt, FaListUl, FaFilePrescription
} from 'react-icons/fa';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from "@/lib/utils";
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import withDragAndDrop, { EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, addMinutes, isBefore } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

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
    status: 'upcoming' | 'completed' | 'canceled' | 'rescheduled';
    consultationFee: number;
    location: string;
    createdAt: string;
    paymentMethod: string;
    timeRemaining?: string;
    originalDate?: string;
    originalTime?: string;
}

interface DoctorAvailability {
    online: Record<string, Slot[]>;
    clinic: Record<string, Slot[]>;
}

interface Slot {
    time: string;
    available: boolean;
}

interface CalendarEvent extends Event {
    id: string;
    title: string;
    start: Date;
    end: Date;
    appointment: Appointment;
}

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const DnDCalendar = withDragAndDrop<CalendarEvent, object>(Calendar);

export default function DoctorAppointmentsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [reschedulingId, setReschedulingId] = useState<string | null>(null);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
    const [, setDoctorAvailability] = useState<DoctorAvailability | null>(null);
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [availableTimes, setAvailableTimes] = useState<Slot[]>([]);
    const [, setConsultationType] = useState<'online' | 'clinic' | null>(null);
    const [view, setView] = useState<'list' | 'calendar'>('list');
    const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'canceled' | 'rescheduled'>('upcoming');
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('week');
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const router = useRouter();
    
    const appointmentCounts = useMemo(() => ({
    upcoming: appointments.filter(a => a.status === 'upcoming').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    canceled: appointments.filter(a => a.status === 'canceled').length,
    rescheduled: appointments.filter(a => a.status === 'rescheduled').length
    }), [appointments]);

    const generateNext7Days = () => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    };

    const calculateTimeRemaining = (appointmentDate: string, appointmentTime: string) => {
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    const appointmentDateTime = new Date(appointmentDate);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const diffMs = appointmentDateTime.getTime() - now.getTime();

    if (diffMs <= 0) return 'Appointment completed';

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffDays}d ${diffHours}h ${diffMinutes}m remaining`;
  };

    const fetchDoctorAvailability = useCallback(async () => {
        if (!user) return;

        try {
            const docRef = doc(db, "doctors", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.availableSlots) {
                    setDoctorAvailability(data.availableSlots);
                }
            }
        } catch (error) {
            console.error("Error fetching doctor availability:", error);
        }
    }, [user]);

    const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
        const q = query(
            collection(db, "appointments"),
            where("doctorId", "==", "b2FxNOgwPuhynq3lJUPvHaQOJV82")
        );
        const querySnapshot = await getDocs(q);

        const allAppointments: Appointment[] = [];
        const now = new Date();
        const updatePromises: Promise<void>[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            if (data.doctorName && data.date && data.time && data.status && data.patientId) {
                // Always use the CURRENT scheduled time (date + time)
                const currentDateTime = new Date(`${data.date}T${data.time}`);
                
                // Calculate time remaining based on CURRENT schedule
                const timeRemainingValue = currentDateTime < now 
                    ? 'Appointment completed'
                    : calculateTimeRemaining(data.date, data.time);

                // Only mark as completed if:
                // 1. The current time is past the appointment time
                // 2. The status is either upcoming or rescheduled
                const shouldComplete = currentDateTime < now && 
                    (data.status === 'upcoming' || data.status === 'rescheduled');

                if (shouldComplete) {
                    updatePromises.push(
                        updateDoc(doc.ref, { 
                            status: 'completed',
                            timeRemaining: timeRemainingValue
                        })
                    );
                }

                const appointment: Appointment = {
                    id: doc.id,
                    doctorId: data.doctorId,
                    doctorName: data.doctorName,
                    doctorSpecialization: data.doctorSpecialization,
                    doctorAvatar: data.doctorAvatar,
                    date: data.date,
                    time: data.time,
                    type: data.type,
                    token: data.token,
                    patientName: data.patientName,
                    patientAge: data.patientAge,
                    patientId: data.patientId,
                    status: shouldComplete ? 'completed' : data.status,
                    consultationFee: data.consultationFee,
                    location: data.location,
                    createdAt: data.createdAt,
                    paymentMethod: data.paymentMethod || 'unknown',
                    timeRemaining: timeRemainingValue,
                    originalDate: data.originalDate,
                    originalTime: data.originalTime
                };

                allAppointments.push(appointment);
            }
        });

        if (updatePromises.length > 0) {
            await Promise.all(updatePromises);
        }

        setAppointments(allAppointments);

    } catch (error) {
        console.error("Error fetching appointments:", error);
    } finally {
        setLoading(false);
    }
}, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchAppointments();
                fetchDoctorAvailability();
            } else {
                setUser(null);
                setLoading(false);
                router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [router, fetchAppointments, fetchDoctorAvailability]);

    useEffect(() => {
        if (reschedulingId) {
            const appointment = appointments.find(a => a.id === reschedulingId);
            if (appointment) {
                setConsultationType(appointment.type === 'Online Consultation' ? 'online' : 'clinic');
            }
        }
    }, [reschedulingId, appointments]);

    useEffect(() => {
        const next7Days = generateNext7Days();
        setAvailableDates(next7Days);
    }, []);

    useEffect(() => {
        if (newDate) {
            const fixedTimes: Slot[] = [
                '09:00', '10:00', '11:00', '12:00', '13:00',
                '14:00', '15:00', '16:00', '17:00', '18:00'
            ].map(time => ({ time, available: true }));

            setAvailableTimes(fixedTimes);
            setNewTime('');
        }
    }, [newDate]);

    const handleReschedule = async (appointmentId: string) => {
    if (!newDate || !newTime) return;

    try {
        const appointmentRef = doc(db, "appointments", appointmentId);
        const appointment = appointments.find(a => a.id === appointmentId);
        
        await updateDoc(appointmentRef, {
            date: newDate,
            time: newTime,
            timeRemaining: calculateTimeRemaining(newDate, newTime),
            status: 'rescheduled',
            originalDate: appointment?.date,  // Store current date as original
            originalTime: appointment?.time   // Store current time as original
        });
        
        if (user) {
            await fetchAppointments();
        }
        setReschedulingId(null);
        setNewDate('');
        setNewTime('');
        setConsultationType(null);
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
                await fetchAppointments();
            }
            setShowCancelConfirm(null);
            setSelectedEvent(null);
        } catch (error) {
            console.error("Error canceling appointment:", error);
        }
    };

    const onEventDrop = async (args: EventInteractionArgs<CalendarEvent>) => {
    try {
        const { event, start } = args;
        const now = new Date();

        // Ensure start is a Date object
        const startDate = start instanceof Date ? start : new Date(start);

        if (event.appointment.status === 'canceled' || event.appointment.status === 'completed') {
            return;
        }

        if (isBefore(startDate, now)) {
            alert('Cannot reschedule to past date/time');
            return;
        }

        const newDate = startDate.toISOString().split('T')[0];
        const newTime = format(startDate, 'HH:mm');

        const appointmentRef = doc(db, "appointments", event.id);
        const appointment = appointments.find(a => a.id === event.id);
        
        await updateDoc(appointmentRef, {
            date: newDate,
            time: newTime,
            timeRemaining: calculateTimeRemaining(newDate, newTime),
            status: 'rescheduled',
            originalDate: appointment?.originalDate || appointment?.date,
            originalTime: appointment?.originalTime || appointment?.time
        });

        if (user) {
            await fetchAppointments();
        }
    } catch (error) {
        console.error("Error rescheduling via drag-and-drop:", error);
    }
};

    const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '';
    let borderColor = '';
    let textDecoration = 'none';
    
    switch (event.appointment.status) {
        case 'upcoming':
            backgroundColor = '#3B82F6'; // blue-500
            borderColor = '#2563EB'; // blue-600
            break;
        case 'rescheduled':
            backgroundColor = '#F59E0B'; // yellow-500
            borderColor = '#D97706'; // yellow-600
            break;
        case 'canceled':
            backgroundColor = '#EF4444'; // red-500
            borderColor = '#DC2626'; // red-600
            textDecoration = 'line-through';
            break;
        case 'completed':
            backgroundColor = '#10B981'; // green-500
            borderColor = '#059669'; // green-600
            break;
        default:
            backgroundColor = '#3B82F6'; // blue-500
            borderColor = '#2563EB'; // blue-600
    }

    return {
        style: {
            backgroundColor,
            borderColor,
            borderRadius: '4px',
            opacity: 0.9,
            color: 'white',
            border: '0px',
            display: 'block',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
            cursor: 'pointer', // Always show pointer cursor
            textDecoration,
            padding: '2px 5px',
            fontSize: '0.8rem'
        }
    };
};

    const events = useMemo(() => {
  const allEvents = appointments.map(app => {
    try {
      // Parse the date and time separately
      const [year, month, day] = app.date.split('-').map(Number);
      const [hours, minutes] = app.time.split(':').map(Number);
      
      // Create a new Date object with the parsed values
      const start = new Date(year, month - 1, day, hours, minutes);
      const end = addMinutes(new Date(start), 30);
      
      // Validate the dates
      if (isNaN(start.getTime())) {
        console.error('Invalid start date for appointment:', app.id, app.date, app.time);
        return null;
      }
      if (isNaN(end.getTime())) {
        console.error('Invalid end date for appointment:', app.id, app.date, app.time);
        return null;
      }

      return {
        id: app.id,
        title: `${app.patientName} - ${app.type}`,
        start,
        end,
        appointment: app
      };
    } catch (error) {
      console.error('Error creating event for appointment:', app.id, error);
      return null;
    }
  }).filter(event => event !== null) as CalendarEvent[];

  console.log('Generated events:', allEvents);
  return allEvents;
}, [appointments]);

    useEffect(() => {
        console.log('Appointments state:', appointments);
        console.log('Events state:', events);
    }, [appointments, events]);

    const renderAppointmentCard = (app: Appointment) => (
        <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-6 rounded-2xl shadow-xl border-2 border-transparent bg-origin-border bg-clip-border bg-gradient-to-br from-blue-50 via-white to-purple-50"
        >
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                        {app.patientName.split(' ').map(n => n[0]).join('')}
                    </div>
                </div>
                <div className="flex-grow">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">{app.patientName}</h3>
                            <p className="text-gray-600">{app.patientAge} years old</p>
                            <div className="mt-4 space-y-2">
                                <p className="flex items-center gap-2 text-gray-700">
                                    <FaCalendarCheck className="text-blue-500" /> 
                                    {formatDate(app.date)} at {app.time}
                                    {app.status === 'rescheduled' && (
                                        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                            Rescheduled
                                        </span>
                                    )}
                                </p>
                                {app.originalDate && app.originalTime && (
                                    <p className="flex items-center gap-2 text-gray-500 text-sm">
                                        <FaCalendarTimes className="text-yellow-500" />
                                        Originally scheduled for {formatDate(app.originalDate)} at {app.originalTime}
                                    </p>
                                )}
                                <p className="flex items-center gap-2 text-gray-700">
                                    {app.type === 'Online Consultation' ? 
                                        <FaLaptopMedical className="text-purple-500" /> : 
                                        <FaMapMarkerAlt className="text-purple-500" />}
                                    {app.type}
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
                                app.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                app.status === 'rescheduled' ? 'bg-yellow-100 text-yellow-800' :
                                app.status === 'canceled' ? 'bg-red-100 text-red-800' :
                                'bg-green-100 text-green-800'
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Consultation Type: {app.type}
                                </label>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                        {availableDates.length > 0 ? (
                                            availableDates.map(date => (
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
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-sm">No available dates in the next 7 days</p>
                                        )}
                                    </div>
                                </div>

                                {newDate && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {availableTimes.length > 0 ? (
                                                availableTimes.map(slot => (
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
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-sm">No available times for this date</p>
                                            )}
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

    const renderAppointmentDetails = (event: CalendarEvent) => {
    const app = event.appointment;
    const now = new Date();
    const appointmentTime = new Date(`${app.date}T${app.time}`);
    const isPastAppointment = isBefore(appointmentTime, now);
    
    return (
        <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{app.patientName}</h3>
            <div className="space-y-3">
                <p className="flex items-center gap-3 text-gray-700">
                    <FaCalendarCheck className="text-blue-500" /> 
                    <span className="font-medium">Date:</span> {formatDate(app.date)} at {app.time}
                </p>
                <p className="flex items-center gap-3 text-gray-700">
                    <FaUserMd className="text-blue-500" /> 
                    <span className="font-medium">Patient:</span> {app.patientName} ({app.patientAge} years)
                </p>
                <p className="flex items-center gap-3 text-gray-700">
                    {app.type === 'Online Consultation' ? 
                        <FaLaptopMedical className="text-purple-500" /> : 
                        <FaMapMarkerAlt className="text-purple-500" />}
                    <span className="font-medium">Type:</span> {app.type}
                </p>
                <p className="flex items-center gap-3 text-gray-700">
                    <FaRupeeSign className="text-amber-500" /> 
                    <span className="font-medium">Fee:</span> ₹{app.consultationFee}
                </p>
                <p className="flex items-center gap-3 text-gray-700">
                    <FaClock className={
                        app.timeRemaining === 'Appointment completed' 
                            ? "text-gray-500" 
                            : "text-green-500"
                    } /> 
                    <span className="font-medium">Status:</span> 
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        app.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                        app.status === 'rescheduled' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'canceled' ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                    }`}>
                        {app.status.toUpperCase()}
                    </span>
                </p>
                {app.status === 'rescheduled' && app.originalDate && app.originalTime && (
                    <p className="flex items-center gap-3 text-gray-500 text-sm">
                        <FaCalendarTimes className="text-yellow-500" />
                        <span className="font-medium">Originally:</span> {formatDate(app.originalDate)} at {app.originalTime}
                    </p>
                )}
            </div>

            <div className="mt-6 flex gap-3 flex-wrap">
                {app.status === 'upcoming' && !isPastAppointment && (
                    <>
                        <button
                            onClick={() => {
                                setReschedulingId(app.id);
                                setNewDate(app.date);
                                setNewTime(app.time);
                                setSelectedEvent(null);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <FaEdit /> Reschedule
                        </button>
                        <button
                            onClick={() => setShowCancelConfirm(app.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            <FaTimes /> Cancel
                        </button>
                    </>
                )}
                <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors ml-auto"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

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

    return (
        <div className="min-h-screen bg-gray-200 text-gray-900 font-inter relative overflow-x-hidden">
            <style jsx global>{`
                .rbc-event-content {
                    position: relative;
                }
                .group:hover .group-hover\\:block {
                    display: block;
                }
                .bg-medical-pattern {
                    background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2393c5fd' fill-opacity='0.4'%3E%3Cpath d='M20 40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0-20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm40-40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2z'/%3E%3Cpath d='M42 20h-4v-4h-4v4h-4v4h4v4h4v-4h4v-4z'/%3E%3C/g%3E%3C/svg%3E");
                    background-size: 80px 80px;
                    opacity: 0.5;
                }
                .rbc-calendar {
                    min-height: 700px;
                    background: white;
                    border-radius: 0.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    font-family: inherit;
                }
                .rbc-toolbar {
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 0.5rem 0.5rem 0 0;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    align-items: center;
                }
                .rbc-toolbar button {
                    color: #4b5563;
                    border: 1px solid #d1d5db;
                    padding: 0.375rem 0.75rem;
                    border-radius: 0.375rem;
                    transition: all 0.2s;
                    font-weight: 500;
                    background: white;
                }
                .rbc-toolbar button:hover {
                    background-color: #e5e7eb;
                }
                .rbc-toolbar button.rbc-active {
                    background-color: #3b82f6;
                    color: white;
                    border-color: #3b82f6;
                }
                .rbc-header {
                    padding: 0.75rem 0.5rem;
                    background: #f3f4f6;
                    font-weight: 600;
                    color: #374151;
                }
                .rbc-day-bg + .rbc-day-bg,
                .rbc-header + .rbc-header {
                    border-left: 1px solid #e5e7eb;
                }
                .rbc-month-row + .rbc-month-row {
                    border-top: 1px solid #e5e7eb;
                }
                .rbc-off-range-bg {
                    background: #f9fafb;
                }
                .rbc-today {
                    background-color: #e0f2fe;
                }
                .rbc-event {
                    border-radius: 6px;
                    padding: 4px 8px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                    margin: 2px 0;
                    font-weight: 500;
                    font-size: 0.9rem;
                }
                .rbc-event:hover {
                    opacity: 1;
                    box-shadow: 0 4px 8px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    transform: translateY(-1px);
                }
                .rbc-event-content {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .rbc-day-slot .rbc-event {
                    border-left: 4px solid;
                }
                .rbc-time-view {
                    border-radius: 0 0 0.5rem 0.5rem;
                }
                .rbc-time-header {
                    border-radius: 0.5rem 0.5rem 0 0;
                    overflow: hidden;
                }
                .rbc-time-content {
                    border-radius: 0 0 0.5rem 0.5rem;
                    border-top: 1px solid #e5e7eb;
                }
                .rbc-timeslot-group {
                    border-bottom: 1px solid #e5e7eb;
                }
                .rbc-time-gutter {
                    color: #6b7280;
                    font-size: 0.875rem;
                    font-weight: 500;
                }
                .rbc-agenda-view table.rbc-agenda-table {
                    border-radius: 0.5rem;
                    overflow: hidden;
                }
                .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
                    background: #f3f4f6;
                    padding: 0.75rem;
                }
                .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
                    padding: 0.75rem;
                    border-bottom: 1px solid #e5e7eb;
                }
                .rbc-agenda-time-cell {
                    color: #6b7280;
                }
                .rbc-agenda-date-cell {
                    font-weight: 600;
                }
                .rbc-month-view {
                    border-radius: 0 0 0.5rem 0.5rem;
                }
                .rbc-month-header {
                    border-radius: 0.5rem 0.5rem 0 0;
                }
                .rbc-date-cell {
                    padding: 0.5rem;
                    font-weight: 500;
                }
                .rbc-date-cell.rbc-now {
                    font-weight: 600;
                    color: #3b82f6;
                }
                .rbc-row-bg + .rbc-row-bg {
                    border-top: 1px solid #e5e7eb;
                }
                .rbc-day-bg {
                    border-right: 1px solid #e5e7eb;
                    border-bottom: 1px solid #e5e7eb;
                }
            `}</style>

            <div className="absolute inset-0 z-0 bg-white bg-medical-pattern"></div>

            <motion.div
                className={`fixed top-0 left-0 right-0 z-50 py-5 px-8 flex justify-between items-center transition-all duration-300 rounded-b-3xl shadow-xl bg-white/90 backdrop-blur-md border-b-2 border-transparent bg-origin-border bg-clip-border bg-gradient-to-br from-blue-200 via-white to-purple-200`}
            >
                <div className="flex items-center gap-4">
                    <Image src="https://i.postimg.cc/SKnMMNcw/360-F-863843181_63-Nv8tgy-BU8-X26-B1-Lq-Qvfi0tn95aj-Sg-X.jpg" alt="Shedula Logo" width={45} height={45} className="rounded-full shadow-md" />
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
                        onClick={() => router.push("/doctor/dashboard")}
                        whileHover={{ y: -3, color: "#4F46E5" }}
                        className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
                    >
                        <FaStethoscope className="text-blue-600" /> Dashboard
                    </motion.button>
                    <motion.button 
                        onClick={() => router.push("/doctor/appointments")} 
                        whileHover={{ y: -3, color: "#4F46E5" }} 
                        className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 bg-blue-50 text-blue-700"
                    >
                        <FaCalendarAlt className="text-blue-600" /> Appointments
                    </motion.button>
                    <motion.button 
                                onClick={() => router.push("/doctor/prescriptions")} 
                                whileHover={{ y: -3, color: "#4F46E5" }} 
                                className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 bg-blue-50 text-blue-700"
                              >
                                <FaFilePrescription className="text-blue-600" /> Prescriptions
                              </motion.button>
                    <motion.button onClick={() => router.push("/doctor/patients")} whileHover={{ y: -3, color: "#4F46E5" }} className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                        <FaUserMd className="text-blue-600" /> Patients
                    </motion.button>
                    <motion.button onClick={() => router.push("/doctor/profile")} whileHover={{ y: -3, color: "#4F46E5" }} className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                        <FaUserCircle className="text-blue-600" /> Profile
                    </motion.button>
                </div>
                <motion.button
                    onClick={() => auth.signOut().then(() => router.push('/'))}
                    className="p-3 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors shadow-md"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <FaSignOutAlt className="text-xl" />
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
                            onClick={() => setView('list')}
                            className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                                view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <FaListUl /> List View
                        </button>
                        <button
                            onClick={() => setView('calendar')}
                            className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                                view === 'calendar' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <FaCalendarAlt /> Calendar View
                        </button>
                    </div>
                </div>

                <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    My Appointments
                </h1>

                {view === 'list' ? (
                    <section className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <motion.div 
                                whileHover={{ y: -5 }}
                                className="bg-blue-100 p-6 rounded-xl shadow-md border-l-4 border-blue-500"
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-blue-800">Upcoming</h3>
                                    <FaCalendarCheck className="text-blue-500 text-2xl" />
                                </div>
                                <p className="text-3xl font-bold text-blue-900 mt-2">{appointmentCounts.upcoming}</p>
                            </motion.div>
                            <motion.div 
                                whileHover={{ y: -5 }}
                                className="bg-yellow-100 p-6 rounded-xl shadow-md border-l-4 border-yellow-500"
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-yellow-800">Rescheduled</h3>
                                    <FaCalendarTimes className="text-yellow-500 text-2xl" />
                                </div>
                                <p className="text-3xl font-bold text-yellow-900 mt-2">{appointmentCounts.rescheduled}</p>
                            </motion.div>
                            <motion.div 
                                whileHover={{ y: -5 }}
                                className="bg-green-100 p-6 rounded-xl shadow-md border-l-4 border-green-500"
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-green-800">Completed</h3>
                                    <FaCalendarCheck className="text-green-500 text-2xl" />
                                </div>
                                <p className="text-3xl font-bold text-green-900 mt-2">{appointmentCounts.completed}</p>
                            </motion.div>
                            <motion.div 
                                whileHover={{ y: -5 }}
                                className="bg-red-100 p-6 rounded-xl shadow-md border-l-4 border-red-500"
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-red-800">Canceled</h3>
                                    <FaTimes className="text-red-500 text-2xl" />
                                </div>
                                <p className="text-3xl font-bold text-red-900 mt-2">{appointmentCounts.canceled}</p>
                            </motion.div>
                        </div>

                        <div className="flex justify-center mb-6">
                            <div className="inline-flex rounded-md shadow-sm">
                                <button
                                    onClick={() => setActiveTab('upcoming')}
                                    className={`px-6 py-2 text-sm font-medium rounded-l-lg flex items-center gap-2 ${
                                        activeTab === 'upcoming' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <FaCalendarCheck /> Upcoming
                                </button>
                                <button
                                    onClick={() => setActiveTab('rescheduled')}
                                    className={`px-6 py-2 text-sm font-medium flex items-center gap-2 ${
                                        activeTab === 'rescheduled' 
                                            ? 'bg-yellow-500 text-white' 
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <FaCalendarTimes /> Rescheduled
                                </button>
                                <button
                                    onClick={() => setActiveTab('completed')}
                                    className={`px-6 py-2 text-sm font-medium flex items-center gap-2 ${
                                        activeTab === 'completed' 
                                            ? 'bg-green-600 text-white' 
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <FaCalendarCheck /> Completed
                                </button>
                                <button
                                    onClick={() => setActiveTab('canceled')}
                                    className={`px-6 py-2 text-sm font-medium rounded-r-lg flex items-center gap-2 ${
                                        activeTab === 'canceled' 
                                            ? 'bg-red-600 text-white' 
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <FaTimes /> Canceled
                                </button>
                            </div>
                        </div>

                        {appointments.filter(a => a.status === activeTab).length > 0 ? (
                            <div className="space-y-6">
                                {appointments
                                    .filter(a => a.status === activeTab)
                                    .map(app => renderAppointmentCard(app))}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white p-8 text-center rounded-2xl shadow-xl border-2 border-transparent bg-origin-border bg-clip-border bg-gradient-to-br from-blue-50 via-white to-purple-50"
                            >
                                <FaCalendarTimes className="text-gray-400 mx-auto mb-4" size={50} />
                                <p className="text-xl text-gray-600">You have no {activeTab} appointments.</p>
                            </motion.div>
                        )}
                    </section>
                ) : (
                    <div className="bg-white p-6 rounded-2xl shadow-xl">
                        <DnDCalendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        popup
                        style={{ height: 1000 }}
                        defaultView="week"
                        view={calendarView}
                        onView={(view) => {
                            if (view === 'day' || view === 'week' || view === 'month') {
                            setCalendarView(view);
                            }
                        }}
                        views={['day', 'week', 'month']}
                        min={undefined}  // Changed from null to undefined
                        max={undefined}  // Changed from null to undefined
                        onEventDrop={onEventDrop}
                        resizable
                        selectable
                        defaultDate={new Date()}
                        date={calendarDate}
                        onNavigate={(date) => setCalendarDate(date)}
                        eventPropGetter={eventStyleGetter}
                        components={{
    event: ({ event }) => (
        <div className="rbc-event-content relative group">
            <div className="font-medium">{event.title}</div>
            <div className="text-xs opacity-90">
                {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
            </div>
            
            {/* Hover tooltip with full details */}
            <div className="absolute z-50 left-1/2 transform -translate-x-1/2 -top-2 -translate-y-full hidden group-hover:block w-64 bg-white shadow-xl rounded-lg p-4 border border-gray-200">
                <h4 className="font-bold text-gray-900">{event.appointment.patientName}</h4>
                <p className="text-sm text-gray-600">{event.appointment.patientAge} years old</p>
                <div className="mt-2 space-y-1">
                    <p className="text-sm flex items-start gap-2">
                        <FaCalendarCheck className="flex-shrink-0 text-blue-500 mt-0.5" />
                        <span>
                            <span className="font-medium">Date:</span> {formatDate(event.appointment.date)} at {event.appointment.time}
                        </span>
                    </p>
                    <p className="text-sm flex items-start gap-2">
                        {event.appointment.type === 'Online Consultation' ? 
                            <FaLaptopMedical className="flex-shrink-0 text-purple-500 mt-0.5" /> : 
                            <FaMapMarkerAlt className="flex-shrink-0 text-purple-500 mt-0.5" />}
                        <span>
                            <span className="font-medium">Type:</span> {event.appointment.type}
                        </span>
                    </p>
                    <p className="text-sm flex items-start gap-2">
                        <FaRupeeSign className="flex-shrink-0 text-amber-500 mt-0.5" />
                        <span>
                            <span className="font-medium">Fee:</span> ₹{event.appointment.consultationFee}
                        </span>
                    </p>
                    <p className="text-sm flex items-start gap-2">
                        <FaClock className={
                            event.appointment.timeRemaining === 'Appointment completed' 
                                ? "flex-shrink-0 text-gray-500 mt-0.5" 
                                : "flex-shrink-0 text-green-500 mt-0.5"
                        } />
                        <span>
                            <span className="font-medium">Status:</span> 
                            <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                                event.appointment.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                event.appointment.status === 'rescheduled' ? 'bg-yellow-100 text-yellow-800' :
                                event.appointment.status === 'canceled' ? 'bg-red-100 text-red-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                                {event.appointment.status}
                            </span>
                        </span>
                    </p>
                    {event.appointment.originalDate && event.appointment.originalTime && (
                        <p className="text-xs text-gray-500 flex items-start gap-2">
                            <FaCalendarTimes className="flex-shrink-0 text-yellow-500 mt-0.5" />
                            <span>
                                <span className="font-medium">Originally:</span> {formatDate(event.appointment.originalDate)} at {event.appointment.originalTime}
                            </span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    ),
                            toolbar: (props) => (
                            <div className="rbc-toolbar">
                                <span className="rbc-btn-group">
                                <button
                                    type="button"
                                    onClick={() => props.onNavigate('TODAY')}
                                    className="rbc-btn"
                                >
                                    Today
                                </button>
                                <button
                                    type="button"
                                    onClick={() => props.onNavigate('PREV')}
                                    className="rbc-btn"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={() => props.onNavigate('NEXT')}
                                    className="rbc-btn"
                                >
                                    Next
                                </button>
                                </span>
                                <span className="rbc-toolbar-label font-semibold text-gray-800">
                                {props.label}
                                </span>
                                <span className="rbc-btn-group ml-auto">
                                <button
                                    type="button"
                                    onClick={() => {
                                    setCalendarView('day');
                                    props.onView('day');
                                    }}
                                    className={`rbc-btn ${calendarView === 'day' ? 'rbc-active' : ''}`}
                                >
                                    Day
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                    setCalendarView('week');
                                    props.onView('week');
                                    }}
                                    className={`rbc-btn ${calendarView === 'week' ? 'rbc-active' : ''}`}
                                >
                                    Week
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                    setCalendarView('month');
                                    props.onView('month');
                                    }}
                                    className={`rbc-btn ${calendarView === 'month' ? 'rbc-active' : ''}`}
                                >
                                    Month
                                </button>
                                </span>
                            </div>
                            )
                        }}
                        onSelectSlot={() => {}}
                        onSelectEvent={(event: CalendarEvent) => {
                        setSelectedEvent(event);
                        }}
                        />
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedEvent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-400 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
                        onClick={() => setSelectedEvent(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="bg-white rounded-3xl shadow-2xl relative max-w-md w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={() => setSelectedEvent(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FaTimes size={24} />
                            </button>
                            {renderAppointmentDetails(selectedEvent)}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
            
            <footer className="bg-gradient-to-br from-blue-900 to-purple-900 text-white py-12 px-8 mt-16">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-2xl font-bold font-lobster mb-4" style={{ fontFamily: "'Lobster', cursive" }}>Shedula</h3>
                        <p className="text-gray-300 text-sm">Your all-in-one healthcare platform for booking appointments, consulting online, and managing health records.</p>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-gray-300 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Appointments</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Patients</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Profile</a></li>
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