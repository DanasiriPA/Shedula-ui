"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { 
  FaCalendarCheck, FaTimes, FaUserMd, FaChevronLeft, 
  FaUserCircle, FaStethoscope, FaBriefcaseMedical, FaSearch,
  FaMapMarkerAlt, FaEdit, FaTrash, FaLaptopMedical, FaCalendarAlt,
  FaSignOutAlt, FaFilePrescription,
  FaSave, FaPlus, FaTrashRestore, FaTrashAlt, FaCircle
} from 'react-icons/fa';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from "@/lib/utils";

type Slot = 'Morning' | 'Afternoon' | 'Night';
const ALL_SLOTS: Slot[] = ['Morning','Afternoon','Night'];

interface Medicine {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
  // New optional fields
  frequency?: Slot[]; // e.g. ["Morning","Night"]
  quantities?: Record<Slot, number>; // e.g. { Morning: 1, Afternoon: 0, Night: 1 }
}

interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName?: string; // Mark as optional
  doctorId: string;
  doctorName: string;
  date: string;
  medicines: Medicine[];
  notes: string;
  status: 'active' | 'completed' | 'cancelled';
  deleted?: boolean;
}

export default function PrescriptionsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
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

  // Helper: normalize a medicine record into current shape
  const normalizeMedicine = (m: any): Medicine => {
    // ensure safe defaults
    const name = m.name || '';
    const dosage = m.dosage || '';
    const duration = m.duration || '';
    const instructions = m.instructions || '';

    // If server already has quantities object, use that (and derive frequency where qty>0)
    const quantities: Record<Slot, number> = { Morning: 0, Afternoon: 0, Night: 0 };

    if (m.quantities && typeof m.quantities === 'object') {
      for (const s of ALL_SLOTS) {
        const maybe = (m.quantities as any)[s];
        quantities[s] = typeof maybe === 'number' ? maybe : 0;
      }
    } else {
      // Legacy: single quantity fields like quantity or qty
      const singleQty = typeof m.quantity === 'number' ? m.quantity : (typeof m.qty === 'number' ? m.qty : undefined);
      // If frequency exists (string or array) and there's a single qty, assign that qty to those slots
      if (singleQty !== undefined) {
        const freqArr: Slot[] = Array.isArray(m.frequency) ? m.frequency : (m.frequency ? [m.frequency] : []);
        for (const s of freqArr) {
          if (ALL_SLOTS.includes(s as Slot)) quantities[s as Slot] = singleQty;
        }
      } else if (m.frequency && Array.isArray(m.frequency)) {
        // frequencies exist but no quantities -> default selected slots to 1
        for (const s of m.frequency) {
          if (ALL_SLOTS.includes(s as Slot)) quantities[s as Slot] = 1;
        }
      } else if (m.frequency && typeof m.frequency === 'string') {
        // single slot string
        const s = m.frequency;
        if (ALL_SLOTS.includes(s as Slot)) quantities[s as Slot] = 1;
      } else {
        // fallback: nothing
      }
    }

    // derive frequency array from quantities > 0 if not provided
    let frequency: Slot[] = [];
    if (Array.isArray(m.frequency) && m.frequency.length > 0) {
      frequency = m.frequency.filter((f: any) => ALL_SLOTS.includes(f));
    } else {
      frequency = ALL_SLOTS.filter(s => quantities[s] > 0);
    }

    return {
      name,
      dosage,
      duration,
      instructions,
      frequency,
      quantities
    };
  };

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://json-server-7wzo.onrender.com/prescriptions');
      if (response.ok) {
        const data = await response.json();

        const prescriptionsWithStatus = data.map((prescription: any) => {
          const statuses: ('active' | 'completed' | 'cancelled')[] = ['active', 'completed', 'cancelled'];
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

          // Normalize medicines
          const meds = (prescription.medicines || []).map((m: any) => normalizeMedicine(m));

          return {
            ...prescription,
            patientName: prescription.patientName || 'Unknown Patient',
            status: prescription.status || randomStatus,
            deleted: prescription.deleted || false,
            medicines: meds
          } as Prescription;
        });

        setPrescriptions(prescriptionsWithStatus);
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (status: 'active' | 'completed' | 'cancelled') => {
    if (!editedPrescription) return;
    setEditedPrescription({
      ...editedPrescription,
      status
    });
  };

  const handleDelete = async (id: string, permanent = false) => {
    try {
      if (permanent) {
        const response = await fetch(`https://json-server-7wzo.onrender.com/prescriptions/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete prescription');
        }
        
        setPrescriptions(prescriptions.filter(p => p.id !== id));
      } else {
        // Soft delete - mark as deleted
        const prescriptionToDelete = prescriptions.find(p => p.id === id);
        if (!prescriptionToDelete) return;
        
        const updatedPrescription = {
          ...prescriptionToDelete,
          deleted: true
        };
        
        const response = await fetch(`https://json-server-7wzo.onrender.com/prescriptions/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedPrescription),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update prescription');
        }
        
        setPrescriptions(prescriptions.map(p => 
          p.id === id ? updatedPrescription : p
        ));
      }
      
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting prescription:", error);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const prescriptionToRestore = prescriptions.find(p => p.id === id);
      if (!prescriptionToRestore) return;
      
      const updatedPrescription = {
        ...prescriptionToRestore,
        deleted: false
      };
      
      const response = await fetch(`https://json-server-7wzo.onrender.com/prescriptions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPrescription),
      });
      
      if (!response.ok) {
        throw new Error('Failed to restore prescription');
      }
      
      setPrescriptions(prescriptions.map(p => 
        p.id === id ? updatedPrescription : p
      ));
    } catch (error) {
      console.error("Error restoring prescription:", error);
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
    if (showDeleted) {
      return p.deleted;
    }
    
    const matchesSearch = 
      (p.patientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (p.appointmentId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      p.medicines?.some(m => 
        (m.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    
    const matchesStatus = 
      filterStatus === 'all' || 
      p.status === filterStatus;
    
    return !p.deleted && matchesSearch && matchesStatus;
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

  // helper to render frequency badges for a medicine
  const renderFrequency = (medicine: Medicine) => {
    // If frequency available use it; else infer from quantities
    const freq = (medicine.frequency && medicine.frequency.length > 0)
      ? medicine.frequency
      : (medicine.quantities ? ALL_SLOTS.filter(s => (medicine.quantities?.[s] ?? 0) > 0) : []);

    if (!freq || freq.length === 0) {
      return <span className="text-sm text-gray-500">Frequency: Not specified</span>;
    }

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {freq.map(slot => {
          const qty = medicine.quantities?.[slot] ?? 0;
          return (
            <span
              key={slot}
              className="inline-flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800"
            >
              {slot}{qty ? ` (${qty})` : ''}
            </span>
          );
        })}
      </div>
    );
  };

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
            <button
              onClick={() => setShowDeleted(!showDeleted)}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                showDeleted 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {showDeleted ? (
                <>
                  <FaFilePrescription /> View Active
                </>
              ) : (
                <>
                  <FaTrashAlt /> View Deleted
                </>
              )}
            </button>
            {!showDeleted && (
              <Link
                href="/doctor/prescriptions/create"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaFilePrescription /> Create New
              </Link>
            )}
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          {showDeleted ? 'Deleted Prescriptions' : 'Patient Prescriptions'}
        </h1>

        {/* Search and Filter */}
        {!showDeleted && (
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
        )}

        {/* Prescriptions List */}
        <div className="space-y-6">
          {filteredPrescriptions.length > 0 ? (
            filteredPrescriptions.map(prescription => (
              <motion.div
                key={prescription.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`bg-white p-6 rounded-2xl shadow-xl border-2 ${
                  prescription.deleted 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-transparent bg-gradient-to-br from-blue-50 via-white to-purple-50'
                }`}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                      prescription.deleted 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {prescription.patientName?.split(' ').map(n => n[0]).join('') || 'NA'}
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
                          <h3 className="text-2xl font-bold text-gray-900">
                            {prescription.patientName}
                            {prescription.deleted && (
                              <span className="ml-2 text-sm font-normal text-red-600">(Deleted)</span>
                            )}
                          </h3>
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
                          <p className="flex items-center gap-2 text-gray-700">
                            <FaLaptopMedical className="text-blue-500" />
                            Status: 
                            {editingId === prescription.id && editedPrescription ? (
                              <select
                                value={editedPrescription.status}
                                onChange={(e) => handleStatusChange(e.target.value as 'active' | 'completed' | 'cancelled')}
                                className="px-2 py-1 rounded-full text-xs font-bold border border-gray-300"
                              >
                                <option value="active" className="bg-blue-100 text-blue-800">ACTIVE</option>
                                <option value="completed" className="bg-green-100 text-green-800">COMPLETED</option>
                                <option value="cancelled" className="bg-red-100 text-red-800">CANCELLED</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                prescription.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                prescription.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {prescription.status.toUpperCase()}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        {prescription.deleted ? (
                          <div className="flex flex-col items-center">
                            <span className="px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-800 mb-2">
                              DELETED
                            </span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleRestore(prescription.id)}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                title="Restore"
                              >
                                <FaTrashRestore />
                              </button>
                              <button 
                                onClick={() => setShowDeleteConfirm(prescription.id)}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                title="Permanently Delete"
                              >
                                <FaTrashAlt />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2 mb-2">
                              <FaCircle 
                                className={`text-xs ${
                                  prescription.status === 'active' ? 'text-blue-500' :
                                  prescription.status === 'completed' ? 'text-green-500' :
                                  'text-red-500'
                                }`} 
                              />
                              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                prescription.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                prescription.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {prescription.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {editingId === prescription.id ? (
                                <>
                                  <button 
                                    onClick={handleSave}
                                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                    title="Save"
                                  >
                                    <FaSave />
                                  </button>
                                  <button 
                                    onClick={handleCancelEdit}
                                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                    title="Cancel"
                                  >
                                    <FaTimes />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => handleEdit(prescription)}
                                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                    title="Edit"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button 
                                    onClick={() => setShowDeleteConfirm(prescription.id)}
                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                    title="Delete"
                                  >
                                    <FaTrash />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Medicines List */}
                    <div className="mt-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Medicines:</h4>
                      <div className="space-y-3">
                        {(editingId === prescription.id && editedPrescription ? editedPrescription.medicines : prescription.medicines).map((medicine, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div className="w-full">
                                {editingId === prescription.id && editedPrescription ? (
                                  <>
                                    <input
                                      type="text"
                                      value={medicine.name}
                                      onChange={(e) => {
                                        const updatedMedicines = [...editedPrescription.medicines];
                                        updatedMedicines[index] = { ...updatedMedicines[index], name: e.target.value };
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
                                        updatedMedicines[index] = { ...updatedMedicines[index], dosage: e.target.value };
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
                                        updatedMedicines[index] = { ...updatedMedicines[index], duration: e.target.value };
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
                                        updatedMedicines[index] = { ...updatedMedicines[index], instructions: e.target.value };
                                        setEditedPrescription({
                                          ...editedPrescription,
                                          medicines: updatedMedicines
                                        });
                                      }}
                                      className="text-sm text-gray-600 border rounded-lg px-2 py-1 w-full"
                                      placeholder="Instructions"
                                    />
                                    {/* show frequency badges while editing as info (editing controls could be added later) */}
                                    <div className="mt-2">
                                      {renderFrequency(medicine)}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <p className="font-medium text-gray-900">{medicine.name}</p>
                                    <p className="text-sm text-gray-600">Dosage: {medicine.dosage}</p>
                                    <p className="text-sm text-gray-600">Duration: {medicine.duration}</p>
                                    {medicine.instructions && (
                                      <p className="text-sm text-gray-600 mt-1">Instructions: {medicine.instructions}</p>
                                    )}
                                    {/* Display frequency badges */}
                                    <div className="mt-2">
                                      {renderFrequency(medicine)}
                                    </div>
                                  </>
                                )}
                              </div>
                              {editingId === prescription.id && (
                                <button
                                  onClick={() => handleRemoveMedicine(index)}
                                  className="p-1 text-red-500 hover:text-red-700"
                                  title="Remove medicine"
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
              <p className="text-xl text-gray-600">
                {showDeleted 
                  ? 'No deleted prescriptions found.' 
                  : 'No prescriptions found matching your criteria.'}
              </p>
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
                {showDeleted ? 'Permanently Delete Prescription?' : 'Delete Prescription?'}
              </h3>
              <p className="text-center text-gray-600 mb-6">
                {showDeleted 
                  ? 'This will permanently remove the prescription from the system. This action cannot be undone.'
                  : 'Are you sure you want to delete this prescription? You can restore it later from the deleted prescriptions.'}
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => handleDelete(showDeleteConfirm, showDeleted)}
                  className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaTimes /> {showDeleted ? 'Permanently Delete' : 'Delete'}
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