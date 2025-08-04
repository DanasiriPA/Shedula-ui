"use client";

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  FaStethoscope,
  FaMapMarkerAlt,
  FaBriefcaseMedical,
  FaCalendarAlt,
  FaUserCircle,
  FaUsers,
  FaClinicMedical,
  FaLaptopMedical,
  FaRupeeSign,
  FaChartPie,
  FaChartLine,
  FaUserInjured,
  FaSignOutAlt,
} from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Define the DoctorProfile type based on the static data structure
interface DoctorProfile {
  totalPatientsTreated: number;
  clinicVisitsAttended: number;
  onlineConsultationsAttended: number;
  revenueGenerated: number;
  consultationTypeBreakdown: { type: string; value: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
}

// Hardcoded static data for the dashboard
const doctorProfile: DoctorProfile = {
  totalPatientsTreated: 1500,
  clinicVisitsAttended: 850,
  onlineConsultationsAttended: 650,
  revenueGenerated: 750000,
  consultationTypeBreakdown: [
    { type: 'Clinic Visits', value: 850 },
    { type: 'Online Consultations', value: 650 },
  ],
  monthlyRevenue: [
    { month: 'Jan', revenue: 65000 },
    { month: 'Feb', revenue: 72000 },
    { month: 'Mar', revenue: 85000 },
    { month: 'Apr', revenue: 78000 },
    { month: 'May', revenue: 92000 },
    { month: 'Jun', revenue: 105000 },
    { month: 'Jul', revenue: 110000 },
  ],
};

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
}

const DashboardCard = ({ icon, title, value }: DashboardCardProps) => (
  <motion.div
    className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 relative overflow-hidden group cursor-pointer"
    variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
    whileHover={{
      y: -10,
      scale: 1.03,
      boxShadow: "0px 20px 30px rgba(99, 102, 241, 0.4)",
    }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    <div className="flex items-center gap-4">
      <div className="p-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </motion.div>
);

export default function DoctorDashboardPage() {
  const router = useRouter();

  // Load fonts on component mount
  useEffect(() => {
    const lobsterLink = document.createElement("link");
    lobsterLink.href = "https://fonts.googleapis.com/css2?family=Lobster&display=swap";
    lobsterLink.rel = "stylesheet";
    document.head.appendChild(lobsterLink);

    const interLink = document.createElement("link");
    interLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap";
    interLink.rel = "stylesheet";
    document.head.appendChild(interLink);
  }, []);
  
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  return (
    <div className="min-h-screen bg-gray-200 text-gray-900 font-inter relative overflow-x-hidden">
      <style jsx global>{`
        .bg-medical-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2393c5fd' fill-opacity='0.6'%3E%3Cpath d='M20 40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0-20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm40-40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2z'/%3E%3Cpath d='M42 20h-4v-4h-4v4h-4v4h4v4h4v-4h4v-4zm0 40h-4v-4h-4v4h-4v4h4v4h4v-4h4v-4z'/%3E%3C/g%3E%3C/svg%3E");
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
            onClick={() => router.push("/doctor/dashboard")}
            whileHover={{ y: -3, color: "#4F46E5" }}
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaStethoscope className="text-blue-600" /> Dashboard
          </motion.button>
          <motion.button 
            onClick={() => router.push("/doctor/appointments")} 
            whileHover={{ y: -3, color: "#4F46E5" }} 
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaCalendarAlt className="text-blue-600" /> Appointments
          </motion.button>
          <motion.button 
            onClick={() => router.push("/doctor/patients")} 
            whileHover={{ y: -3, color: "#4F46E5" }} 
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaUserInjured className="text-blue-600" /> Patients
          </motion.button>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => router.push("/doctor/profile")}
            className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors shadow-md"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaUserCircle className="text-2xl" />
          </motion.button>
          <motion.button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 py-2 px-4 rounded-full text-red-500 bg-red-100/50 hover:bg-red-100 transition-colors shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Page Content */}
      <div className="pt-32 px-8">
        {/* Heading */}
        <h2 className="text-center text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 mb-10">Doctor Dashboard</h2>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08, duration: 0.6 },
            },
          }}
          initial="hidden"
          animate="visible"
        >
          <DashboardCard
            icon={<FaUsers />}
            title="Patients Treated"
            value={doctorProfile.totalPatientsTreated}
          />
          <DashboardCard
            icon={<FaClinicMedical />}
            title="Clinic Visits"
            value={doctorProfile.clinicVisitsAttended}
          />
          <DashboardCard
            icon={<FaLaptopMedical />}
            title="Online Consults"
            value={doctorProfile.onlineConsultationsAttended}
          />
          <DashboardCard
            icon={<FaRupeeSign />}
            title="Revenue Generated"
            value={formatCurrency(doctorProfile.revenueGenerated)}
          />
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Consultation Type Breakdown (Pie Chart) */}
          <motion.div
            className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
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
            className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
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
    </div>
  );
}