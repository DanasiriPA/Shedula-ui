import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  FieldValue,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type Slot = {
  time: string;
  available: boolean;
};

// Patient-facing Appointment interface (updated for Firebase)
export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorAvatar: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: 'Online Consultation' | 'Clinic Visit';
  token: string;
  patientName: string;
  patientAge: string;
  patientId: string;
  paymentMethod: 'cash' | 'online';
  status: 'Pending' | 'Accepted' | 'Rescheduled' | 'Cancelled' | 'Completed';
  reason?: string;
  consultationFee: number;
  location: string;
  createdAt: Timestamp | FieldValue;
}

// Detailed Appointment (admin/dashboard view)
export type DetailedAppointment = {
  id: number;
  doctorId: string;
  doctorName: string;
  avatar: string;
  specialization: string;
  date: string;
  time: string;
  token: string;
  status: 'Upcoming' | 'Visited' | 'Cancelled' | 'Completed' | 'Confirmed';
  createdAt: string;
  notes: string;
  rating: number;
  patientName: string;
  patientAge: string;
  description?: string;
};

// Medicine interfaces
export interface Medicine {
  id: string;
  name: string;
  firstLetterId: string;
  category: string;
  initialQuantity: number;
  pricePerUnit: number;
  description: string;
}

export interface MedicineOrder {
  orderId: string;
  medicine: Medicine;
  quantity: number;
  totalPrice: number;
  customerName: string;
  city: string;
  address: string;
  phoneNumber: string;
  orderDate: string; // YYYY-MM-DD
  deliveryStatus: 'pending' | 'delivered' | 'cancelled';
  deliveryNote: string;
}

// Doctor interfaces
export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  education: string;
  avatar: string;
  experience: number;
  location: string;
  rating: string;
  available: boolean;
  description: string;
  clinicPrice: number;
  onlinePrice: number;
  availableSlots: {
    online: Record<string, Slot[]>;
    clinic: Record<string, Slot[]>;
  };
}

export interface DoctorProfile {
  id: string;
  name: string;
  specialization: string;
  education: string;
  experience: number;
  location: string;
  rating: string;
  avatar: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bio: string;
  available: boolean;
  clinicPrice: number;
  onlinePrice: number;
  availableSlots: {
    online: Record<string, Slot[]>;
    clinic: Record<string, Slot[]>;
  };
  totalPatientsTreated: number;
  clinicVisitsAttended: number;
  onlineConsultationsAttended: number;
  revenueGenerated: number;
  consultationTypeBreakdown: { type: string; value: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
  description: string;
}

// Doctor-facing PatientAppointment interface
export interface PatientAppointment {
  id: string;
  patientName: string;
  patientId: string;
  type: 'Clinic Visit' | 'Online Consultation';
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'Pending' | 'Accepted' | 'Rescheduled' | 'Cancelled' | 'Completed';
  reason: string;
  doctorNotes?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorAvatar: string;
  token: string;
  patientAge: string;
  paymentMethod: 'cash' | 'online';
  consultationFee: number;
  location: string;
  createdAt: Timestamp | FieldValue;
}

// DoctorPatient interface
export interface DoctorPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  email: string;
  lastVisit: string;
  conditions: string[];
  medications: string[];
  notes: string;
}

// Prescription interfaces
export interface MedicinePrescription {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string; // YYYY-MM-DD
  medicines: MedicinePrescription[];
  notes: string;
  createdAt: Timestamp | FieldValue;
  status: 'active' | 'completed' | 'cancelled';
}

// Firebase-specific functions
export const getAppointments = async (userId: string): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, "appointments"),
      where("patientId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Appointment));
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
};

export const addAppointment = async (appointment: Omit<Appointment, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "appointments"), appointment);
    return docRef.id;
  } catch (error) {
    console.error("Error adding appointment:", error);
    throw error;
  }
};

export const updateAppointment = async (appointmentId: string, updates: Partial<Appointment>): Promise<void> => {
  try {
    const appointmentRef = doc(db, "appointments", appointmentId);
    await updateDoc(appointmentRef, updates);
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw error;
  }
};

export const deleteAppointment = async (appointmentId: string): Promise<void> => {
  try {
    const appointmentRef = doc(db, "appointments", appointmentId);
    await deleteDoc(appointmentRef);
  } catch (error) {
    console.error("Error deleting appointment:", error);
    throw error;
  }
};

// Prescription Firebase functions
export const getPrescriptions = async (doctorId: string): Promise<Prescription[]> => {
  try {
    const q = query(
      collection(db, "prescriptions"),
      where("doctorId", "==", doctorId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Prescription));
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return [];
  }
};

export const getPrescriptionById = async (id: string): Promise<Prescription | null> => {
  try {
    const docRef = doc(db, "prescriptions", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Prescription : null;
  } catch (error) {
    console.error("Error fetching prescription:", error);
    return null;
  }
};

export const addPrescription = async (prescription: Omit<Prescription, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "prescriptions"), {
      ...prescription,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding prescription:", error);
    throw error;
  }
};

export const updatePrescription = async (prescriptionId: string, updates: Partial<Prescription>): Promise<void> => {
  try {
    const prescriptionRef = doc(db, "prescriptions", prescriptionId);
    await updateDoc(prescriptionRef, updates);
  } catch (error) {
    console.error("Error updating prescription:", error);
    throw error;
  }
};

export const deletePrescription = async (prescriptionId: string): Promise<void> => {
  try {
    const prescriptionRef = doc(db, "prescriptions", prescriptionId);
    await deleteDoc(prescriptionRef);
  } catch (error) {
    console.error("Error deleting prescription:", error);
    throw error;
  }
};

export const getPrescriptionsByPatient = async (patientId: string): Promise<Prescription[]> => {
  try {
    const q = query(
      collection(db, "prescriptions"),
      where("patientId", "==", patientId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Prescription));
  } catch (error) {
    console.error("Error fetching patient prescriptions:", error);
    return [];
  }
};