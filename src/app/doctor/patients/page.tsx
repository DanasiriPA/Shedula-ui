"use client"; 

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaUserMd, FaChevronLeft, FaUserCircle, FaStethoscope, FaCalendarAlt,
  FaSignOutAlt, FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaSearch,
  FaVenusMars, FaBirthdayCake, FaPhone, FaMapMarkerAlt,
  FaBriefcaseMedical, FaFilePrescription
} from 'react-icons/fa';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  age: number;
  address: string;
  bloodGroup: string;
  height: string;
  weight: string;
  medicalHistory: string;
  allergies: string;
  medications: string;
  lastVisit: string;
  nextAppointment?: string;
  createdAt: string;
}

export default function PatientsPage() {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedPatient, setEditedPatient] = useState<Partial<Patient>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPatient, setNewPatient] = useState<Omit<Patient, 'id' | 'createdAt'>>({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    age: 0,
    address: '',
    bloodGroup: 'A+',
    height: '',
    weight: '',
    medicalHistory: '',
    allergies: '',
    medications: '',
    lastVisit: new Date().toISOString().split('T')[0],
    nextAppointment: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filteredResults = patients.filter((patient: Patient) => {
        return (
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.phone.includes(searchTerm)
        );
      });
      setFilteredPatients(filteredResults);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://json-server-7wzo.onrender.com/patients');
      if (!response.ok) throw new Error('Failed to fetch patients');
      const data = await response.json();
      setPatients(data);
      setFilteredPatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingId(patient.id);
    setEditedPatient({ ...patient });
  };

  const handleSave = async (id: string) => {
    try {
      const response = await fetch(`https://json-server-7wzo.onrender.com/patients/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedPatient),
      });

      if (!response.ok) throw new Error('Failed to update patient');

      setPatients(patients.map(patient => 
        patient.id === id ? { ...patient, ...editedPatient } : patient
      ));
      setEditingId(null);
    } catch (error) {
      console.error("Error updating patient:", error);
    }
  };

  const handleAddPatient = async () => {
    try {
      const response = await fetch('https://json-server-7wzo.onrender.com/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPatient,
          createdAt: new Date().toISOString()
        }),
      });

      if (!response.ok) throw new Error('Failed to add patient');

      const addedPatient = await response.json();
      setPatients([...patients, addedPatient]);
      setShowAddForm(false);
      setNewPatient({
        name: '',
        email: '',
        phone: '',
        gender: 'Male',
        age: 0,
        address: '',
        bloodGroup: 'A+',
        height: '',
        weight: '',
        medicalHistory: '',
        allergies: '',
        medications: '',
        lastVisit: new Date().toISOString().split('T')[0],
        nextAppointment: ''
      });
    } catch (error) {
      console.error("Error adding patient:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`https://json-server-7wzo.onrender.com/patients/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete patient');

      setPatients(patients.filter(patient => patient.id !== id));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting patient:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-200">
        <p className="text-xl text-gray-700">Loading patients...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 text-gray-900 font-inter relative overflow-x-hidden">
      <style jsx global>{`
        .bg-medical-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2393c5fd' fill-opacity='0.4'%3E%3Cpath d='M20 40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0-20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm40-40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2z'/%3E%3Cpath d='M42 20h-4v-4h-4v4h-4v4h4v4h4v-4h4v-4z'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 80px 80px;
          opacity: 0.5;
        }
      `}</style>

      <div className="absolute inset-0 z-0 bg-white bg-medical-pattern"></div>

      {/* Header/Navbar */}
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
          <motion.button 
            onClick={() => router.push("/doctor/patients")} 
            whileHover={{ y: -3, color: "#4F46E5" }} 
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 bg-blue-50 text-blue-700"
          >
            <FaUserMd className="text-blue-600" /> Patients
          </motion.button>
          <motion.button onClick={() => router.push("/doctor/profile")} whileHover={{ y: -3, color: "#4F46E5" }} className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
            <FaUserCircle className="text-blue-600" /> Profile
          </motion.button>
        </div>
        <motion.button
          onClick={() => router.push('/')} // Just redirect to home
          className="p-3 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors shadow-md"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaSignOutAlt className="text-xl" />
        </motion.button>
      </motion.div>

      <div className="relative z-10 pt-28 px-8 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors p-3 rounded-xl bg-blue-100 font-semibold"
          >
            <FaChevronLeft /> Back
          </button>
          
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus /> Add Patient
            </button>
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          Patient Records
        </h1>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Demographics
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medical Info
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {(patient.name || '').split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="ml-4">
                            {editingId === patient.id ? (
                              <input
                                type="text"
                                value={editedPatient.name || patient.name}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setEditedPatient({...editedPatient, name: e.target.value})}
                                className="border border-gray-300 rounded px-2 py-1"
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                            )}
                            <div className="text-sm text-gray-500">
                              {editingId === patient.id ? (
                                <input
                                  type="email"
                                  value={editedPatient.email || patient.email}
                                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEditedPatient({...editedPatient, email: e.target.value})}
                                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                                />
                              ) : (
                                patient.email
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {editingId === patient.id ? (
                            <input
                              type="tel"
                              value={editedPatient.phone || patient.phone}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => setEditedPatient({...editedPatient, phone: e.target.value})}
                              className="border border-gray-300 rounded px-2 py-1 text-sm"
                            />
                          ) : (
                            <div className="flex items-center gap-1">
                              <FaPhone className="text-gray-400" /> {patient.phone}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {editingId === patient.id ? (
                            <textarea
                              value={editedPatient.address || patient.address}
                              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditedPatient({...editedPatient, address: e.target.value})}
                              className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                              rows={2}
                            />
                          ) : (
                            <div className="flex items-start gap-1">
                              <FaMapMarkerAlt className="text-gray-400 mt-1 flex-shrink-0" />
                              <span className="line-clamp-2">{patient.address}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <FaVenusMars className="text-gray-400" />
                          {editingId === patient.id ? (
                            <select
                              value={editedPatient.gender || patient.gender}
                              onChange={(e: ChangeEvent<HTMLSelectElement>) => setEditedPatient({...editedPatient, gender: e.target.value})}
                              className="border border-gray-300 rounded px-2 py-1 text-sm"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          ) : (
                            patient.gender
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <FaBirthdayCake className="text-gray-400" />
                          {editingId === patient.id ? (
                            <input
                              type="number"
                              value={editedPatient.age !== undefined ? editedPatient.age : patient.age}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => setEditedPatient({...editedPatient, age: parseInt(e.target.value)})}
                              className="border border-gray-300 rounded px-2 py-1 text-sm w-16"
                            />
                          ) : (
                            `${patient.age} years`
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {editingId === patient.id ? (
                            <select
                              value={editedPatient.bloodGroup || patient.bloodGroup}
                              onChange={(e: ChangeEvent<HTMLSelectElement>) => setEditedPatient({...editedPatient, bloodGroup: e.target.value})}
                              className="border border-gray-300 rounded px-2 py-1 text-sm"
                            >
                              <option value="A+">A+</option>
                              <option value="A-">A-</option>
                              <option value="B+">B+</option>
                              <option value="B-">B-</option>
                              <option value="AB+">AB+</option>
                              <option value="AB-">AB-</option>
                              <option value="O+">O+</option>
                              <option value="O-">O-</option>
                            </select>
                          ) : (
                            `Blood: ${patient.bloodGroup}`
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {editingId === patient.id ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Height"
                                value={editedPatient.height || patient.height}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setEditedPatient({...editedPatient, height: e.target.value})}
                                className="border border-gray-300 rounded px-2 py-1 text-sm w-16"
                              />
                              <input
                                type="text"
                                placeholder="Weight"
                                value={editedPatient.weight || patient.weight}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setEditedPatient({...editedPatient, weight: e.target.value})}
                                className="border border-gray-300 rounded px-2 py-1 text-sm w-16"
                              />
                            </div>
                          ) : (
                            `${patient.height} / ${patient.weight}`
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingId === patient.id ? (
                          <input
                            type="date"
                            value={editedPatient.lastVisit || patient.lastVisit}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setEditedPatient({...editedPatient, lastVisit: e.target.value})}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        ) : (
                          new Date(patient.lastVisit).toLocaleDateString()
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingId === patient.id ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleSave(patient.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <FaSave size={18} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <FaTimes size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleEdit(patient)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FaEdit size={18} />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(patient.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No patients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Patient Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-400 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={24} />
              </button>

              <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
                Add New Patient
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newPatient.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPatient({...newPatient, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newPatient.email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPatient({...newPatient, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newPatient.phone}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPatient({...newPatient, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewPatient({...newPatient, gender: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={newPatient.age}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPatient({...newPatient, age: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <select
                    value={newPatient.bloodGroup}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewPatient({...newPatient, bloodGroup: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                  <input
                    type="text"
                    value={newPatient.height}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPatient({...newPatient, height: e.target.value})}
                    placeholder="e.g. 5'8\  172cm"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                  <input
                    type="text"
                    value={newPatient.weight}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPatient({...newPatient, weight: e.target.value})}
                    placeholder="e.g. 68kg or 150lbs"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={newPatient.address}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewPatient({...newPatient, address: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
                  <textarea
                    value={newPatient.medicalHistory}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewPatient({...newPatient, medicalHistory: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                  <textarea
                    value={newPatient.allergies}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewPatient({...newPatient, allergies: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Medications</label>
                  <textarea
                    value={newPatient.medications}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewPatient({...newPatient, medications: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Visit Date</label>
                  <input
                    type="date"
                    value={newPatient.lastVisit}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPatient({...newPatient, lastVisit: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Appointment (optional)</label>
                  <input
                    type="date"
                    value={newPatient.nextAppointment || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPatient({...newPatient, nextAppointment: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPatient}
                  disabled={!newPatient.name || !newPatient.email || !newPatient.phone}
                  className={`px-4 py-2 rounded-md text-white ${!newPatient.name || !newPatient.email || !newPatient.phone ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
                >
                  Add Patient
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                Delete Patient?
              </h3>
              <p className="text-center text-gray-600 mb-6">
                Are you sure you want to delete this patient record? This action cannot be undone.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaTrash /> Delete Record
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