// lib/appointmentStorage.ts - MODIFIED (Ensure this file includes updateAppointmentDetails)
import { Appointment } from '@/types'; // Assuming you have a types/index.ts or similar

const STORAGE_KEY = 'shedula_appointments';

export const getAppointments = (): Appointment[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  const appointmentsJson = localStorage.getItem(STORAGE_KEY);
  return appointmentsJson ? JSON.parse(appointmentsJson) : [];
};

export const saveAppointment = (appointment: Appointment) => {
  if (typeof window === 'undefined') {
    return;
  }
  const appointments = getAppointments();
  appointments.push(appointment);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
};

export const updateAppointmentStatus = (id: string, status: 'upcoming' | 'cancelled' | 'completed') => {
  if (typeof window === 'undefined') {
    return;
  }
  const appointments = getAppointments();
  const updatedAppointments = appointments.map(app =>
    app.id === id ? { ...app, status } : app
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAppointments));
};

// NEW FUNCTION: To update specific details like date and time
export const updateAppointmentDetails = (id: string, updates: Partial<Appointment>) => {
  if (typeof window === 'undefined') {
    return;
  }
  const appointments = getAppointments();
  const updatedAppointments = appointments.map(app =>
    app.id === id ? { ...app, ...updates } : app
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAppointments));
};

export const deleteAppointment = (id: string) => {
  if (typeof window === 'undefined') {
    return;
  }
  const appointments = getAppointments();
  const filteredAppointments = appointments.filter(app => app.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredAppointments));
};