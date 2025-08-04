// app/profile/page.tsx
"use client";

import { useState, useEffect, ChangeEvent, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaStethoscope,
  FaCalendarAlt,
  FaCapsules,
  FaNotesMedical,
  FaUserCircle,
  FaChevronLeft,
  FaEdit,
  FaSave,
  FaEraser,
  FaSignOutAlt,
  FaMapMarkerAlt,
  FaBriefcaseMedical,
  FaUserAlt,
  FaHeart,
  FaShieldAlt,
  FaUserFriends,
  FaBell,
  FaEnvelope,
  FaPhone,
  FaTint,
  FaRunning,
  FaUtensils,
  FaBullseye,
  FaHospitalAlt,
  FaIdCard,
} from 'react-icons/fa';

interface FormData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  age: string;
  address: string;
  bloodGroup: string;
  height: string;
  weight: string;
  medicalHistory: string;
  allergies: string;
  medications: string;
  lastVisit: string;
  nextAppointment: string;
  createdAt: string;
  lifestyleChoices?: string;
  dietaryPreferences?: string;
  wellnessGoals?: string;
  insuranceProvider?: string;
  policyNumber?: string;
  governmentID?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  reminders?: boolean;
  emailUpdates?: boolean;
}

const PatientProfilePage = () => {
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);

  const initialFormState: FormData = {
    name: '',
    email: '',
    phone: '',
    gender: '',
    age: '',
    address: '',
    bloodGroup: '',
    height: '',
    weight: '',
    medicalHistory: '',
    allergies: '',
    medications: '',
    lastVisit: '',
    nextAppointment: '',
    createdAt: '',
    lifestyleChoices: '',
    dietaryPreferences: '',
    wellnessGoals: '',
    insuranceProvider: '',
    policyNumber: '',
    governmentID: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    reminders: false,
    emailUpdates: false,
  };

  const [formData, setFormData] = useState<FormData>(initialFormState);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Lobster&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const fetchPatient = async () => {
      setLoading(true);
      setError(null);
      try {
      const res = await fetch("https://json-server-7wzo.onrender.com/patientProfile/");
      const data = await res.json();
      const patient = data[0];

      if (patient) {
        setFormData({
          id: patient.id || '',
          name: patient.patientName || '',
          email: patient.patientemail || '',
          phone: patient.phoneNumber || '',
          age: patient.age || '',
          gender: patient.gender || '',
          address: patient.location || '',
          bloodGroup: patient.bloodGroup || '',
          height: '', // not in API
          weight: '', // not in API
          medicalHistory: '', // not in API
          allergies: '', // not in API
          medications: '', // not in API
          lastVisit: '', // not in API
          nextAppointment: '', // not in API
          createdAt: patient.createdAt || '',
          lifestyleChoices: patient.lifestyleChoices || '',
          dietaryPreferences: patient.dietaryPreferences || '',
          wellnessGoals: patient.wellnessGoals || '',
          insuranceProvider: patient.insuranceProvider || '',
          policyNumber: patient.policyNumber || '',
          governmentID: patient.governmentID || '',
          emergencyContactName: patient.emergencyContactName || '',
          emergencyContactRelation: patient.emergencyContactRelation || '',
          emergencyContactPhone: patient.emergencyContactPhone || '',
          reminders: false,
          emailUpdates: false,
        });
      }
      } catch (err: unknown) {
        console.error("Error fetching patient:", err);
        if (err instanceof Error) {
          setError(`Failed to load profile data: ${err.message}. Please try again.`);
        } else {
          setError("Failed to load profile data. An unknown error occurred. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLogout = () => setShowLogoutConfirm(true);
  const confirmLogout = () => router.push('/');
  const toggleEdit = () => setIsEditing((prev) => !prev);
  
  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all local changes? This cannot be undone.")) {
      setFormData(initialFormState);
    }
  };

  const handleBack = () => router.push('/dashboard');

  const savePatientData = async () => {
    setLoading(true);
    setError(null);
    try {
    const response = await fetch(`https://json-server-7wzo.onrender.com/patientProfile/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientName: formData.name,
        patientemail: formData.email,
        phoneNumber: formData.phone,
        gender: formData.gender,
        age: formData.age,
        location: formData.address,
        bloodGroup: formData.bloodGroup,
        height: formData.height,
        weight: formData.weight,
        medicalHistory: formData.medicalHistory,
        allergies: formData.allergies,
        currentMedications: formData.medications,
        lastVisit: formData.lastVisit,
        nextAppointment: formData.nextAppointment,
      }),
    });

      if (response.ok) {
        setShowUpdateSuccess(true);
        setTimeout(() => setShowUpdateSuccess(false), 3000);
        setIsEditing(false);
      } else {
        setError("Failed to update data. Please check your input.");
      }
    } catch (error: unknown) {
      console.error("Error updating patient data:", error);
      if (error instanceof Error) {
        setError(`An unexpected error occurred while saving: ${error.message}.`);
      } else {
        setError("An unexpected error occurred while saving.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600"></div>
        <p className="ml-4 text-xl text-gray-700">Loading profile data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-6">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Profile</h2>
        <p className="text-lg text-red-600 mb-6">{error}</p>
        <motion.button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Retry Loading
        </motion.button>
      </div>
    );
  }

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
          <Image
            src="https://i.postimg.cc/SKnMMNcw/360-F-863843181-63-Nv8tgy-BU8-X26-B1-Lq-Qvfi0tn95aj-Sg-X.jpg"
            alt="Shedula Logo"
            width={45}
            height={45}
            className="rounded-full shadow-md"
          />
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
            onClick={() => router.push("/dashboard")}
            whileHover={{ y: -3, color: "#4F46E5" }}
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaStethoscope className="text-blue-600" /> Doctors
          </motion.button>
          <motion.button
            onClick={() => router.push("/my-appointments")}
            whileHover={{ y: -3, color: "#4F46E5" }}
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaCalendarAlt className="text-blue-600" /> Appointments
          </motion.button>
          <motion.button
            onClick={() => router.push("/medicines")}
            whileHover={{ y: -3, color: "#4F46E5" }}
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaCapsules className="text-blue-600" /> Medicines
          </motion.button>
          <motion.button
            onClick={() => router.push("/records")}
            whileHover={{ y: -3, color: "#4F46E5" }}
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaNotesMedical className="text-blue-600" /> Records
          </motion.button>
        </div>
        <motion.button
          onClick={() => router.push("/profile")}
          className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors shadow-md"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaUserCircle className="text-2xl" />
        </motion.button>
      </motion.div>

      <div className="relative z-10 pt-28 px-8 pb-16 w-full min-h-screen flex flex-col items-center">
        <motion.button
          onClick={handleBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6 text-lg font-medium self-start ml-4 md:ml-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FaChevronLeft /> Back to Dashboard
        </motion.button>

        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 mb-10 mt-4">
          My Profile
        </h1>

        <motion.div
          className="w-full max-w-4xl bg-white rounded-3xl shadow-xl p-8 space-y-8 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex flex-col items-center space-y-4 mb-6">
            <div className="relative w-32 h-32 rounded-full border-4 border-blue-300 shadow-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white text-5xl font-bold uppercase">
              {getInitials(formData.name)}
            </div>
            <h2 className="text-4xl font-bold text-gray-900">{formData.name || "Patient Name"}</h2>
            <p className="text-lg text-gray-600">{formData.email || "patient@example.com"}</p>
          </div>

          <div className="flex justify-center md:justify-end gap-4 mb-8">
            <motion.button
              onClick={isEditing ? savePatientData : toggleEdit}
              className={`px-6 py-3 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center gap-2 ${
                isEditing
                  ? "bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isEditing ? <><FaSave /> Save & View</> : <><FaEdit /> Edit Info</>}
            </motion.button>
            {isEditing && (
              <motion.button
                onClick={handleClear}
                className="px-6 py-3 bg-yellow-500 text-white rounded-xl font-bold text-lg hover:bg-yellow-600 transition-colors shadow-lg flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaEraser /> Clear
              </motion.button>
            )}
          </div>

          <AnimatePresence>
            {showUpdateSuccess && (
              <motion.div
                className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-md mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="font-semibold flex items-center gap-2"><FaSave /> Profile updated successfully!</p>
              </motion.div>
            )}
          </AnimatePresence>

          {isEditing ? (
            <form className="space-y-8">
              <Section title="Basic Information" icon={<FaUserAlt className="text-blue-600" />}>
                <InputGrid>
                  <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} />
                  <Input label="Age" name="age" type="number" value={formData.age} onChange={handleChange} />
                  <Input label="Gender" name="gender" value={formData.gender} onChange={handleChange} />
                  <Input label="Address" name="address" value={formData.address} onChange={handleChange} />
                  <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} icon={<FaEnvelope />} />
                  <Input label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} icon={<FaPhone />} />
                  <Input label="Last Visit" name="lastVisit" type="date" value={formData.lastVisit} onChange={handleChange} />
                  <Input label="Next Appointment" name="nextAppointment" type="date" value={formData.nextAppointment} onChange={handleChange} />
                </InputGrid>
              </Section>

              <Section title="Medical Information" icon={<FaHeart className="text-pink-600" />}>
                <InputGrid>
                  <Input label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} icon={<FaTint />} />
                  <Input label="Height" name="height" value={formData.height} onChange={handleChange} />
                  <Input label="Weight" name="weight" value={formData.weight} onChange={handleChange} />
                  <Input label="Medical History" name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} />
                  <Input label="Allergies" name="allergies" value={formData.allergies} onChange={handleChange} />
                  <Input label="Medications" name="medications" value={formData.medications} onChange={handleChange} />
                </InputGrid>
              </Section>

              <Section title="Health Preferences" icon={<FaRunning className="text-green-600" />}>
                <InputGrid>
                  <Input label="Lifestyle Choices" name="lifestyleChoices" value={formData.lifestyleChoices || ''} onChange={handleChange} icon={<FaRunning />} />
                  <Input label="Dietary Preferences" name="dietaryPreferences" value={formData.dietaryPreferences || ''} onChange={handleChange} icon={<FaUtensils />} />
                  <Input label="Wellness Goals" name="wellnessGoals" value={formData.wellnessGoals || ''} onChange={handleChange} icon={<FaBullseye />} />
                </InputGrid>
              </Section>

              <Section title="Insurance & Identification" icon={<FaShieldAlt className="text-purple-600" />}>
                <InputGrid>
                  <Input label="Insurance Provider" name="insuranceProvider" value={formData.insuranceProvider || ''} onChange={handleChange} icon={<FaHospitalAlt />} />
                  <Input label="Policy Number" name="policyNumber" value={formData.policyNumber || ''} onChange={handleChange} icon={<FaIdCard />} />
                  <Input label="Government ID" name="governmentID" value={formData.governmentID || ''} onChange={handleChange} icon={<FaIdCard />} />
                </InputGrid>
              </Section>

              <Section title="Emergency Contact" icon={<FaUserFriends className="text-orange-600" />}>
                <InputGrid>
                  <Input label="Contact Name" name="emergencyContactName" value={formData.emergencyContactName || ''} onChange={handleChange} />
                  <Input label="Relation" name="emergencyContactRelation" value={formData.emergencyContactRelation || ''} onChange={handleChange} />
                  <Input label="Phone" name="emergencyContactPhone" type="tel" value={formData.emergencyContactPhone || ''} onChange={handleChange} icon={<FaPhone />} />
                </InputGrid>
              </Section>

              <Section title="Notifications & Settings" icon={<FaBell className="text-blue-600" />}>
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <Checkbox
                    label="Appointment Reminders (via SMS)"
                    name="reminders"
                    checked={formData.reminders || false}
                    onChange={handleChange}
                  />
                  <Checkbox
                    label="Email Updates & Promotions"
                    name="emailUpdates"
                    checked={formData.emailUpdates || false}
                    onChange={handleChange}
                  />
                </div>
              </Section>
            </form>
          ) : (
            <div className="space-y-6 text-gray-800">
              <Section title="Basic Information" icon={<FaUserAlt className="text-blue-600" />}>
                <ViewGrid>
                  <ViewItem label="Full Name" value={formData.name} />
                  <ViewItem label="Age" value={formData.age} />
                  <ViewItem label="Gender" value={formData.gender} />
                  <ViewItem label="Address" value={formData.address} />
                  <ViewItem label="Email" value={formData.email} icon={<FaEnvelope />} />
                  <ViewItem label="Phone" value={formData.phone} icon={<FaPhone />} />
                  <ViewItem label="Last Visit" value={formData.lastVisit} />
                  <ViewItem label="Next Appointment" value={formData.nextAppointment} />
                </ViewGrid>
              </Section>

              <Section title="Medical Information" icon={<FaHeart className="text-pink-600" />}>
                <ViewGrid>
                  <ViewItem label="Blood Group" value={formData.bloodGroup} icon={<FaTint />} />
                  <ViewItem label="Height" value={formData.height} />
                  <ViewItem label="Weight" value={formData.weight} />
                  <ViewItem label="Medical History" value={formData.medicalHistory} />
                  <ViewItem label="Allergies" value={formData.allergies} />
                  <ViewItem label="Medications" value={formData.medications} />
                </ViewGrid>
              </Section>

              <Section title="Health Preferences" icon={<FaRunning className="text-green-600" />}>
                <ViewGrid>
                  <ViewItem label="Lifestyle Choices" value={formData.lifestyleChoices || 'Not specified'} />
                  <ViewItem label="Dietary Preferences" value={formData.dietaryPreferences || 'Not specified'} />
                  <ViewItem label="Wellness Goals" value={formData.wellnessGoals || 'Not specified'} />
                </ViewGrid>
              </Section>

              <Section title="Insurance & Identification" icon={<FaShieldAlt className="text-purple-600" />}>
                <ViewGrid>
                  <ViewItem label="Insurance Provider" value={formData.insuranceProvider || 'Not specified'} icon={<FaHospitalAlt />} />
                  <ViewItem label="Policy Number" value={formData.policyNumber || 'Not specified'} icon={<FaIdCard />} />
                  <ViewItem label="Government ID" value={formData.governmentID || 'Not specified'} icon={<FaIdCard />} />
                </ViewGrid>
              </Section>

              <Section title="Emergency Contact" icon={<FaUserFriends className="text-orange-600" />}>
                <ViewGrid>
                  <ViewItem label="Contact Name" value={formData.emergencyContactName || 'Not specified'} />
                  <ViewItem label="Relation" value={formData.emergencyContactRelation || 'Not specified'} />
                  <ViewItem label="Phone" value={formData.emergencyContactPhone || 'Not specified'} icon={<FaPhone />} />
                </ViewGrid>
              </Section>

              <Section title="Notifications & Settings" icon={<FaBell className="text-blue-600" />}>
                <ViewGrid>
                  <ViewItem label="Appointment Reminders" value={formData.reminders ? 'Yes' : 'No'} />
                  <ViewItem label="Email Updates" value={formData.emailUpdates ? 'Yes' : 'No'} />
                </ViewGrid>
              </Section>
            </div>
          )}

          <div className="text-center mt-10">
            <motion.button
              onClick={handleLogout}
              className="px-8 py-4 bg-red-600 text-white rounded-xl font-bold text-xl hover:bg-red-700 transition-colors shadow-lg flex items-center justify-center gap-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaSignOutAlt /> Log Out
            </motion.button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center relative"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <h3 className="text-2xl font-bold text-red-600 mb-4">Confirm Logout</h3>
              <p className="text-gray-700 text-lg mb-6">Are you sure you want to log out?</p>
              <div className="flex justify-center gap-4">
                <motion.button
                  onClick={confirmLogout}
                  className="bg-green-600 text-white py-3 px-6 rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Yes, Log Out
                </motion.button>
                <motion.button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="bg-gray-300 text-gray-800 py-3 px-6 rounded-xl font-bold text-lg hover:bg-gray-400 transition-all shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <a href="#" className="hover:text-white transition-colors">
                  Find a Doctor
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  My Appointments
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Health Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  About Us
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
};

interface SectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}

const Section = ({ title, icon, children }: SectionProps) => (
  <motion.div
    className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
      {icon} {title}
    </h2>
    {children}
  </motion.div>
);

interface InputGridProps {
  children: ReactNode;
}

const InputGrid = ({ children }: InputGridProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
);

interface InputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  icon?: ReactNode;
}

const Input = ({ label, name, type = 'text', value, onChange, icon }: InputProps) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
      {icon} {label}
    </label>
    {type === 'textarea' ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={3}
        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 bg-gray-50 transition-colors duration-200"
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 bg-gray-50 transition-colors duration-200"
      />
    )}
  </div>
);

interface CheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox = ({ label, name, checked, onChange }: CheckboxProps) => (
  <label className="flex items-center space-x-3 text-lg text-gray-700 cursor-pointer">
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      className="form-checkbox h-6 w-6 text-blue-600 rounded-md border-gray-300 focus:ring-blue-500 transition-colors duration-200"
    />
    <span>{label}</span>
  </label>
);

interface ViewGridProps {
  children: ReactNode;
}

const ViewGrid = ({ children }: ViewGridProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">{children}</div>
);

interface ViewItemProps {
  label: string;
  value: string | boolean;
  icon?: ReactNode;
}

const ViewItem = ({ label, value, icon }: ViewItemProps) => (
  <div className="flex items-center bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
    {icon && <span className="mr-3 text-xl text-blue-500">{icon}</span>}
    <div>
      <p className="text-sm font-medium text-gray-600">{label}:</p>
      <p className="text-lg font-semibold text-gray-900">
        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value || 'N/A'}
      </p>
    </div>
  </div>
);

export default PatientProfilePage;