// src/app/doctor/prescriptions/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { 
  FaCalendarCheck, FaTimes, FaUserMd, FaChevronLeft, 
  FaUserCircle, FaStethoscope, FaBriefcaseMedical, FaSearch,
  FaMapMarkerAlt, FaEdit, FaTrash, FaCalendarAlt,
  FaSignOutAlt, FaFilePrescription,
  FaSave, FaPlus
} from 'react-icons/fa';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from "@/lib/utils";

interface Medicine {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
}

interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  medicines: Medicine[];
  notes: string;
  status: 'active' | 'completed' | 'cancelled';
}

export default function PrescriptionsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedPrescription, setEditedPrescription] = useState<Prescription | null>(null);
  const [newMedicine, setNewMedicine] = useState<Medicine>({
    name: '',
    dosage: '',
    duration: '',
    instructions: ''
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchPrescriptions();
      } else {
        setUser(null);
        setLoading(false);
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://json-server-7wzo.onrender.com/prescriptions');
      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data);
      } else {
        throw new Error('Failed to fetch prescriptions');
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`https://json-server-7wzo.onrender.com/prescriptions/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete prescription');
      }
      
      setPrescriptions(prescriptions.filter(p => p.id !== id));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting prescription:", error);
    }
  };

  const handleEdit = (prescription: Prescription) => {
    setEditingId(prescription.id);
    setEditedPrescription({ ...prescription });
  };

  const handleSave = async () => {
    if (!editedPrescription) return;

    try {
      const response = await fetch(`https://json-server-7wzo.onrender.com/prescriptions/${editedPrescription.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedPrescription),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update prescription');
      }
      
      setPrescriptions(prescriptions.map(p => 
        p.id === editedPrescription.id ? editedPrescription : p
      ));
      setEditingId(null);
      setEditedPrescription(null);
    } catch (error) {
      console.error("Error updating prescription:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedPrescription(null);
  };

  const handleAddMedicine = () => {
    if (!editedPrescription) return;
    
    const updatedPrescription = {
      ...editedPrescription,
      medicines: [...editedPrescription.medicines, newMedicine]
    };
    
    setEditedPrescription(updatedPrescription);
    setNewMedicine({
      name: '',
      dosage: '',
      duration: '',
      instructions: ''
    });
  };

  const handleRemoveMedicine = (index: number) => {
    if (!editedPrescription) return;
    
    const updatedMedicines = [...editedPrescription.medicines];
    updatedMedicines.splice(index, 1);
    
    setEditedPrescription({
      ...editedPrescription,
      medicines: updatedMedicines
    });
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    const matchesSearch = 
      p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.appointmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.medicines.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = 
      filterStatus === 'all' || 
      p.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-800">Loading prescriptions...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-inter relative overflow-x-hidden">
      <style jsx global>{`
        .bg-medical-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2393c5fd' fill-opacity='0.2'%3E%3Cpath d='M20 40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0-20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm40-40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2z'/%3E%3Cpath d='M42 20h-4v-4h-4v4h-4v4h4v4h4v-4h4v-4z'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 80px 80px;
          opacity: 0.5;
        }
      `}</style>

      {/* Navbar */}
      <div className="absolute inset-0 z-0 bg-white bg-medical-pattern"></div>
      <motion.div
        className={`fixed top-0 left-0 right-0 z-50 py-5 px-8 flex justify-between items-center transition-all duration-300 rounded-b-3xl shadow-xl bg-white/90 backdrop-blur-md border-b-2 border-transparent bg-origin-border bg-clip-border bg-gradient-to-br from-blue-200 via-white to-purple-200`}
      >
        <div className="flex items-center gap-4">
          <Image src="https://i.postimg.cc/SKnMMNcw/360-F-863843181_63-Nv8tgy-BU8-X26-B1-Lq-Qvfi0tn95aj-Sg-X.jpg" alt="Shedula Logo" width={45} height={45} className="rounded-full shadow-md" />
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
            onClick={() => router.push("/doctor/prescriptions")} 
            whileHover={{ y: -3, color: "#4F46E5" }} 
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 bg-blue-50 text-blue-700"
          >
            <FaFilePrescription className="text-blue-600" /> Prescriptions
          </motion.button>
          <motion.button onClick={() => router.push("/doctor/patients")} whileHover={{ y: -3, color: "#4F46E5" }} className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
            <FaUserMd className="text-blue-600" /> Patients
          </motion.button>
          <motion.button onClick={() => router.push("/doctor/profile")} whileHover={{ y: -3, color: "#4F46E5" }} className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
            <FaUserCircle className="text-blue-600" /> Profile
          </motion.button>
        </div>
        <motion.button
          onClick={() => auth.signOut().then(() => router.push('/'))}
          className="p-3 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors shadow-md"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaSignOutAlt className="text-xl" />
        </motion.button>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 pt-28 px-8 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors p-3 rounded-xl bg-blue-100 font-semibold"
          >
            <FaChevronLeft /> Back
          </button>
          
          <div className="flex gap-4">
            <Link
              href="/doctor/prescriptions/create"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaFilePrescription /> Create New
            </Link>
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          Patient Prescriptions
        </h1>

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by patient, appointment ID, or medicine..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <select
                className="px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'completed' | 'cancelled')}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="space-y-6">
          {filteredPrescriptions.length > 0 ? (
            filteredPrescriptions.map(prescription => (
              <motion.div
                key={prescription.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-2xl shadow-xl border-2 border-transparent bg-origin-border bg-clip-border bg-gradient-to-br from-blue-50 via-white to-purple-50"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                      {prescription.patientName.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div>
                        {editingId === prescription.id && editedPrescription ? (
                          <input
                            type="text"
                            value={editedPrescription.patientName}
                            onChange={(e) => setEditedPrescription({
                              ...editedPrescription,
                              patientName: e.target.value
                            })}
                            className="text-2xl font-bold text-gray-900 border rounded-lg px-2 py-1 mb-2 w-full"
                          />
                        ) : (
                          <h3 className="text-2xl font-bold text-gray-900">{prescription.patientName}</h3>
                        )}
                        <p className="text-gray-600">Appointment ID: {prescription.appointmentId}</p>
                        <div className="mt-4 space-y-2">
                          <p className="flex items-center gap-2 text-gray-700">
                            <FaCalendarCheck className="text-blue-500" /> 
                            {formatDate(prescription.date)}
                          </p>
                          <p className="flex items-center gap-2 text-gray-700">
                            <FaFilePrescription className="text-purple-500" />
                            {prescription.medicines.length} {prescription.medicines.length === 1 ? 'medicine' : 'medicines'} prescribed
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          prescription.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          prescription.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {prescription.status?.toUpperCase()}
                        </span>
                        <div className="flex gap-2 mt-2">
                          {editingId === prescription.id ? (
                            <>
                              <button 
                                onClick={handleSave}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                              >
                                <FaSave />
                              </button>
                              <button 
                                onClick={handleCancelEdit}
                                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                <FaTimes />
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => handleEdit(prescription)}
                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                              >
                                <FaEdit />
                              </button>
                              <button 
                                onClick={() => setShowDeleteConfirm(prescription.id)}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              >
                                <FaTrash />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Medicines List */}
                    <div className="mt-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Medicines:</h4>
                      <div className="space-y-3">
                        {(editingId === prescription.id && editedPrescription ? editedPrescription.medicines : prescription.medicines).map((medicine, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                {editingId === prescription.id && editedPrescription ? (
                                  <>
                                    <input
                                      type="text"
                                      value={medicine.name}
                                      onChange={(e) => {
                                        const updatedMedicines = [...editedPrescription.medicines];
                                        updatedMedicines[index].name = e.target.value;
                                        setEditedPrescription({
                                          ...editedPrescription,
                                          medicines: updatedMedicines
                                        });
                                      }}
                                      className="font-medium text-gray-900 border rounded-lg px-2 py-1 mb-1 w-full"
                                      placeholder="Medicine name"
                                    />
                                    <input
                                      type="text"
                                      value={medicine.dosage}
                                      onChange={(e) => {
                                        const updatedMedicines = [...editedPrescription.medicines];
                                        updatedMedicines[index].dosage = e.target.value;
                                        setEditedPrescription({
                                          ...editedPrescription,
                                          medicines: updatedMedicines
                                        });
                                      }}
                                      className="text-sm text-gray-600 border rounded-lg px-2 py-1 mb-1 w-full"
                                      placeholder="Dosage"
                                    />
                                    <input
                                      type="text"
                                      value={medicine.duration}
                                      onChange={(e) => {
                                        const updatedMedicines = [...editedPrescription.medicines];
                                        updatedMedicines[index].duration = e.target.value;
                                        setEditedPrescription({
                                          ...editedPrescription,
                                          medicines: updatedMedicines
                                        });
                                      }}
                                      className="text-sm text-gray-600 border rounded-lg px-2 py-1 mb-1 w-full"
                                      placeholder="Duration"
                                    />
                                    <input
                                      type="text"
                                      value={medicine.instructions}
                                      onChange={(e) => {
                                        const updatedMedicines = [...editedPrescription.medicines];
                                        updatedMedicines[index].instructions = e.target.value;
                                        setEditedPrescription({
                                          ...editedPrescription,
                                          medicines: updatedMedicines
                                        });
                                      }}
                                      className="text-sm text-gray-600 border rounded-lg px-2 py-1 w-full"
                                      placeholder="Instructions"
                                    />
                                  </>
                                ) : (
                                  <>
                                    <p className="font-medium text-gray-900">{medicine.name}</p>
                                    <p className="text-sm text-gray-600">Dosage: {medicine.dosage}</p>
                                    <p className="text-sm text-gray-600">Duration: {medicine.duration}</p>
                                    {medicine.instructions && (
                                      <p className="text-sm text-gray-600 mt-1">Instructions: {medicine.instructions}</p>
                                    )}
                                  </>
                                )}
                              </div>
                              {editingId === prescription.id && (
                                <button
                                  onClick={() => handleRemoveMedicine(index)}
                                  className="p-1 text-red-500 hover:text-red-700"
                                >
                                  <FaTimes />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                        {editingId === prescription.id && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h5 className="font-medium text-blue-800 mb-2">Add New Medicine</h5>
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={newMedicine.name}
                                onChange={(e) => setNewMedicine({
                                  ...newMedicine,
                                  name: e.target.value
                                })}
                                className="w-full border rounded-lg px-2 py-1 text-sm"
                                placeholder="Medicine name"
                              />
                              <input
                                type="text"
                                value={newMedicine.dosage}
                                onChange={(e) => setNewMedicine({
                                  ...newMedicine,
                                  dosage: e.target.value
                                })}
                                className="w-full border rounded-lg px-2 py-1 text-sm"
                                placeholder="Dosage"
                              />
                              <input
                                type="text"
                                value={newMedicine.duration}
                                onChange={(e) => setNewMedicine({
                                  ...newMedicine,
                                  duration: e.target.value
                                })}
                                className="w-full border rounded-lg px-2 py-1 text-sm"
                                placeholder="Duration"
                              />
                              <input
                                type="text"
                                value={newMedicine.instructions}
                                onChange={(e) => setNewMedicine({
                                  ...newMedicine,
                                  instructions: e.target.value
                                })}
                                className="w-full border rounded-lg px-2 py-1 text-sm"
                                placeholder="Instructions"
                              />
                              <button
                                onClick={handleAddMedicine}
                                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                                disabled={!newMedicine.name}
                              >
                                <FaPlus size={12} /> Add Medicine
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Doctor's Notes */}
                    <div className="mt-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Doctor&apos;s Notes:</h4>
                      {editingId === prescription.id && editedPrescription ? (
                        <textarea
                          value={editedPrescription.notes}
                          onChange={(e) => setEditedPrescription({
                            ...editedPrescription,
                            notes: e.target.value
                          })}
                          className="w-full border rounded-lg p-3 text-gray-700 bg-gray-50"
                          rows={3}
                        />
                      ) : (
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{prescription.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p-8 text-center rounded-2xl shadow-xl border-2 border-transparent bg-origin-border bg-clip-border bg-gradient-to-br from-blue-50 via-white to-purple-50"
            >
              <FaFilePrescription className="text-gray-400 mx-auto mb-4" size={50} />
              <p className="text-xl text-gray-600">No prescriptions found matching your criteria.</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-400 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={24} />
              </button>

              <div className="flex justify-center mb-4">
                <FaTimes className="w-16 h-16 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
                Delete Prescription?
              </h3>
              <p className="text-center text-gray-600 mb-6">
                Are you sure you want to delete this prescription? This action cannot be undone.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaTimes /> Delete Prescription
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
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
              <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Appointments</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Patients</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Profile</a></li>
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
  );
}