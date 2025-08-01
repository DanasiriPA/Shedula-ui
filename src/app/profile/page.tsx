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
  FaEdit,           // For Edit button
  FaSave,           // For Save button
  FaEraser,         // For Clear button
  FaSignOutAlt,     // For Logout button
  FaMapMarkerAlt,   // For footer
  FaBriefcaseMedical, // For footer
  FaUserAlt,        // Icon for Basic Info
  FaHeart,          // Icon for Health Preferences
  FaShieldAlt,      // Icon for Insurance & ID
  FaUserFriends,    // Icon for Emergency Contact
  FaBell,           // Icon for Notifications & Settings
  FaEnvelope,       // For email field
  FaPhone,          // For phone field
  FaBirthdayCake,   // For DOB field
  FaTint,           // For Blood Group
  FaRunning,        // For Lifestyle
  FaUtensils,       // For Dietary
  FaBullseye,       // For Wellness Goals
  FaHospitalAlt,    // For Insurance Provider
  FaIdCard,         // For Policy Number / Government ID
} from 'react-icons/fa';

// ✅ Type Definitions - Aligned with the simplified MockAPI data
interface FormData {
  patientName: string;
  age: string;
  gender: string;
  location: string;
  patientemail: string; // Matches MockAPI field
  phoneNumber: string;  // Matches MockAPI field
  dateOfBirth: string;  // Matches MockAPI field
  bloodGroup: string;   // Matches MockAPI field
  lifestyleChoices: string; // Matches MockAPI field
  dietaryPreferences: string; // Matches MockAPI field
  wellnessGoals: string;    // Matches MockAPI field
  insuranceProvider: string; // Matches MockAPI field
  policyNumber: string;     // Matches MockAPI field
  governmentID: string;     // Matches MockAPI field
  emergencyContactName: string; // Matches MockAPI field
  emergencyContactRelation: string; // Matches MockAPI field
  emergencyContactPhone: string; // Matches MockAPI field
  reminders: boolean; // Not in MockAPI, managed client-side
  emailUpdates: boolean; // Not in MockAPI, managed client-side
}

const PatientProfilePage = () => {
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Start in view mode

  const initialFormState: FormData = {
    patientName: '',
    age: '',
    gender: '',
    location: '',
    patientemail: '',
    phoneNumber: '',
    dateOfBirth: '',
    bloodGroup: '',
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Lobster&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const fetchPatient = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("https://6888ba66adf0e59551bb2689.mockapi.io/v1/patientlogin/1");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setFormData({
          patientName: data.patientName || '',
          age: data.age || '',
          gender: data.gender || '',
          location: data.location || '',
          patientemail: data.patientemail || '',
          phoneNumber: data.phoneNumber || '',
          dateOfBirth: data.dateOfBirth || '',
          bloodGroup: data.bloodGroup || '',
          lifestyleChoices: data.lifestyleChoices || '',
          dietaryPreferences: data.dietaryPreferences || '',
          wellnessGoals: data.wellnessGoals || '',
          insuranceProvider: data.insuranceProvider || '',
          policyNumber: data.policyNumber || '',
          governmentID: data.governmentID || '',
          emergencyContactName: data.emergencyContactName || '',
          emergencyContactRelation: data.emergencyContactRelation || '',
          emergencyContactPhone: data.emergencyContactPhone || '',
          reminders: false, // These are not in MockAPI, keep default
          emailUpdates: false, // These are not in MockAPI, keep default
        });
      } catch (err: unknown) { // Changed 'any' to 'unknown'
        console.error("Error fetching patient:", err);
        if (err instanceof Error) { // Type guard to safely access error properties
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

  // Utility function to get initials from a name
  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ').filter(Boolean); // Split by space and remove empty strings
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked; // For checkboxes
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLogout = () => setShowLogoutConfirm(true);
  const confirmLogout = () => router.push('/');
  const toggleEdit = () => setIsEditing((prev) => !prev);
  const handleClear = () => {
    // Using window.confirm for simplicity, could be replaced with a custom modal
    if (window.confirm("Are you sure you want to clear all local changes? This cannot be undone.")) {
      setFormData(initialFormState); // Resets to empty form
      // In a real app, you might re-fetch from the server here
    }
  };
  const handleBack = () => router.push('/dashboard'); // Consistent with other pages

  const savePatientData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("https://6888ba66adf0e59551bb2689.mockapi.io/v1/patientlogin/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Map formData fields back to MockAPI field names
          patientName: formData.patientName,
          age: formData.age,
          gender: formData.gender,
          location: formData.location,
          patientemail: formData.patientemail,
          phoneNumber: formData.phoneNumber,
          dateOfBirth: formData.dateOfBirth,
          bloodGroup: formData.bloodGroup,
          lifestyleChoices: formData.lifestyleChoices,
          dietaryPreferences: formData.dietaryPreferences,
          wellnessGoals: formData.wellnessGoals,
          insuranceProvider: formData.insuranceProvider,
          policyNumber: formData.policyNumber,
          governmentID: formData.governmentID,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactRelation: formData.emergencyContactRelation,
          emergencyContactPhone: formData.emergencyContactPhone,
          // Note: reminders and emailUpdates are client-side only for this mock setup
        }),
      });

      if (response.ok) {
        setShowUpdateSuccess(true);
        setTimeout(() => setShowUpdateSuccess(false), 3000); // Hide after 3 seconds
        setIsEditing(false); // Switch to view mode after saving
      } else {
        setError("Failed to update data. Please check your input.");
      }
    } catch (error: unknown) { // Changed 'any' to 'unknown'
      console.error("Error updating patient data:", error);
      if (error instanceof Error) { // Type guard to safely access error properties
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
          onClick={() => window.location.reload()} // Simple reload to retry
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

      {/* Background with Medical Pattern */}
      <div className="absolute inset-0 z-0 bg-white bg-medical-pattern"></div>

      {/* --- Header (Top Nav) --- */}
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
          {/* Profile Header */}
          <div className="flex flex-col items-center space-y-4 mb-6">
            <div className="relative w-32 h-32 rounded-full border-4 border-blue-300 shadow-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white text-5xl font-bold uppercase">
              {getInitials(formData.patientName)}
            </div>
            <h2 className="text-4xl font-bold text-gray-900">{formData.patientName || "Patient Name"}</h2>
            <p className="text-lg text-gray-600">{formData.patientemail || "patient@example.com"}</p>
          </div>

          {/* Action Buttons */}
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

          {/* Success Notification */}
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

          {/* Profile Sections (Conditional Rendering) */}
          {isEditing ? (
            <form className="space-y-8">
              <Section title="Basic Information" icon={<FaUserAlt className="text-blue-600" />}>
                <InputGrid>
                  <Input label="Full Name" name="patientName" value={formData.patientName} onChange={handleChange} />
                  <Input label="Age" name="age" type="number" value={formData.age} onChange={handleChange} />
                  <Input label="Gender" name="gender" value={formData.gender} onChange={handleChange} />
                  <Input label="Location" name="location" value={formData.location} onChange={handleChange} />
                  <Input label="Email" name="patientemail" type="email" value={formData.patientemail} onChange={handleChange} icon={<FaEnvelope />} />
                  <Input label="Phone" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} icon={<FaPhone />} />
                  <Input label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} icon={<FaBirthdayCake />} />
                </InputGrid>
              </Section>

              <Section title="Health Preferences" icon={<FaHeart className="text-pink-600" />}>
                <InputGrid>
                  <Input label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} icon={<FaTint />} />
                  <Input label="Lifestyle Choices" name="lifestyleChoices" value={formData.lifestyleChoices} onChange={handleChange} icon={<FaRunning />} />
                  <Input label="Dietary Preferences" name="dietaryPreferences" value={formData.dietaryPreferences} onChange={handleChange} icon={<FaUtensils />} />
                  <Input label="Wellness Goals" name="wellnessGoals" value={formData.wellnessGoals} onChange={handleChange} icon={<FaBullseye />} />
                </InputGrid>
              </Section>

              <Section title="Insurance & Identification" icon={<FaShieldAlt className="text-green-600" />}>
                <InputGrid>
                  <Input label="Insurance Provider" name="insuranceProvider" value={formData.insuranceProvider} onChange={handleChange} icon={<FaHospitalAlt />} />
                  <Input label="Policy Number" name="policyNumber" value={formData.policyNumber} onChange={handleChange} icon={<FaIdCard />} />
                  <Input label="Government ID" name="governmentID" value={formData.governmentID} onChange={handleChange} icon={<FaIdCard />} />
                </InputGrid>
              </Section>

              <Section title="Emergency Contact" icon={<FaUserFriends className="text-orange-600" />}>
                <InputGrid>
                  <Input label="Contact Name" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} />
                  <Input label="Relation" name="emergencyContactRelation" value={formData.emergencyContactRelation} onChange={handleChange} />
                  <Input label="Phone" name="emergencyContactPhone" type="tel" value={formData.emergencyContactPhone} onChange={handleChange} icon={<FaPhone />} />
                </InputGrid>
              </Section>

              <Section title="Notifications & Settings" icon={<FaBell className="text-purple-600" />}>
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <Checkbox
                    label="Appointment Reminders (via SMS)"
                    name="reminders"
                    checked={formData.reminders}
                    onChange={handleChange}
                  />
                  <Checkbox
                    label="Email Updates & Promotions"
                    name="emailUpdates"
                    checked={formData.emailUpdates}
                    onChange={handleChange}
                  />
                </div>
              </Section>
            </form>
          ) : (
            <div className="space-y-6 text-gray-800">
              <Section title="Basic Information" icon={<FaUserAlt className="text-blue-600" />}>
                <ViewGrid>
                  <ViewItem label="Full Name" value={formData.patientName} />
                  <ViewItem label="Age" value={formData.age} />
                  <ViewItem label="Gender" value={formData.gender} />
                  <ViewItem label="Location" value={formData.location} />
                  <ViewItem label="Email" value={formData.patientemail} icon={<FaEnvelope />} />
                  <ViewItem label="Phone" value={formData.phoneNumber} icon={<FaPhone />} />
                  <ViewItem label="Date of Birth" value={formData.dateOfBirth} icon={<FaBirthdayCake />} />
                </ViewGrid>
              </Section>

              <Section title="Health Preferences" icon={<FaHeart className="text-pink-600" />}>
                <ViewGrid>
                  <ViewItem label="Blood Group" value={formData.bloodGroup} icon={<FaTint />} />
                  <ViewItem label="Lifestyle Choices" value={formData.lifestyleChoices} icon={<FaRunning />} />
                  <ViewItem label="Dietary Preferences" value={formData.dietaryPreferences} icon={<FaUtensils />} />
                  <ViewItem label="Wellness Goals" value={formData.wellnessGoals} icon={<FaBullseye />} />
                </ViewGrid>
              </Section>

              <Section title="Insurance & Identification" icon={<FaShieldAlt className="text-green-600" />}>
                <ViewGrid>
                  <ViewItem label="Insurance Provider" value={formData.insuranceProvider} icon={<FaHospitalAlt />} />
                  <ViewItem label="Policy Number" value={formData.policyNumber} icon={<FaIdCard />} />
                  <ViewItem label="Government ID" value={formData.governmentID} icon={<FaIdCard />} />
                </ViewGrid>
              </Section>

              <Section title="Emergency Contact" icon={<FaUserFriends className="text-orange-600" />}>
                <ViewGrid>
                  <ViewItem label="Contact Name" value={formData.emergencyContactName} />
                  <ViewItem label="Relation" value={formData.emergencyContactRelation} />
                  <ViewItem label="Phone" value={formData.emergencyContactPhone} icon={<FaPhone />} />
                </ViewGrid>
              </Section>

              <Section title="Notifications & Settings" icon={<FaBell className="text-purple-600" />}>
                <ViewGrid>
                  <ViewItem label="Appointment Reminders" value={formData.reminders ? 'Yes' : 'No'} />
                  <ViewItem label="Email Updates" value={formData.emailUpdates ? 'Yes' : 'No'} />
                </ViewGrid>
              </Section>
            </div>
          )}

          {/* Logout Button */}
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

      {/* Logout Confirmation Modal */}
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

// --- Reusable Components (Styled with Tailwind) ---

interface SectionProps {
  title: string;
  icon: ReactNode; // Added icon prop
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
  name: keyof FormData;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  icon?: ReactNode; // Optional icon for input fields
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
  name: keyof FormData;
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
