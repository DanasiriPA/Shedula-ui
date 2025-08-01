// src/lib/doctorData.ts

// Import interfaces from the centralized types file
import { Slot, DoctorProfile, DoctorPatient, PatientAppointment } from '@/types';

// Helper function to generate mock time slots for a given number of days
const generateSlots = (numDays: number): Record<string, Slot[]> => {
  const slots: Record<string, Slot[]> = {};
  for (let i = 0; i < numDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format

    const daySlots = [];
    for (let hour = 9; hour <= 17; hour++) { // From 9 AM to 5 PM
      daySlots.push({ time: `${hour}:00`, available: Math.random() > 0.3 });
      daySlots.push({ time: `${hour}:30`, available: Math.random() > 0.3 });
    }
    slots[dateString] = daySlots;
  }
  return slots;
};

// Function to generate mock doctor profiles
const generateMockDoctorProfiles = (): DoctorProfile[] => {
  const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow"];
  const specializations = [
    { name: "Gyno", education: "MBBS, MS (Obs & Gyn)", emoji: "👩‍⚕️" },
    { name: "Neuro", education: "MD, DM (Neurology)", emoji: "🧠" },
    { name: "Skin", education: "MBBS, MD (Dermatology)", emoji: "🧴" },
    { name: "Heart", education: "MD, DM (Cardiology)", emoji: "❤️" },
    { name: "Child Specialist", education: "MBBS, DCH", emoji: "🧒" },
    { name: "General", education: "MBBS, MD (General Medicine)", emoji: "🩺" },
    { name: "Ortho", education: "MBBS, MS (Orthopaedics)", emoji: "🦴" },
    { name: "Dental", education: "BDS, MDS (Orthodontics)", emoji: "🦷" },
    { name: "Psychiatry", education: "MD (Psychiatry)", emoji: "🧘" },
    { name: "Oncology", education: "MD, DM (Oncology)", emoji: "🎗️" },
  ];

  const indianNames = [
    "Aarav Sharma", "Ananya Singh", "Rohan Verma", "Diya Gupta", "Kabir Patel", "Ishani Reddy", "Vikram Joshi", "Meera Desai",
    "Arjun Mishra", "Pooja Kumar", "Siddharth Rao", "Janhvi Sharma", "Rahul Singh", "Neha Verma", "Vivek Patel", "Sana Khan",
    "Gaurav Reddy", "Anjali Jain", "Yash Chopra", "Tanya Agarwal", "Kunal Tiwari", "Shruti Gupta", "Aditya Sharma", "Nisha Das",
  ];

  const avatarImages = [
    "https://i.postimg.cc/V6hR452b/download-1.jpg", "https://i.postimg.cc/HxnzQbvg/download-2.jpg", "https://i.postimg.cc/bv3LDmTg/download-3.jpg",
    "https://i.postimg.cc/BvqMnrxt/download-4.jpg", "https://i.postimg.cc/mg3mRL10/download-5.jpg", "https://i.postimg.cc/Sxbgw2R6/images.jpg",
    "https://i.postimg.cc/4N98Lbf4/images-1.jpg", "https://i.postimg.cc/qMPF4DbC/images-10.jpg", "https://i.postimg.cc/DyJDV3gT/images-11.jpg",
    "https://i.postimg.cc/5yjrNhW8/images-12.jpg", "https://i.postimg.cc/1RYTY3DB/images-13.jpg", "https://i.postimg.cc/KjVHK0mw/images-14.jpg",
    "https://i.postimg.cc/7PcsnQyQ/images-2.jpg", "https://i.postimg.cc/SRwgQjrp/images-3.jpg", "https://i.postimg.cc/PJL6k114/images-4.jpg",
    "https://i.postimg.cc/V6Z7TK0v/images-5.jpg", "https://i.postimg.cc/rpJZGV8S/images-6.jpg", "https://i.postimg.cc/j5SgZp5B/images-7.jpg",
    "https://i.postimg.cc/hGg37zqD/images-8.jpg", "https://i.postimg.cc/8zL05d9X/images-9.jpg",
  ];

  const mockDoctors: DoctorProfile[] = [];
  let idCounter = 1;

  for (let i = 0; i < 70; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const spec = specializations[Math.floor(Math.random() * specializations.length)];
    const name = indianNames[Math.floor(Math.random() * indianNames.length)];
    const avatar = avatarImages[Math.floor(Math.random() * avatarImages.length)];

    const totalPatients = 500 + Math.floor(Math.random() * 2000);
    const clinicVisits = Math.floor(totalPatients * (0.4 + Math.random() * 0.3)); // 40-70% clinic
    const onlineConsultations = totalPatients - clinicVisits;
    const revenue = (clinicVisits * (500 + Math.random() * 500) + onlineConsultations * (300 + Math.random() * 300));

    const monthlyRevenueData = Array.from({ length: 12 }, (_, monthIndex) => {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return {
        month: monthNames[monthIndex],
        revenue: Math.floor(revenue / 12 * (0.8 + Math.random() * 0.4)), // Distribute revenue unevenly
      };
    });

    mockDoctors.push({
      id: `dr${idCounter.toString().padStart(3, '0')}`, // Format as dr001, dr002 etc.
      name: `Dr. ${name}`,
      specialization: spec.name,
      education: spec.education,
      avatar: avatar,
      experience: 3 + Math.floor(Math.random() * 25), // 3 to 27 years
      location: city,
      rating: (4.0 + Math.random() * 1.0).toFixed(1), // 4.0 to 5.0
      available: Math.random() > 0.2, // 80% available
      description: `Dr. ${name.split(" ")[0]} is a highly dedicated and compassionate healthcare professional specializing in ${spec.name.toLowerCase()}. With a focus on patient well-being, they offer personalized care and advanced treatment options. Committed to excellence and continuous learning in the field of ${spec.name.toLowerCase()} health.`,
      clinicPrice: Math.floor(Math.random() * 500) + 500, // 500 to 999
      onlinePrice: Math.floor(Math.random() * 300) + 200, // 200 to 499
      availableSlots: {
        clinic: generateSlots(7),
        online: generateSlots(7),
      },
      // Dashboard specific data
      totalPatientsTreated: totalPatients,
      clinicVisitsAttended: clinicVisits,
      onlineConsultationsAttended: onlineConsultations,
      revenueGenerated: Math.floor(revenue),
      consultationTypeBreakdown: [
        { type: "Clinic Visit", value: clinicVisits },
        { type: "Online Consultation", value: onlineConsultations },
      ],
      monthlyRevenue: monthlyRevenueData,
      // Additional fields for profile page
      email: `${name.toLowerCase().replace(/\s/g, '.')}@shedula.com`,
      phone: `+91${Math.floor(1000000000 + Math.random() * 9000000000).toString().substring(0,10)}`,
      dateOfBirth: `19${Math.floor(60 + Math.random() * 20)}-${(Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0')}-${(Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0')}`,
      bio: `Dr. ${name.split(" ")[0]} is a dedicated ${spec.name} with ${3 + Math.floor(Math.random() * 25)} years of experience. They are committed to providing the highest quality of care to their patients in ${city}.`,
    });
    idCounter++;
  }
  return mockDoctors;
};

export const mockDoctorProfiles: DoctorProfile[] = generateMockDoctorProfiles();

// Mock data for doctor login (used in src/app/doctor/login/page.tsx)
export const mockDoctorCredentials = [
  { id: "dr001", password: "password123" }, // Ensure this matches an ID generated above
];


// Mock Patient Data for Doctor's Patient Details Page
export const mockDoctorPatients: DoctorPatient[] = [
  {
    id: "pat001",
    name: "Rahul Sharma",
    age: 45,
    gender: "Male",
    contact: "+919988776655",
    email: "rahul.sharma@example.com",
    lastVisit: "2024-07-20",
    conditions: ["Hypertension", "Type 2 Diabetes"],
    medications: ["Lisinopril", "Metformin"],
    notes: "Patient reports stable blood pressure. Advised to continue current medication and monitor blood sugar regularly. Scheduled follow-up in 3 months.",
  },
  {
    id: "pat002",
    name: "Priya Singh",
    age: 30,
    gender: "Female",
    contact: "+919876543210",
    email: "priya.singh@example.com",
    lastVisit: "2024-07-25",
    conditions: ["Seasonal Allergies"],
    medications: ["Cetirizine"],
    notes: "Patient experiencing mild seasonal allergies. Prescribed antihistamine. Advised to avoid allergens. No immediate follow-up needed.",
  },
  {
    id: "pat003",
    name: "Amit Kumar",
    age: 60,
    gender: "Male",
    contact: "+919123456789",
    email: "amit.kumar@example.com",
    lastVisit: "2024-07-18",
    conditions: ["Osteoarthritis"],
    medications: ["Ibuprofen", "Glucosamine"],
    notes: "Chronic knee pain. Advised physiotherapy and pain management. Discussed lifestyle modifications. Follow-up in 1 month.",
  },
  {
    id: "pat004",
    name: "Sneha Reddy",
    age: 24,
    gender: "Female",
    contact: "+918765432109",
    email: "sneha.reddy@example.com",
    lastVisit: "2024-07-28",
    conditions: ["Anemia (Mild)"],
    medications: ["Iron Supplements"],
    notes: "Fatigue and weakness. Blood tests confirmed mild anemia. Prescribed iron supplements. Recheck blood work in 6 weeks.",
  },
  {
    id: "pat005",
    name: "Vikram Gupta",
    age: 55,
    gender: "Male",
    contact: "+917654321098",
    email: "vikram.gupta@example.com",
    lastVisit: "2024-07-10",
    conditions: ["High Cholesterol"],
    medications: ["Atorvastatin"],
    notes: "Routine check-up. Cholesterol levels elevated. Advised dietary changes and statin medication. Follow-up lipid panel in 3 months.",
  },
];

// Mock Appointment Data for Doctor's Appointments Page
export const mockPatientAppointments: PatientAppointment[] = [
  {
    id: "app001",
    patientName: "Rahul Sharma",
    patientId: "pat001",
    type: "Clinic Visit",
    date: "2025-08-05",
    time: "10:00",
    status: "Pending", // Explicitly typed as 'Pending'
    reason: "Routine check-up for hypertension.",
    doctorId: "dr001",
    doctorName: "Dr. Aarav Sharma",
    doctorSpecialization: "General",
    doctorAvatar: "https://i.postimg.cc/V6hR452b/download-1.jpg",
    token: "ABC12345",
    patientAge: "45",
    paymentMethod: "online",
  },
  {
    id: "app002",
    patientName: "Priya Singh",
    patientId: "pat002",
    type: "Online Consultation",
    date: "2025-08-06",
    time: "14:30",
    status: "Accepted", // Explicitly typed as 'Accepted'
    reason: "Follow-up on seasonal allergies.",
    doctorId: "dr001",
    doctorName: "Dr. Aarav Sharma",
    doctorSpecialization: "General",
    doctorAvatar: "https://i.postimg.cc/V6hR452b/download-1.jpg",
    token: "DEF67890",
    patientAge: "30",
    paymentMethod: "cash",
  },
  {
    id: "app003",
    patientName: "Amit Kumar",
    patientId: "pat003",
    type: "Clinic Visit",
    date: "2025-08-07",
    time: "09:00",
    status: "Pending", // Explicitly typed as 'Pending'
    reason: "New consultation for knee pain.",
    doctorId: "dr001",
    doctorName: "Dr. Aarav Sharma",
    doctorSpecialization: "General",
    doctorAvatar: "https://i.postimg.cc/V6hR452b/download-1.jpg",
    token: "GHI11223",
    patientAge: "60",
    paymentMethod: "online",
  },
  {
    id: "app004",
    patientName: "Sneha Reddy",
    patientId: "pat004",
    type: "Online Consultation",
    date: "2025-08-08",
    time: "11:00",
    status: "Rescheduled", // Explicitly typed as 'Rescheduled'
    reason: "Discussion on iron supplement dosage.",
    doctorId: "dr001",
    doctorName: "Dr. Aarav Sharma",
    doctorSpecialization: "General",
    doctorAvatar: "https://i.postimg.cc/V6hR452b/download-1.jpg",
    token: "JKL44556",
    patientAge: "24",
    paymentMethod: "cash",
  },
  {
    id: "app005",
    patientName: "Vikram Gupta",
    patientId: "pat005",
    type: "Clinic Visit",
    date: "2025-07-29", // Past appointment
    time: "16:00",
    status: "Completed", // Explicitly typed as 'Completed'
    reason: "Cholesterol review.",
    doctorNotes: "Patient's cholesterol levels show slight improvement. Advised continued medication and diet. Next review in 3 months.",
    doctorId: "dr001",
    doctorName: "Dr. Aarav Sharma",
    doctorSpecialization: "General",
    doctorAvatar: "https://i.postimg.cc/V6hR452b/download-1.jpg",
    token: "MNO77889",
    patientAge: "55",
    paymentMethod: "online",
  },
  {
    id: "app006",
    patientName: "Anjali Jain",
    patientId: "pat006",
    type: "Online Consultation",
    date: "2025-07-30", // Past appointment
    time: "10:30",
    status: "Completed", // Explicitly typed as 'Completed'
    reason: "Post-surgery follow-up.",
    doctorNotes: "Wound healing well. Patient reports minimal discomfort. Advised light exercises. Follow-up in 2 weeks.",
    doctorId: "dr001",
    doctorName: "Dr. Aarav Sharma",
    doctorSpecialization: "General",
    doctorAvatar: "https://i.postimg.cc/V6hR452b/download-1.jpg",
    token: "PQR00112",
    patientAge: "38",
    paymentMethod: "cash",
  },
  {
    id: "app007",
    patientName: "Rohan Verma",
    patientId: "pat007",
    type: "Clinic Visit",
    date: "2025-08-05",
    time: "11:30",
    status: "Pending", // Explicitly typed as 'Pending'
    reason: "General health check.",
    doctorId: "dr001",
    doctorName: "Dr. Aarav Sharma",
    doctorSpecialization: "General",
    doctorAvatar: "https://i.postimg.cc/V6hR452b/download-1.jpg",
    token: "STU33445",
    patientAge: "29",
    paymentMethod: "online",
  },
  {
    id: "app008",
    patientName: "Diya Gupta",
    patientId: "pat008",
    type: "Online Consultation",
    date: "2025-08-06",
    time: "15:00",
    status: "Pending", // Explicitly typed as 'Pending'
    reason: "Skin rash consultation.",
    doctorId: "dr001",
    doctorName: "Dr. Aarav Sharma",
    doctorSpecialization: "General",
    doctorAvatar: "https://i.postimg.cc/V6hR452b/download-1.jpg",
    token: "VWX66778",
    patientAge: "22",
    paymentMethod: "cash",
  },
];
