// lib/appointments.ts

export type Appointment = {
  id: string; // Changed to string for consistency with Next.js dynamic routes
  doctorId: string;
  doctorName: string;
  avatar: string; // Doctor's avatar, now directly on appointment for display
  specialization: string; // Doctor's specialization, now directly on appointment for display
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
  token: string;
  status: "upcoming" | "visited" | "cancelled" | "completed" | "confirmed";
  createdAt: string; // ISO string or similar format
  notes: string; // Single string for notes
  rating: number; // Single number for rating (0-5)
  patientName: string;
  patientAge: string;
  description?: string; // Optional description for the appointment
  isManualBooking: boolean; // <-- NEW: Add this property to track manual bookings
};

// If you have a function like `getAppointments` in this file,
// ensure it populates `isManualBooking` correctly for your actual data.
// Example:
// export function getAppointments(): Appointment[] {
//   return [
//     {
//       id: "1", doctorId: "doc1", doctorName: "Dr. Anya Sharma", avatar: "/avatars/anya.jpg",
//       specialization: "Gyno", date: "2025-08-15", time: "10:30 AM", token: "A001",
//       status: "upcoming", createdAt: "2025-08-01T10:00:00Z", notes: "First consultation.",
//       rating: 0, patientName: "Jane Doe", patientAge: "30", isManualBooking: true // Example manual booking
//     },
//     {
//       id: "2", doctorId: "doc2", doctorName: "Dr. Rahul Verma", avatar: "/avatars/rahul.jpg",
//       specialization: "Neuro", date: "2025-08-20", time: "02:00 PM", token: "A002",
//       status: "confirmed", createdAt: "2025-08-02T11:00:00Z", notes: "Follow up.",
//       rating: 0, patientName: "John Smith", patientAge: "45", isManualBooking: false // Example non-manual booking
//     },
//     // ... other appointments
//   ];
// }

