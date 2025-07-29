export type Appointment = {
  id: number;
  doctorId: string;
  doctorName: string;
  avatar: string;
  specialization: string;
  date: string;
  time: string;
  token: string;
  status: "upcoming" | "visited" | "cancelled" | "completed" | "confirmed";
  createdAt: string;
  notes: string;
  rating: number;
  patientName: string;
  patientAge: string;
  description?: string;
};