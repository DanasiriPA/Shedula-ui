"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, limit } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { enUS } from 'date-fns/locale/en-US';
import { 
  FaCalendarCheck, FaClock, FaCalendarTimes, FaTimes, FaUserMd, FaChevronLeft, 
  FaUserCircle, FaStethoscope, FaBriefcaseMedical,
  FaMapMarkerAlt, FaRupeeSign, FaEdit, FaTrash, FaLaptopMedical, FaCalendarAlt,
  FaSignOutAlt, FaListUl, FaFilePrescription, FaDownload, FaFileAlt,FaStar
} from 'react-icons/fa';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from "@/lib/utils";
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import withDragAndDrop, { EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, addMinutes, isBefore } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import jsPDF from "jspdf";


interface Appointment {
    id: string;
    appointmentId?: string;
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

// Updated Prescription interface to include frequency/quantities (and legacy qtys)
interface Prescription {
  id: string;
  appointmentId: string;
  patientName: string;
  date: string;
  medicines: {
    name: string;
    dosage: string;
    duration: string;
    instructions?: string;
    frequency?: string[]; // e.g. ["Morning", "Night"]
    quantities?: Record<string, number>; // e.g. { Morning: 1, Night: 2 }
    // legacy fields:
    quantity?: number;
    qty?: number;
  }[];
  notes: string;
  status: string;
}

// New small types for static history
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

interface Medicine {
  name?: string;
  dosage?: string;
  duration?: string;
  instructions?: string;
  frequency?: string[];
  quantities?: Record<string, number>;
  quantity?: number;
  qty?: number;
}

/*
  STATIC_HISTORY: Add or expand entries to match your appointment.patientId values.
  This is static, in-code data (no API). Each patient has 5 past appointment records with a summary.
*/
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
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

    // History modal state
    const [selectedHistoryPatient, setSelectedHistoryPatient] = useState<{
      patientId: string;
      patientName: string;
      records: MedicalRecord[];
    } | null>(null);


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
        return;
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


// Helper - compute readable frequency string for a medicine
const ALL_SLOTS: string[] = ['Morning', 'Afternoon', 'Night'];
const getMedicineFrequencyDisplay = (med: Medicine): string => {
  if (!med) return '';

  // prefer explicit frequency array
  const freqArr: string[] = Array.isArray(med.frequency) ? med.frequency : [];

  // quantities object if present
  const quantities: Record<string, number> = med.quantities && typeof med.quantities === 'object'
    ? med.quantities
    : {};

  // legacy single qty
  const singleQty = typeof med.quantity === 'number' ? med.quantity
    : (typeof med.qty === 'number' ? med.qty : undefined);

  // If we have a frequency array, show each slot with quantity if known
  if (freqArr.length > 0) {
    return freqArr.map(slot => {
      const q = quantities?.[slot];
      if (typeof q === 'number' && q > 0) return `${slot} (${q})`;
      // fallback to singleQty if available
      if (singleQty !== undefined) return `${slot} (${singleQty})`;
      return slot;
    }).join(', ');
  }

  // Otherwise, infer from quantities object (slots with qty>0)
  const inferred = ALL_SLOTS.filter(s => (quantities?.[s] ?? 0) > 0)
    .map(s => `${s} (${quantities[s]})`);

  if (inferred.length > 0) return inferred.join(', ');

  // If legacy singleQty and no frequency info, show generic
  if (singleQty !== undefined) return `Per dose (${singleQty})`;

  // nothing
  return 'Not specified';
};


const handleDownloadPdf = () => {
  if (!selectedPrescription) {
    console.error('No prescription selected for download');
    return;
  }
  const doc = new jsPDF();

  // Add clinic header
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 139); // Dark blue
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

  // Add medicines table
  doc.setFontSize(14);
  doc.text("Prescribed Medicines", 20, 130);
  
  // Table headers
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(59, 130, 246); // Blue header
  doc.rect(20, 136, 170, 10, 'F');

  // Column positions and widths (within 20..190 box)
  const nameX = 22;
  const nameW = 60;
  const dosageX = nameX + nameW;
  const dosageW = 30;
  const durationX = dosageX + dosageW;
  const durationW = 30;
  const freqX = durationX + durationW;
  const freqW = 25;
  const instrX = freqX + freqW;
  const instrW = 23; // totals to 168, fits within 170 box

  doc.text("Medicine", nameX, 142);
  doc.text("Dosage", dosageX + 2, 142);
  doc.text("Duration", durationX + 2, 142);
  doc.text("Frequency", freqX + 2, 142); // NEW
  doc.text("Instructions", instrX + 2, 142);

  // Table rows
  doc.setTextColor(0, 0, 0);
  let yPosition = 148;

  const pageBottomLimit = 270;

  selectedPrescription.medicines.forEach((med) => {
    // Page break if needed
    if (yPosition > pageBottomLimit) {
      doc.addPage();
      yPosition = 18;
    }

    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPosition, 190, yPosition);

    // Prepare splitted texts to fit column widths
    const nameLines = doc.splitTextToSize(String(med.name || ''), nameW - 2);
    const dosageLines = doc.splitTextToSize(String(med.dosage || ''), dosageW - 2);
    const durationLines = doc.splitTextToSize(String(med.duration || ''), durationW - 2);
    const freqText = getMedicineFrequencyDisplay(med);
    const freqLines = doc.splitTextToSize(freqText, freqW - 2);
    const instrLines = doc.splitTextToSize(String(med.instructions || 'Take as directed'), instrW - 2);

    const maxLines = Math.max(nameLines.length, dosageLines.length, durationLines.length, freqLines.length, instrLines.length);

    // Write each line row-wise
    for (let i = 0; i < maxLines; i++) {
      const lineY = yPosition + 6 + (i * 6);
      doc.setFontSize(11);
      if (i < nameLines.length) doc.text(String(nameLines[i]), nameX, lineY);
      if (i < dosageLines.length) doc.text(String(dosageLines[i]), dosageX + 2, lineY);
      if (i < durationLines.length) doc.text(String(durationLines[i]), durationX + 2, lineY);
      if (i < freqLines.length) doc.text(String(freqLines[i]), freqX + 2, lineY);
      if (i < instrLines.length) doc.text(String(instrLines[i]), instrX + 2, lineY);
    }

    // move yPosition for next row (+ spacing)
    yPosition += Math.max(10, maxLines * 6 + 4);
  });

  // Add notes if exists
  if (selectedPrescription.notes) {
    if (yPosition > pageBottomLimit) {
      doc.addPage();
      yPosition = 18;
    }
    doc.setFontSize(14);
    doc.text("Doctor's Notes", 20, yPosition + 15);
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(selectedPrescription.notes, 170);
    doc.text(splitText, 20, yPosition + 22);
    yPosition += 15 + splitText.length * 6;
  }

  // Add signature lines
  if (yPosition + 40 > 280) {
    doc.addPage();
    yPosition = 220;
  }
  doc.setFontSize(12);
  doc.text("________________________", 40, yPosition + 30);
  doc.text("Doctor's Signature", 40, yPosition + 36);
  doc.text("________________________", 140, yPosition + 30);
  doc.text("Patient's Signature", 140, yPosition + 36);

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Health Choice Clinic - Riverside St, Bingham, NY - contact@healthchoice.com", 105, 290, { align: 'center' });

  // Save the PDF
  doc.save(`prescription_${selectedPrescription.appointmentId}.pdf`);
};

// New: view history handler (static)
const handleViewHistory = (appointment: Appointment) => {
  const records = (STATIC_HISTORY[appointment.patientId] || STATIC_HISTORY['default'])
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  setSelectedHistoryPatient({ patientId: appointment.patientId, patientName: appointment.patientName, records });
};

// New: download history as PDF
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
    // Rounded rect fallback: jsPDF supports rect; keep filled rect to avoid missing plugin
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
  const params = new URLSearchParams(window.location.search);
  const savedId = params.get('appointmentId');
  const isSaved = params.get('prescriptionSaved');

  if (isSaved === 'true' && savedId) {
    // Clean the URL
    window.history.replaceState({}, '', '/doctor/appointments');
    
    // Find the appointment to view
    const targetAppointment = appointments.find(a => 
      a.appointmentId === savedId || a.id === savedId
    );
    if (targetAppointment) {
      handleViewPrescriptions(targetAppointment.appointmentId || targetAppointment.id);
    }
  }
}, [appointments]);

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
<button
  onClick={() => {
    router.push(
      `/doctor/prescriptions/create?patientName=${encodeURIComponent(app.patientName)}&appointmentId=${app.appointmentId || app.id}&patientId=${app.patientId}`
    );
  }}
  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 mt-2"
>
  <FaFilePrescription className="inline mr-2" />
  {app.appointmentId ? 'Edit Prescription' : 'Add Prescription'}
</button>
<div className="space-y-2">
<button
  onClick={() => handleViewPrescriptions(app.id)}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-2 w-full"
>
  <FaFilePrescription className="inline mr-2" />
  View Prescription
</button>

{/* NEW: View History button */}
<button
  onClick={() => handleViewHistory(app)}
  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 mt-2 w-full flex items-center justify-center gap-2"
>
  <FaFileAlt /> View History
</button>

  {/* Prescription Modal */}
{isPrescriptionModalOpen && selectedPrescription && (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 overflow-y-auto">
    <div className="relative bg-white w-full max-w-[210mm] mx-auto my-8 shadow-2xl font-serif prescription-modal">
      {/* Watermark */}
      <div className="watermark">Health Choice Clinic</div>

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
    <tr>{/* No whitespace here */}
      <th className="p-3">Medicine</th>
      <th className="p-3">Dosage</th>
      <th className="p-3">Duration</th>
      <th className="p-3">Frequency</th>
      <th className="p-3">Instructions</th>
    </tr>
  </thead>
  <tbody>
    {selectedPrescription.medicines.map((med, index) => (
      <tr key={index} className="border-t border-gray-200">{/* No whitespace here */}
        <td className="p-3 align-top">{med.name}</td>
        <td className="p-3 align-top">{med.dosage}</td>
        <td className="p-3 align-top">{med.duration}</td>
        <td className="p-3 align-top">
          <div className="text-sm text-gray-700">
            {getMedicineFrequencyDisplay(med)}
          </div>
        </td>
        <td className="p-3 align-top">{med.instructions || 'Take as directed'}</td>
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
)}</div>
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

                {/* NEW: History button inside details */}
                <button
                  onClick={() => handleViewHistory(app)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <FaFileAlt /> View History
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
                /* Ensure modal content is properly positioned */
                .prescription-modal {
                    max-height: calc(100vh - 4rem);
                    overflow-y: auto;
                }
                
                /* Watermark styling */
                .watermark {
                    position: absolute;
                    opacity: 0.06;
                    z-index: 0;
                    pointer-events: none;
                    transform: rotate(-15deg);
                    font-size: 120px;
                    color: #93c5fd;
                    width: 100%;
                    text-align: center;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-15deg);
                }
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
                    border-left: 1px solid #e5eeb;
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
                    <motion.button 
            onClick={() => router.push("/doctor/reviews")} 
            whileHover={{ y: -3, color: "#4F46E5" }} 
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 bg-blue-50 text-blue-700"
          >
            <FaStar className="text-blue-600" /> Reviews
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
                            // UPDATED: Grid with 2 cards per row on md and up
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* UPDATED: History Modal with light overlay (not black) and theme colors */}
            <AnimatePresence>
              {selectedHistoryPatient && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 flex items-center justify-center p-4 z-50"
                  onClick={() => setSelectedHistoryPatient(null)}
                >
                  {/* light semi-transparent overlay so background doesn't become black */}
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