"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp, limit } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { 
  FaCalendarCheck, FaClock, FaCalendarTimes, FaTimes, FaChevronLeft, 
  FaUserCircle, FaStethoscope, FaCapsules, FaNotesMedical, FaStar, FaBriefcaseMedical,
  FaMapMarkerAlt, FaRupeeSign, FaEdit, FaTrash, FaLaptopMedical, FaCalendarAlt,
  FaFilePrescription, FaDownload, FaFileAlt
} from 'react-icons/fa';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from "jspdf";

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

interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  date: string;
  medicines: {
    name: string;
    dosage: string;
    duration: string;
    instructions: string;
  }[];
  notes: string;
  status: string;
}

/* --- New types for History --- */
interface Vitals {
  bloodPressure: string;
  heartRate: number;
  glucose: number;
  weight: string;
  temperature: number;
}

interface MedPrescription {
  name: string;
  dosage: string;
  duration: string;
  instructions?: string;
}

interface MedicalRecord {
  id: string;
  date: string; // ISO
  vitals: Vitals;
  diagnoses: string[];
  prescriptions: MedPrescription[];
  doctorNotes: string;
  summary?: string;
}

interface Review {
  id?: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientPhoto: string;
  doctorId: string;
  rating: number;
  reviewText: string;
  reviewDate: string;
  consultationType: string;
}

/* STATIC_HISTORY: same sample data used previously */
const STATIC_HISTORY: Record<string, MedicalRecord[]> = {
  "patient-1": [
    {
      id: "p1-r5",
      date: "2024-11-02T11:00:00Z",
      vitals: { bloodPressure: "128/82", heartRate: 78, glucose: 110, weight: "77kg", temperature: 98.6 },
      diagnoses: ["Hypertension"],
      prescriptions: [{ name: "Enalapril", dosage: "5mg", duration: "30 days", instructions: "Once daily" }],
      doctorNotes: "BP improved versus previous visit. Continue medication and low-sodium diet.",
      summary: "Follow-up for blood pressure control; medication adjusted and lifestyle counseling provided."
    },
    {
      id: "p1-r4",
      date: "2024-06-15T09:30:00Z",
      vitals: { bloodPressure: "135/86", heartRate: 80, glucose: 115, weight: "78kg", temperature: 98.5 },
      diagnoses: ["High Cholesterol"],
      prescriptions: [{ name: "Atorvastatin", dosage: "20mg", duration: "90 days", instructions: "Nightly" }],
      doctorNotes: "Started statin therapy due to elevated LDL. Advised diet modifications.",
      summary: "New dyslipidemia treatment started; lifestyle interventions discussed."
    },
    {
      id: "p1-r3",
      date: "2023-12-05T14:00:00Z",
      vitals: { bloodPressure: "140/88", heartRate: 84, glucose: 122, weight: "79kg", temperature: 98.6 },
      diagnoses: ["Chest Pain (evaluated)"],
      prescriptions: [{ name: "Aspirin", dosage: "75mg", duration: "Indefinite", instructions: "Once daily" }],
      doctorNotes: "Cardiac workup normal. Placed on low-dose aspirin and scheduled cardiology follow-up.",
      summary: "Evaluation after chest discomfort; conservative management with aspirin and cardiology referral."
    },
    {
      id: "p1-r2",
      date: "2023-07-20T10:00:00Z",
      vitals: { bloodPressure: "142/90", heartRate: 86, glucose: 128, weight: "80kg", temperature: 98.7 },
      diagnoses: ["Coronary Artery Disease"],
      prescriptions: [{ name: "Clopidogrel", dosage: "75mg", duration: "90 days", instructions: "Once daily" }],
      doctorNotes: "Post-procedure check. Continue dual antiplatelet therapy for 3 months.",
      summary: "Post-angioplasty follow-up; antiplatelet regimen continued."
    },
    {
      id: "p1-r1",
      date: "2022-11-10T11:10:00Z",
      vitals: { bloodPressure: "138/86", heartRate: 80, glucose: 115, weight: "78kg", temperature: 98.4 },
      diagnoses: ["Coronary Artery Disease"],
      prescriptions: [{ name: "Atorvastatin", dosage: "40mg", duration: "Indefinite", instructions: "Once nightly" }],
      doctorNotes: "Initial diagnosis of CAD; statin and antiplatelet therapy initiated.",
      summary: "Initial CAD diagnosis; started on lipid-lowering and antiplatelet therapy."
    }
  ],
  "patient-2": [
    {
      id: "p2-r5",
      date: "2024-10-01T09:30:00Z",
      vitals: { bloodPressure: "118/76", heartRate: 72, glucose: 98, weight: "58kg", temperature: 98.2 },
      diagnoses: ["Bronchial Asthma"],
      prescriptions: [{ name: "Budesonide Inhaler", dosage: "200mcg", duration: "60 days", instructions: "2 puffs twice daily" }],
      doctorNotes: "Symptoms stable on inhaled steroid; provided action plan.",
      summary: "Maintenance therapy review for asthma; inhaled steroid continued with action plan."
    },
    {
      id: "p2-r4",
      date: "2024-05-22T11:00:00Z",
      vitals: { bloodPressure: "116/74", heartRate: 70, glucose: 94, weight: "57kg", temperature: 98.4 },
      diagnoses: ["Allergic Rhinitis"],
      prescriptions: [{ name: "Cetirizine", dosage: "10mg", duration: "14 days", instructions: "Once daily" }],
      doctorNotes: "Allergy symptoms reduced after antihistamine; advised environmental controls.",
      summary: "Treated seasonal allergic rhinitis; symptomatic relief achieved."
    },
    {
      id: "p2-r3",
      date: "2023-12-12T14:00:00Z",
      vitals: { bloodPressure: "120/78", heartRate: 72, glucose: 96, weight: "58kg", temperature: 98.3 },
      diagnoses: ["Migraine"],
      prescriptions: [{ name: "Sumatriptan", dosage: "50mg", duration: "As needed", instructions: "Take at onset" }],
      doctorNotes: "Migraine frequency decreased with lifestyle changes and PRN therapy.",
      summary: "Migraine management with PRN triptan and lifestyle adjustment."
    },
    {
      id: "p2-r2",
      date: "2023-06-18T10:00:00Z",
      vitals: { bloodPressure: "119/76", heartRate: 71, glucose: 99, weight: "58kg", temperature: 98.4 },
      diagnoses: ["Upper Respiratory Infection"],
      prescriptions: [{ name: "Symptomatic treatment", dosage: "As directed", duration: "7 days" }],
      doctorNotes: "Viral URTI managed conservatively; recovery within a week.",
      summary: "Short self-limited URTI; symptomatic management."
    },
    {
      id: "p2-r1",
      date: "2022-09-05T15:30:00Z",
      vitals: { bloodPressure: "117/75", heartRate: 70, glucose: 95, weight: "57.5kg", temperature: 98.2 },
      diagnoses: ["General Checkup"],
      prescriptions: [{ name: "Multivitamin", dosage: "Once daily", duration: "30 days", instructions: "After food" }],
      doctorNotes: "Routine checkup. Counseled on nutrition and exercise.",
      summary: "Routine healthy adult checkup with preventive advice."
    }
  ],
  "default": [
    {
      id: "def-5",
      date: "2024-09-01T10:00:00Z",
      vitals: { bloodPressure: "122/78", heartRate: 74, glucose: 101, weight: "70kg", temperature: 98.4 },
      diagnoses: ["General Checkup"],
      prescriptions: [{ name: "Multivitamin", dosage: "Once daily", duration: "30 days" }],
      doctorNotes: "Routine checkup - all vitals acceptable.",
      summary: "Routine visit with normal vitals; preventive counseling given."
    },
    {
      id: "def-4",
      date: "2024-03-20T09:00:00Z",
      vitals: { bloodPressure: "125/80", heartRate: 76, glucose: 103, weight: "70kg", temperature: 98.5 },
      diagnoses: ["Back Pain"],
      prescriptions: [{ name: "Ibuprofen", dosage: "400mg", duration: "7 days", instructions: "After food" }],
      doctorNotes: "Acute mechanical back pain; advised exercises and short NSAID course.",
      summary: "Acute back pain managed conservatively with NSAID and physiotherapy advice."
    },
    {
      id: "def-3",
      date: "2023-11-15T11:15:00Z",
      vitals: { bloodPressure: "120/80", heartRate: 72, glucose: 99, weight: "70kg", temperature: 98.3 },
      diagnoses: ["Allergic conjunctivitis"],
      prescriptions: [{ name: "Olopatadine drops", dosage: "1 drop", duration: "14 days", instructions: "Twice daily" }],
      doctorNotes: "Improved with ocular antihistamine drops.",
      summary: "Allergic eye symptoms controlled after topical antihistamine."
    },
    {
      id: "def-2",
      date: "2023-07-10T13:00:00Z",
      vitals: { bloodPressure: "118/76", heartRate: 70, glucose: 96, weight: "69kg", temperature: 98.4 },
      diagnoses: ["Skin Rash"],
      prescriptions: [{ name: "Hydrocortisone cream", dosage: "Apply thin layer", duration: "10 days" }],
      doctorNotes: "Probable contact dermatitis; topical steroid advised.",
      summary: "Contact dermatitis treated with topical steroid and avoidance measures."
    },
    {
      id: "def-1",
      date: "2022-12-01T10:00:00Z",
      vitals: { bloodPressure: "121/79", heartRate: 73, glucose: 98, weight: "70kg", temperature: 98.4 },
      diagnoses: ["General Checkup"],
      prescriptions: [{ name: "Vitamin D", dosage: "1000 IU", duration: "90 days" }],
      doctorNotes: "Vitamin D low; supplementation started.",
      summary: "Preventive supplementation following lab findings."
    }
  ]
};

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
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
    const [selectedHistoryPatient, setSelectedHistoryPatient] = useState<{
      patientId: string;
      patientName: string;
      records: MedicalRecord[];
    } | null>(null);
    const [showReviewModal, setShowReviewModal] = useState<{open: boolean, appointmentId: string | null}>({open: false, appointmentId: null});
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [hasReviewed, setHasReviewed] = useState<Record<string, boolean>>({});
    const router = useRouter();

    // Check if appointment has been reviewed
    const checkIfReviewed = useCallback(async (appointmentId: string) => {
      try {
        const response = await fetch(`https://json-server-7wzo.onrender.com/reviews?appointmentId=${appointmentId}`);
        if (!response.ok) return false;
        const reviews = await response.json();
        return reviews.length > 0;
      } catch (error) {
        console.error("Error checking reviews:", error);
        return false;
      }
    }, []);

    // Update hasReviewed state when appointments change
    useEffect(() => {
      const updateReviewStatus = async () => {
        const reviewStatus: Record<string, boolean> = {};
        for (const app of appointments) {
          if (app.status === 'completed') {
            reviewStatus[app.id] = await checkIfReviewed(app.id);
          }
        }
        setHasReviewed(reviewStatus);
      };
      
      if (appointments.length > 0) {
        updateReviewStatus();
      }
    }, [appointments, checkIfReviewed]);

    const normalizeDate = (date: string | Timestamp | Date): Date => {
        if (date instanceof Timestamp) return date.toDate();
        if (typeof date === 'string') return new Date(date);
        return date;
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

    const calculateTimeRemaining = useCallback((date: string | Timestamp | Date, time: string): string => {
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

    const handleViewPrescriptions = async (appointmentId: string) => {
  try {
    console.log('Fetching prescription for:', appointmentId);
    
    // Check if this is a Firebase appointment (app11+)
    if (appointmentId.startsWith('app') && parseInt(appointmentId.replace('app', '')) >= 11) {
      // Fetch from Firebase
      const q = query(
        collection(db, "prescriptions"),
        where("appointmentId", "==", appointmentId),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        setSelectedPrescription(doc.data() as Prescription);
        setIsPrescriptionModalOpen(true);
        return; // Explicit return
      }
    }
    
    // Fallback to JSON server for app1-app10
    const response = await fetch(
      `https://json-server-7wzo.onrender.com/prescriptions?appointmentId=${appointmentId}`
    );
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Prescription data:', data);
    
    if (data.length > 0) {
      setSelectedPrescription(data[0]);
      setIsPrescriptionModalOpen(true);
    } else {
      alert(`No prescription found for appointment ${appointmentId}`);
    }
  } catch (error) {
    console.error('Error fetching prescription:', error);
    alert(`Failed to load prescription: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

    const handleDownloadPdf = () => {
        if (!selectedPrescription) {
            console.error('No prescription selected for download');
            return;
        }

        const doc = new jsPDF();

        // Add clinic header
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 139);
        doc.text("HEALTH CHOICE CLINIC", 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text("Riverside St, Bingham, NY 130, USA", 105, 28, { align: 'center' });
        doc.text("youremail@companyname.com / yourwebsite.com", 105, 34, { align: 'center' });

        // Add doctor info
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Dr. Jane Doe, M.D.", 20, 50);
        doc.setFontSize(12);
        doc.text("Medical Physician", 20, 56);
        doc.text("License No: MP-456789", 20, 62);
        doc.text(`Date: ${new Date(selectedPrescription.date).toLocaleDateString()}`, 160, 50);

        // Add patient info
        doc.setFontSize(14);
        doc.text("Patient Information", 20, 80);
        doc.setFontSize(12);
        doc.text(`Name: ${selectedPrescription.patientName}`, 20, 88);
        doc.text(`Age: ${appointments.find(a => a.id === selectedPrescription.appointmentId)?.patientAge || 'N/A'}`, 20, 94);
        doc.text("Address: Matthew Rd, Vestal, NY 135, USA", 20, 100);
        doc.text("Contact: 320-988-3840", 20, 106);

        // Add medicines
        doc.setFontSize(14);
        doc.text("Prescribed Medicines", 20, 130);
        let yPosition = 138;
        selectedPrescription.medicines.forEach((med) => {
            doc.setFontSize(12);
            doc.text(`• ${med.name}, ${med.dosage}`, 25, yPosition);
            doc.text(`Instructions: ${med.instructions || 'Take as directed'}`, 30, yPosition + 6);
            doc.text(`Duration: ${med.duration}`, 30, yPosition + 12);
            yPosition += 20;
        });

        // Add notes if exists
        if (selectedPrescription.notes) {
            doc.setFontSize(14);
            doc.text("Doctor's Notes", 20, yPosition + 10);
            doc.setFontSize(12);
            const splitText = doc.splitTextToSize(selectedPrescription.notes, 170);
            doc.text(splitText, 20, yPosition + 18);
            yPosition += 10 + splitText.length * 6;
        }

        // Add signature lines
        doc.setFontSize(12);
        doc.text("________________________", 40, yPosition + 30);
        doc.text("Doctor's Signature", 40, yPosition + 36);
        doc.text("________________________", 140, yPosition + 30);
        doc.text("Patient's Signature", 140, yPosition + 36);

        // Save the PDF
        doc.save(`prescription_${selectedPrescription.appointmentId}.pdf`);
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

            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const docId = docSnap.id;

                if (!data.patientId || data.patientId !== uid) return;

                let appointmentDate: Date;
                try {
                    if (data.date instanceof Timestamp) {
                        appointmentDate = data.date.toDate();
                    } else if (typeof data.date === 'string') {
                        appointmentDate = new Date(data.date);
                    } else if (data.date instanceof Date) {
                        appointmentDate = data.date;
                    } else {
                        throw new Error("Invalid date format");
                    }

                    if (isNaN(appointmentDate.getTime())) {
                        throw new Error("Invalid date value");
                    }
                } catch (err) {
                    console.warn(`Skipping ${docId} - invalid date`, data.date, err);
                    return;
                }

                if (!data.time || typeof data.time !== 'string') {
                    console.warn(`Skipping ${docId} - invalid time`, data.time);
                    return;
                }

                const [hours, minutes] = data.time.split(':').map(Number);
                const appointmentDateTime = new Date(appointmentDate);
                appointmentDateTime.setHours(hours, minutes, 0, 0);

                let status = data.status || 'upcoming';
                
                if (['booked', 'confirmed'].includes(status)) {
                    status = 'upcoming';
                }
                
                if (appointmentDateTime < now && ['upcoming', 'rescheduled'].includes(status)) {
                    status = 'completed';
                    updatePromises.push(
                        updateDoc(doc(db, "appointments", docId), {
                            status: 'completed'
                        })
                    );
                }

                const appointment: Appointment = {
                    id: docId,
                    doctorId: data.doctorId || '',
                    doctorName: data.doctorName || 'Unknown Doctor',
                    doctorSpecialization: data.doctorSpecialization || 'General Practitioner',
                    doctorAvatar: data.doctorAvatar || '/default-avatar.png',
                    date: appointmentDate.toISOString().split('T')[0],
                    time: data.time,
                    type: data.type || 'Clinic Visit',
                    token: data.token || '',
                    patientName: data.patientName || '',
                    patientAge: data.patientAge || '',
                    patientId: data.patientId,
                    status: status,
                    consultationFee: data.consultationFee || 0,
                    location: data.location || '',
                    createdAt: data.createdAt || new Date().toISOString(),
                    paymentMethod: data.paymentMethod || 'unknown',
                    timeRemaining: calculateTimeRemaining(appointmentDate, data.time)
                };

                allAppointments.push(appointment);
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

    // History handlers
    const handleViewHistory = (appointment: Appointment) => {
      const records = (STATIC_HISTORY[appointment.patientId] || STATIC_HISTORY['default'])
        .slice()
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setSelectedHistoryPatient({ patientId: appointment.patientId, patientName: appointment.patientName, records });
    };

    const handleDownloadHistoryPdf = () => {
      if (!selectedHistoryPatient) return;
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      let y = 18;

      // Header
      doc.setFontSize(18);
      doc.setTextColor(10, 60, 120);
      doc.text('Health Choice Clinic', pageWidth / 2, y, { align: 'center' });
      y += 7;
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text('Riverside St, Bingham, NY | contact@healthchoice.com', pageWidth / 2, y, { align: 'center' });
      y += 10;

      // Patient info
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text(`Patient: ${selectedHistoryPatient.patientName}`, 14, y);
      doc.text(`Patient ID: ${selectedHistoryPatient.patientId}`, 140, y);
      y += 8;
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
      y += 10;

      // For each record
      for (let i = 0; i < selectedHistoryPatient.records.length; i++) {
        const rec = selectedHistoryPatient.records[i];

        // Page break if nearing bottom
        if (y > 270) { doc.addPage(); y = 18; }

        doc.setDrawColor(220);
        doc.setFillColor(245, 245, 245);
        doc.rect(12, y - 6, pageWidth - 24, 6, 'F');
        doc.setFontSize(12);
        doc.setTextColor(20, 55, 90);
        doc.text(`Appointment: ${new Date(rec.date).toLocaleString()}`, 14, y);
        y += 6;

        if (rec.summary) {
          doc.setFontSize(11);
          doc.setTextColor(40, 40, 40);
          const ssplit = doc.splitTextToSize(`Summary: ${rec.summary}`, pageWidth - 28);
          doc.text(ssplit, 14, y);
          y += ssplit.length * 6 + 2;
        }

        // Vitals block
        doc.setFontSize(11);
        doc.setTextColor(30, 30, 30);
        doc.text('Vitals:', 14, y);
        y += 6;
        const vitalsText = [
          `Blood Pressure: ${rec.vitals.bloodPressure}`,
          `Heart Rate: ${rec.vitals.heartRate} bpm`,
          `Glucose: ${rec.vitals.glucose} mg/dL`,
          `Weight: ${rec.vitals.weight}`,
          `Temperature: ${rec.vitals.temperature} °F`
        ];
        vitalsText.forEach(t => { doc.text(t, 18, y); y += 6; });

        // Diagnoses
        y += 2;
        doc.setFontSize(11);
        doc.text('Diagnoses:', 14, y); y += 6;
        rec.diagnoses.forEach(d => { doc.text(`- ${d}`, 18, y); y += 6; });

        // Prescriptions
        y += 2;
        doc.setFontSize(11);
        doc.text('Prescriptions:', 14, y); y += 6;
        if (rec.prescriptions.length === 0) {
          doc.text('- None', 18, y); y += 6;
        } else {
          rec.prescriptions.forEach(p => {
            const line = `${p.name} — ${p.dosage} (${p.duration})${p.instructions ? ' - ' + p.instructions : ''}`;
            const split = doc.splitTextToSize(line, pageWidth - 36);
            doc.text(split, 18, y);
            y += split.length * 6;
          });
        }

        // Doctor notes
        y += 2;
        doc.setFontSize(11);
        doc.text("Doctor's Notes:", 14, y); y += 6;
        const notesSplit = doc.splitTextToSize(rec.doctorNotes || '-', pageWidth - 36);
        doc.text(notesSplit, 18, y);
        y += notesSplit.length * 6;

        // Draw separator
        y += 4;
        doc.setDrawColor(230);
        doc.line(14, y, pageWidth - 14, y);
        y += 8;

        // Add page break as needed in the loop
        if (y > 260 && i < selectedHistoryPatient.records.length - 1) {
          doc.addPage();
          y = 18;
        }
      }

      // Footer & save
      const fileName = `history_${selectedHistoryPatient.patientId}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    };

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
                                <button
                                    onClick={() => handleViewPrescriptions(app.id)}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 mt-2 flex items-center gap-2"
                                    disabled={loading}
                                >
                                    {loading ? 'Loading...' : (<><FaFilePrescription /> View Prescription</>)}
                                </button>

                                {/* NEW: View History button */}
                                <button
                                  onClick={() => handleViewHistory(app)}
                                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 mt-2 flex items-center gap-2"
                                >
                                  <FaFileAlt /> View History
                                </button>
                                {/* Leave Review button - now appears below View History */}
                                {app.status === 'completed' && (
                                    <button
                                        onClick={() => setShowReviewModal({open: true, appointmentId: app.id})}
                                        className={`px-4 py-2 rounded-lg mt-2 flex items-center gap-2 ${
                                            hasReviewed[app.id] 
                                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                                                : 'bg-green-600 text-white hover:bg-green-700'
                                        }`}
                                        disabled={hasReviewed[app.id]}
                                    >
                                        <FaStar /> {hasReviewed[app.id] ? 'Review Submitted' : 'Leave Review'}
                                    </button>
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
                .bg-medical-pattern {
                    background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2393c5fd' fill-opacity='0.4'%3E%3Cpath d='M20 40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0-20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm40-40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2z'/%3E%3Cpath d='M42 20h-4v-4h-4v4h-4v4h4v4h4v-4h4v-4z'/%3E%3C/g%3E%3C/svg%3E");
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {upcomingAppointments.map(app => renderAppointmentCard(app))}
                            </div>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {pastAppointments.map(app => renderAppointmentCard(app, true))}
                            </div>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {canceledAppointments.map(app => renderAppointmentCard(app, true))}
                            </div>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {rescheduledAppointments.map(app => renderAppointmentCard(app))}
                            </div>
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

            {/* Prescription Modal */}
            <AnimatePresence>
                {isPrescriptionModalOpen && selectedPrescription && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 overflow-y-auto">
                        <div className="relative bg-white w-full max-w-[210mm] mx-auto my-8 shadow-2xl font-serif">
                            {/* Watermark */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-20">
                                <p className="text-[120px] font-extrabold text-blue-100 transform -rotate-12 select-none">
                                    Health Choice Clinic
                                </p>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setIsPrescriptionModalOpen(false)}
                                className="absolute top-6 right-6 text-gray-500 hover:text-gray-700 z-50 transition-transform hover:scale-110"
                            >
                                <FaTimes size={24} />
                            </button>

                            {/* Header */}
                            <div className="relative z-10 px-12 pt-12 pb-4 border-b-4 border-blue-600 border-opacity-70">
                                <h1 className="text-4xl font-bold text-gray-900">Health Choice Clinic</h1>
                                <p className="text-gray-600">Riverside St, Bingham, NY</p>
                                <p className="text-gray-600 text-sm">youremail@companyname.com | www.yourwebsite.com</p>

                                {/* Doctor Info */}
                                <div className="mt-6">
                                    <h2 className="text-2xl font-extrabold text-blue-800 tracking-wide">Dr. Jane Doe, M.D.</h2>
                                    <p className="text-gray-700 text-lg font-semibold">General Physician</p>
                                    <p className="text-gray-500 text-sm">License No: MP-456789</p>
                                </div>

                                <p className="text-right text-gray-600 font-semibold mt-4">
                                    Date: {new Date(selectedPrescription.date).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Patient Info */}
                            <div className="px-12 py-6 relative z-10">
                                <h2 className="text-xl font-bold text-purple-800 mb-2">Patient Information</h2>
                                <p className="text-gray-700">Name: {selectedPrescription.patientName}</p>
                                <p className="text-gray-700">
                                    Age: {appointments.find(a => a.id === selectedPrescription.appointmentId)?.patientAge || 'N/A'}
                                </p>
                            </div>

                            {/* Medicines Table */}
                            <div className="px-12 py-6 relative z-10">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Prescribed Medicines</h2>
                                <table className="w-full border border-gray-300 rounded-lg overflow-hidden text-left">
                                    <thead className="bg-blue-100 text-blue-800">
                                        <tr>
                                            <th className="p-3">Medicine</th>
                                            <th className="p-3">Dosage</th>
                                            <th className="p-3">Duration</th>
                                            <th className="p-3">Instructions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedPrescription.medicines.map((med, index) => (
                                            <tr key={index} className="border-t border-gray-200">
                                                <td className="p-3">{med.name}</td>
                                                <td className="p-3">{med.dosage}</td>
                                                <td className="p-3">{med.duration}</td>
                                                <td className="p-3">{med.instructions || 'Take as directed'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Notes */}
                            {selectedPrescription.notes && (
                                <div className="px-12 py-6 relative z-10">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2"><p>{"Doctor's Notes"}</p></h2>
                                    <p className="text-gray-700 leading-relaxed">{selectedPrescription.notes}</p>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="px-12 py-8 relative z-10 border-t border-gray-300">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 w-48 mb-2"></div>
                                        <p className="text-gray-600 uppercase font-medium text-sm">{"Doctor's Signature"}</p>

                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-800 text-lg">Health Choice Clinic</p>
                                        <p className="text-gray-600 text-sm">Riverside St, Bingham, NY</p>
                                        <p className="text-gray-600 text-sm">youremail@companyname.com</p>
                                    </div>
                                </div>
                            </div>

                            {/* Download Button */}
                            <div className="px-12 py-6 relative z-10 flex justify-center">
                                <button
                                    onClick={handleDownloadPdf}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center gap-2 shadow-lg transition-colors"
                                >
                                    <FaDownload /> Download PDF
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* History Modal (NEW) */}
            <AnimatePresence>
              {selectedHistoryPatient && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 flex items-center justify-center p-4 z-50"
                  onClick={() => setSelectedHistoryPatient(null)}
                >
                  {/* light overlay so background doesn't go black */}
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-sm pointer-events-auto" />

                  <motion.div
                    initial={{ scale: 0.98, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.98, y: 30 }}
                    className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl p-6 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{selectedHistoryPatient.patientName} — History</h3>
                        <p className="text-sm text-gray-500">Patient ID: {selectedHistoryPatient.patientId}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedHistoryPatient(null)}
                          className="text-gray-500 hover:text-gray-700 bg-white/60 hover:bg-white/80 rounded-full p-2 shadow-sm transition"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>

                    <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-700">Records</h4>
                        <p className="mt-1 text-gray-900">{selectedHistoryPatient.records.length} entries</p>
                      </div>
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-700">Last Visit</h4>
                        <p className="mt-1 text-gray-900">{selectedHistoryPatient.records.length > 0 ? new Date(selectedHistoryPatient.records[0].date).toLocaleDateString() : '—'}</p>
                      </div>
                      <div className="p-4 bg-white rounded-lg flex items-center justify-end">
                        <button onClick={handleDownloadHistoryPdf} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 shadow">
                          <FaDownload /> Download as PDF
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {selectedHistoryPatient.records.map(rec => (
                        <div key={rec.id} className="border rounded-lg p-4 bg-white shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-sm text-gray-600">{new Date(rec.date).toLocaleString()}</div>
                            <div className="text-sm text-gray-500">Record ID: {rec.id}</div>
                          </div>

                          {rec.summary && (
                            <div className="mb-2">
                              <h5 className="text-sm font-semibold text-indigo-700">Summary</h5>
                              <p className="text-sm text-gray-700">{rec.summary}</p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-sm font-semibold mb-2 text-indigo-800">Vitals</h5>
                              <div className="grid grid-cols-1 gap-1 text-sm text-gray-700">
                                <div><strong>Blood Pressure:</strong> {rec.vitals.bloodPressure}</div>
                                <div><strong>Heart Rate:</strong> {rec.vitals.heartRate} bpm</div>
                                <div><strong>Glucose:</strong> {rec.vitals.glucose} mg/dL</div>
                                <div><strong>Weight:</strong> {rec.vitals.weight}</div>
                                <div><strong>Temperature:</strong> {rec.vitals.temperature} °F</div>
                              </div>
                            </div>

                            <div>
                              <h5 className="text-sm font-semibold mb-2 text-indigo-800">Diagnoses & Prescriptions</h5>
                              <div className="text-sm text-gray-700">
                                <strong>Diagnoses:</strong>
                                <ul className="list-disc list-inside mt-1">
                                  {rec.diagnoses.map((d, i) => <li key={i}>{d}</li>)}
                                </ul>

                                <strong className="mt-2 block">Prescriptions:</strong>
                                <ul className="list-disc list-inside mt-1">
                                  {rec.prescriptions.length === 0 ? <li>None</li> : rec.prescriptions.map((p, i) => <li key={i}>{p.name} — {p.dosage} ({p.duration}){p.instructions ? ` — ${p.instructions}` : ''}</li>)}
                                </ul>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3">
                            <h5 className="text-sm font-semibold mb-1 text-indigo-800">Doctor Notes</h5>
                            <p className="text-sm text-gray-700">{rec.doctorNotes}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Review Modal */}
<AnimatePresence>
  {showReviewModal.open && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={() => setShowReviewModal({open: false, appointmentId: null})}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowReviewModal({open: false, appointmentId: null})}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes size={24} />
        </button>

        <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Rate Your Experience
        </h3>

        <div className="flex justify-center mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              size={32}
              className={`mx-1 cursor-pointer transition-colors ${
                (hoverRating || reviewRating) >= star
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setReviewRating(star)}
            />
          ))}
        </div>

        <div className="mb-6">
          <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 mb-2">
            Your Feedback
          </label>
          <textarea
            id="reviewText"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="How was your experience with the doctor?"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
        </div>

        <button
          onClick={async () => {
            if (!reviewRating || !reviewText || !showReviewModal.appointmentId) return;
            
            setIsSubmittingReview(true);
            try {
              const appointment = appointments.find(a => a.id === showReviewModal.appointmentId);
              if (!appointment) throw new Error("Appointment not found");
              
              const newReview: Review = {
                appointmentId: showReviewModal.appointmentId,
                patientId: user?.uid || '',
                patientName: appointment.patientName,
                patientPhoto: "https://randomuser.me/api/portraits/lego/1.jpg", // Default or fetch from user profile
                doctorId: appointment.doctorId,
                rating: reviewRating,
                reviewText: reviewText,
                reviewDate: new Date().toISOString(),
                consultationType: appointment.type
              };

              // Save to JSON server
              const response = await fetch('https://json-server-7wzo.onrender.com/reviews', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(newReview),
              });

              if (!response.ok) throw new Error("Failed to submit review");

              // Success - reset form
              setReviewRating(0);
              setReviewText('');
              setShowReviewModal({open: false, appointmentId: null});
              
              // Show success message
              alert("Thank you for your feedback!");
            } catch (error) {
              console.error("Error submitting review:", error);
              alert("Failed to submit review. Please try again.");
            } finally {
              setIsSubmittingReview(false);
            }
          }}
          disabled={!reviewRating || !reviewText || isSubmittingReview}
          className={`w-full py-3 rounded-lg text-white font-bold ${
            (!reviewRating || !reviewText || isSubmittingReview)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
        </button>
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