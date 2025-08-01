// src/types/index.ts

export type Slot = {
  time: string;
  available: boolean;
};

// 隼 Patient-facing Appointment interface
export interface Appointment {
  id: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorAvatar: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: 'Online Consultation' | 'Clinic Visit';
  token: string;
  patientName: string;
  patientAge: string;
  paymentMethod: 'cash' | 'online';
  // Standardized status types for patient view
  status: 'Upcoming' | 'Cancelled' | 'Completed';
}

// 隼 Detailed Appointment (admin/dashboard view)
export type DetailedAppointment = {
  id: number;
  doctorId: string;
  doctorName: string;
  avatar: string;
  specialization: string;
  date: string;
  time: string;
  token: string;
  // Standardized status types for admin view
  status: 'Upcoming' | 'Visited' | 'Cancelled' | 'Completed' | 'Confirmed';
  createdAt: string;
  notes: string;
  rating: number;
  patientName: string;
  patientAge: string;
  description?: string;
};

// 隼 Medicine interfaces
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

// 隼 Doctor interfaces
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

// 隼 Doctor-facing PatientAppointment interface
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
}

// 隼 DoctorPatient interface
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

// Functions to interact with localStorage for appointments
export const getAppointments = (): PatientAppointment[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const storedAppointments = localStorage.getItem('patientAppointments');
    const parsedAppointments: any[] = storedAppointments ? JSON.parse(storedAppointments) : [];
    // Explicitly cast properties to their literal types to prevent type widening
    return parsedAppointments.map(app => ({
      ...app,
      type: app.type as PatientAppointment['type'],
      // The status must be cast to one of the defined literals
      status: app.status as PatientAppointment['status'],
      paymentMethod: app.paymentMethod as PatientAppointment['paymentMethod'],
    })) as PatientAppointment[];
  } catch (error) {
    console.error("Failed to parse appointments from localStorage", error);
    return [];
  }
};

export const saveAppointments = (appointments: PatientAppointment[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('patientAppointments', JSON.stringify(appointments));
  }
};

export const addAppointment = (newAppointment: PatientAppointment) => {
  const appointments = getAppointments();
  appointments.push(newAppointment);
  saveAppointments(appointments);
};

export const updateAppointment = (updatedAppointment: PatientAppointment) => {
  const appointments = getAppointments();
  const index = appointments.findIndex(app => app.id === updatedAppointment.id);
  if (index !== -1) {
    appointments[index] = updatedAppointment;
    saveAppointments(appointments);
  }
};

export const deleteAppointment = (appointmentId: string) => {
  const appointments = getAppointments();
  const filteredAppointments = appointments.filter(app => app.id !== appointmentId);
  saveAppointments(filteredAppointments);
};
