import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  FieldValue
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

// Firebase-specific functions (replacing localStorage functions)
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