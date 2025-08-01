// src/app/doctor/dashboard/page.tsx
"use client";

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  FaStethoscope,
  FaMapMarkerAlt,
  FaBriefcaseMedical,
  FaCalendarAlt,
  FaUserCircle,
  FaChevronLeft,
  FaUsers, // For patients treated
  FaClinicMedical, // For clinic visits
  FaLaptopMedical, // For online consultations
  FaRupeeSign, // For revenue
  FaChartPie, // For pie chart icon
  FaChartLine, // For line chart icon
  FaUserInjured // For patient details
} from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, LabelProps } from 'recharts';
import { DoctorProfile } from '@/types'; // Import DoctorProfile from types
import { mockDoctorProfiles } from '@/lib/doctorData'; // Import mockDoctorProfiles from doctorData

// Helper for currency formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Custom Tooltip for Recharts
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string | number;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-md">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {payload.map((entry: { name: string; value: number; color: string }, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Dashboard Card Component
interface DashboardCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  iconColorClass: string; // New prop for explicit icon color
  bgColorGradient: string; // Background gradient for the card
  glowColorClass: string; // Tailwind class for hover ring color (e.g., 'hover:ring-purple-400')
  shadowGlowRgba: string; // RGBA value for the boxShadow glow (e.g., 'rgba(168, 85, 247, 0.4)')
}

const DashboardCard = ({ icon, title, value, iconColorClass, bgColorGradient, glowColorClass, shadowGlowRgba }: DashboardCardProps) => (
  <motion.div
    className={`${bgColorGradient} rounded-2xl p-6 shadow-lg border border-transparent flex flex-col items-center text-center
                transform transition-all duration-300 ease-in-out
                hover:scale-103 hover:ring-4 hover:ring-opacity-50 ${glowColorClass}`} // Apply glowColorClass for ring
    whileHover={{
      scale: 1.03,
      boxShadow: `0 10px 30px ${shadowGlowRgba}` // Dynamic colored shadow using provided RGBA
    }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    <div className={`text-5xl mb-3 ${iconColorClass}`}> {/* Apply explicit icon color */}
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </motion.div>
);

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load fonts
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Lobster&family=Poppins:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // No cursor particle effect (removed)

    // In a real application, you'd fetch the logged-in doctor's ID
    // For this mock, we'll use the first doctor in mockDoctorProfiles
    const loggedInDoctorId = "dr001"; // Assuming 'dr001' is the ID of the logged-in doctor

    const fetchDoctorData = () => {
      setLoading(true);
      setError(null);
      try {
        // Ensure mockDoctorProfiles is defined before trying to find
        if (!mockDoctorProfiles) {
          throw new Error("mockDoctorProfiles data is not loaded or is undefined.");
        }
        const foundDoctor = mockDoctorProfiles.find((doc: DoctorProfile) => doc.id === loggedInDoctorId);
        if (foundDoctor) {
          setDoctorProfile(foundDoctor);
        } else {
          setError("Doctor profile not found.");
        }
      } catch (err: unknown) {
        console.error("Error fetching doctor data:", err);
        if (err instanceof Error) {
          setError(`Failed to load doctor data: ${err.message}`);
        } else {
          setError("Failed to load doctor data. An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();

    // No cleanup for mousemove as it's removed
    return () => {};
  }, []); // Dependency on createParticle removed

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600"></div>
        <p className="ml-4 text-xl text-gray-700">Loading doctor dashboard...</p>
      </div>
    );
  }

  if (error || !doctorProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-6">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Dashboard</h2>
        <p className="text-lg text-red-600 mb-6">{error || "Doctor profile data is unavailable."}</p>
        <motion.button
          onClick={() => router.push('/doctor/login')} // Go back to doctor login
          className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Go to Login
        </motion.button>
      </div>
    );
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300']; // Colors for pie chart segments

  return (
    <div className="min-h-screen text-gray-900 font-poppins relative overflow-x-hidden animated-gradient-bg">
      {/* Animated Gradient Background */}
      <style jsx global>{`
        .animated-gradient-bg {
          background: linear-gradient(135deg, #e0f7fa, #e8e0fa, #fae0f7, #e8e0fa, #e0f7fa); /* More visible, professional gradient */
          background-size: 600% 600%; /* Larger size for more movement */
          animation: gradientShift 30s ease infinite alternate; /* Smooth, continuous shift */
        }

        @keyframes gradientShift {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
      `}</style>

      {/* --- Header (Top Nav) --- */}
      <motion.div
        className={`fixed top-0 left-0 right-0 z-50 py-5 px-8 flex justify-between items-center transition-all duration-300 rounded-b-3xl shadow-xl bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 border-b-2 border-transparent bg-origin-border bg-clip-border`}
      >
        <div className="flex items-center gap-4">
          <Image src="https://i.postimg.cc/SKnMMNcw/360-F-863843181-63-Nv8tgy-BU8-X26-B1-Lq-Qvfi0tn95aj-Sg-X.jpg" alt="Shedula Logo" width={45} height={45} className="rounded-full shadow-md" />
          <motion.h1
            className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 font-lobster"
            style={{ fontFamily: "'Lobster', cursive" }}
            whileHover={{ scale: 1.05, textShadow: "0px 0px 8px rgba(0, 0, 0, 0.2)" }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Shedula <span className="text-xl font-poppins font-medium text-gray-600">(Doctor Portal)</span> {/* Smaller font for Doctor Portal */}
          </motion.h1>
        </div>
        <div className="flex gap-8 text-gray-700 font-medium text-lg items-center">
          <motion.button
            onClick={() => router.push("/doctor/dashboard")}
            whileHover={{ y: -3, color: "#4F46E5" }}
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200"
          >
            <FaStethoscope className="text-blue-700" /> Dashboard
          </motion.button>
          <motion.button
            onClick={() => router.push("/doctor/appointments")}
            whileHover={{ y: -3, color: "#4F46E5" }}
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200"
          >
            <FaCalendarAlt className="text-blue-700" /> Appointments
          </motion.button>
          <motion.button
            onClick={() => router.push("/doctor/patients")}
            whileHover={{ y: -3, color: "#4F46E5" }}
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200"
          >
            <FaUserInjured className="text-blue-700" /> Patient Details
          </motion.button>
        </div>
        <motion.button
          onClick={() => router.push("/doctor/profile")}
          className="p-3 rounded-full bg-blue-200 text-blue-700 hover:bg-blue-300 transition-colors shadow-md"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaUserCircle className="text-2xl" />
        </motion.button>
      </motion.div>

      <div className="relative z-10 pt-36 px-8 pb-16 w-full min-h-screen flex flex-col items-center"> {/* Adjusted padding-top */}
        <motion.button
          onClick={() => router.push('/doctor/login')}
          className="flex items-center gap-2 text-blue-700 hover:text-blue-900 transition-colors mb-6 text-lg font-medium self-start ml-4 md:ml-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FaChevronLeft /> Back to Login
        </motion.button>

        <h1
          className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 mb-10 mt-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Doctor's Dashboard
        </h1>

        <motion.div
          className="w-full max-w-7xl bg-white rounded-3xl shadow-xl p-8 space-y-8 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              icon={<FaUsers />}
              title="Patients Treated"
              value={doctorProfile.totalPatientsTreated}
              iconColorClass="text-indigo-700" // Consistent indigo icon
              bgColorGradient="bg-gradient-to-br from-purple-100 to-purple-300" // Light to dark purple gradient
              glowColorClass="hover:ring-purple-600" // Dark purple glow
              shadowGlowRgba="rgba(124, 58, 237, 0.6)" // Dark purple glow
            />
            <DashboardCard
              icon={<FaClinicMedical />}
              title="Clinic Visits"
              value={doctorProfile.clinicVisitsAttended}
              iconColorClass="text-indigo-700" // Consistent indigo icon
              bgColorGradient="bg-gradient-to-br from-purple-100 to-purple-300" // Light to dark purple gradient
              glowColorClass="hover:ring-purple-600" // Dark purple glow
              shadowGlowRgba="rgba(124, 58, 237, 0.6)" // Dark purple glow
            />
            <DashboardCard
              icon={<FaLaptopMedical />}
              title="Online Consultations"
              value={doctorProfile.onlineConsultationsAttended}
              iconColorClass="text-indigo-700" // Consistent indigo icon
              bgColorGradient="bg-gradient-to-br from-purple-100 to-purple-300" // Light to dark purple gradient
              glowColorClass="hover:ring-purple-600" // Dark purple glow
              shadowGlowRgba="rgba(124, 58, 237, 0.6)" // Dark purple glow
            />
            <DashboardCard
              icon={<FaRupeeSign />}
              title="Revenue Generated"
              value={formatCurrency(doctorProfile.revenueGenerated)}
              iconColorClass="text-indigo-700" // Consistent indigo icon
              bgColorGradient="bg-gradient-to-br from-purple-100 to-purple-300" // Light to dark purple gradient
              glowColorClass="hover:ring-purple-600" // Dark purple glow
              shadowGlowRgba="rgba(124, 58, 237, 0.6)" // Dark purple glow
            />
          </div>

          {/* Charts Section (keeping original colors for chart elements) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Consultation Type Breakdown (Pie Chart) */}
            <motion.div
              className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 flex flex-col items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaChartPie className="text-blue-600" /> Consultation Type Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={doctorProfile.consultationTypeBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="type"
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {doctorProfile.consultationTypeBreakdown.map((entry: { type: string; value: number }, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Monthly Revenue (Line Chart) */}
            <motion.div
              className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 flex flex-col items-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaChartLine className="text-purple-600" /> Monthly Revenue (INR)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={doctorProfile.monthlyRevenue}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" tick={{ fill: '#555' }} />
                  <YAxis tickFormatter={(value: number) => formatCurrency(value)} tick={{ fill: '#555' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* --- Footer --- */}
      <footer className="bg-gradient-to-br from-blue-900 to-purple-900 text-white py-12 px-8 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3
              className="text-2xl font-bold font-lobster mb-4"
              style={{ fontFamily: "'Lobster', cursive" }}
            >
              Shedula
            </h3>
            <p className="text-gray-300 text-sm">
              Your all-in-one healthcare platform for booking appointments,
              consulting online, and managing health records.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <a href="/doctor/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/doctor/appointments" className="hover:text-white transition-colors">
                  Appointments
                </a>
              </li>
              <li>
                <a href="/doctor/patients" className="hover:text-white transition-colors">
                  Patient Details
                </a>
              </li>
              <li>
                <a href="/doctor/profile" className="hover:text-white transition-colors">
                  My Profile
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <p className="text-gray-300 text-sm flex items-center gap-2 mb-2">
              <FaMapMarkerAlt /> 123 Health Ave, Wellness City, 10001
            </p>
            <p className="text-gray-300 text-sm flex items-center gap-2 mb-2">
              <FaBriefcaseMedical /> contact@shedula.com
            </p>
            <p className="text-gray-300 text-sm flex items-center gap-2 mb-2">
              <FaCalendarAlt /> +91 98765 43210
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2025 Shedula. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
