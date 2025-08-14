"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FaFilePrescription, FaUser, FaCalendarAlt, FaPills, FaSave, FaTimes, FaChevronLeft, FaNotesMedical, FaPlus
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Slot = 'Morning' | 'Afternoon' | 'Night';

interface Medicine {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
  frequency: Slot[]; // e.g. ["Morning","Night"]
  quantities: Record<Slot, number>; // per-slot quantities
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

interface LegacyMedicine {
  name?: string;
  dosage?: string;
  duration?: string;
  instructions?: string;
  frequency?: Slot | Slot[];
  quantities?: Record<string, number>;
  quantity?: number;
  qty?: number;
} 

const ALL_SLOTS: Slot[] = ['Morning', 'Afternoon', 'Night'];

export default function CreatePrescriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emptyMedicine = (): Medicine => ({
    name: '',
    dosage: '',
    duration: '',
    instructions: '',
    frequency: [],
    quantities: { Morning: 0, Afternoon: 0, Night: 0 }
  });

  const [prescription, setPrescription] = useState<Prescription>({
    id: '',
    appointmentId: '',
    patientId: '',
    patientName: '',
    doctorId: 'doc123',
    doctorName: 'Dr. Sarah Johnson',
    date: new Date().toISOString(),
    medicines: [emptyMedicine()],
    notes: '',
    status: 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const appointmentId = searchParams.get('appointmentId');

        if (appointmentId) {
          // For app1-app10: Use JSON server
          if (appointmentId.match(/^app([1-9]|10)$/)) {
            const res = await fetch(`https://json-server-7wzo.onrender.com/prescriptions?appointmentId=${appointmentId}`);
            const data = await res.json();

            if (data.length > 0) {
              // Normalize medicines (backwards compat)
              const normalized = {
                ...data[0],
                medicines: (data[0].medicines || []).map((m: LegacyMedicine) => {
                  // If older shape had single quantity/qty, distribute to selected slots
                  const freq: Slot[] = Array.isArray(m.frequency) ? m.frequency : (m.frequency ? [m.frequency] : []);
                  const singleQty = typeof m.quantity === 'number' ? m.quantity : (typeof m.qty === 'number' ? m.qty : undefined);
                  const quantities: Record<Slot, number> = {
                    Morning: 0, Afternoon: 0, Night: 0
                  };

                  if (m.quantities && typeof m.quantities === 'object') {
                    // copy known slots
                    for (const s of ALL_SLOTS) {
                      const maybe = m.quantities?.[s];
                      quantities[s] = typeof maybe === 'number' ? maybe : 0;
                    }
                  } else if (singleQty !== undefined) {
                    // assign the same single quantity to all selected slots (legacy behavior)
                    for (const s of freq) {
                      if (ALL_SLOTS.includes(s as Slot)) {
                        quantities[s as Slot] = singleQty;
                      }
                    }
                  }

                  return {
                    name: m.name || '',
                    dosage: m.dosage || '',
                    duration: m.duration || '',
                    instructions: m.instructions || '',
                    frequency: freq,
                    quantities
                  } as Medicine;
                })
              };
              setPrescription(prev => ({
                ...prev,
                ...normalized
              }));
              setEditingId(data[0].id?.toString ? data[0].id.toString() : null);
            } else {
              // Initialize new prescription with appointment ID and possible patientName
              setPrescription(prev => ({
                ...prev,
                appointmentId,
                patientName: searchParams.get('patientName') || `Patient ${appointmentId.replace('app', '')}`
              }));
            }
          }
          // For app11+: Use Firebase
          else {
            const q = query(
              collection(db, "appointments"),
              where("appointmentId", "==", appointmentId),
              limit(1)
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
              const doc = snapshot.docs[0];
              const data = doc.data();

              const meds = (data.medicines || [emptyMedicine()]).map((m: LegacyMedicine) => {
                const freq: Slot[] = Array.isArray(m.frequency) ? m.frequency : (m.frequency ? [m.frequency] : []);
                const quantities: Record<Slot, number> = { Morning: 0, Afternoon: 0, Night: 0 };

                if (m.quantities && typeof m.quantities === 'object') {
                  for (const s of ALL_SLOTS) {
                    const maybe = m.quantities?.[s];
                    quantities[s] = typeof maybe === 'number' ? maybe : 0;
                  }
                } else {
                  // legacy single qty
                  const singleQty = typeof m.quantity === 'number' ? m.quantity : (typeof m.qty === 'number' ? m.qty : undefined);
                  if (singleQty !== undefined) {
                    for (const s of freq) {
                      if (ALL_SLOTS.includes(s as Slot)) quantities[s as Slot] = singleQty;
                    }
                  }
                }

                return {
                  name: m.name || '',
                  dosage: m.dosage || '',
                  duration: m.duration || '',
                  instructions: m.instructions || '',
                  frequency: freq,
                  quantities
                } as Medicine;
              });

              setPrescription({
                id: doc.id,
                appointmentId: data.appointmentId,
                patientId: data.patientId,
                patientName: data.patientName,
                doctorId: data.doctorId,
                doctorName: data.doctorName,
                date: data.date,
                medicines: meds,
                notes: data.notes || '',
                status: data.status || 'active'
              });
              setEditingId(doc.id);
            } else {
              setPrescription(prev => ({
                ...prev,
                appointmentId,
                patientName: searchParams.get('patientName') || `Patient ${appointmentId.replace('app', '')}`
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching prescription data:', error);
        setError('Failed to load prescription data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const addMedicine = () => {
    setPrescription(prev => ({
      ...prev,
      medicines: [...prev.medicines, emptyMedicine()]
    }));
  };

  const removeMedicine = (index: number) => {
    if (prescription.medicines.length <= 1) return;

    setPrescription(prev => {
      const newMedicines = prev.medicines.slice();
      newMedicines.splice(index, 1);
      return { ...prev, medicines: newMedicines };
    });
  };

  // generic field updater for medicine (name, dosage, duration, instructions)
  const updateMedicine = <K extends keyof Omit<Medicine, 'frequency' | 'quantities'>>(
  index: number,
  field: K,
  value: Medicine[K]
) => {
    setPrescription(prev => {
      const newMedicines = prev.medicines.slice();
      const med = { ...newMedicines[index] };
      med[field] = value;
      newMedicines[index] = med;
      return { ...prev, medicines: newMedicines };
    });
  };

  // toggle frequency for a slot, and ensure we don't mutate nested state objects directly
  const toggleFrequency = (index: number, slot: Slot) => {
    setPrescription(prev => {
      const newMedicines = prev.medicines.slice();
      const med = { ...newMedicines[index], frequency: [...(newMedicines[index].frequency || [])], quantities: { ...newMedicines[index].quantities } };

      const found = med.frequency.indexOf(slot);
      if (found >= 0) {
        // remove
        med.frequency.splice(found, 1);
        // optionally zero out the quantity for that slot (keeps it but set to 0 for clarity)
        med.quantities[slot] = 0;
      } else {
        // add
        med.frequency.push(slot);
        // ensure a sensible default quantity if previously zero
        if (!med.quantities[slot] || med.quantities[slot] <= 0) med.quantities[slot] = 1;
      }

      newMedicines[index] = med;
      return { ...prev, medicines: newMedicines };
    });
  };

  // update quantity for a specific slot
  const updateSlotQuantity = (index: number, slot: Slot, value: number) => {
    setPrescription(prev => {
      const newMedicines = prev.medicines.slice();
      const med = { ...newMedicines[index], frequency: [...(newMedicines[index].frequency || [])], quantities: { ...newMedicines[index].quantities } };

      med.quantities[slot] = value;
      // if user sets a positive quantity ensure the slot is included in frequency
      if (value > 0 && med.frequency.indexOf(slot) < 0) {
        med.frequency = [...med.frequency, slot];
      }
      // if user sets quantity to 0, do not force removal of the slot (toggle still controls it),
      // but validation will later catch selected slots with 0 quantity.
      newMedicines[index] = med;
      return { ...prev, medicines: newMedicines };
    });
  };

  const validatePrescription = (data: Prescription): string | null => {
    if (!data.patientName || !data.patientName.trim()) return 'Patient name is required';
    if (!data.appointmentId || !data.appointmentId.trim()) return 'Appointment ID is required';

    const validMedicines = data.medicines.filter(m => m.name && m.name.trim() !== '');
    if (validMedicines.length === 0) return 'At least one medicine is required';

    for (const med of validMedicines) {
      if (!med.dosage || !med.dosage.trim()) return 'Dosage is required for all medicines';
      if (!med.duration || !med.duration.trim()) return 'Duration is required for all medicines';
      if (!med.frequency || med.frequency.length === 0) return 'Select frequency (Morning/Afternoon/Night) for each medicine';
      // for each selected slot, quantity must be >= 1
      for (const slot of med.frequency) {
        const q = med.quantities?.[slot as Slot];
        if (typeof q !== 'number' || q < 1) {
          return `Quantity for ${slot} must be at least 1 for medicine "${med.name}"`;
        }
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const validationError = validatePrescription(prescription);
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      const prescriptionData = {
        patientName: prescription.patientName.trim(),
        appointmentId: prescription.appointmentId.trim(),
        doctorId: prescription.doctorId.trim(),
        doctorName: prescription.doctorName.trim(),
        date: new Date().toISOString().split('T')[0],
        medicines: prescription.medicines
          .filter(m => m.name.trim() !== '')
          .map(m => ({
            name: m.name.trim(),
            dosage: m.dosage.trim(),
            duration: m.duration.trim(),
            instructions: m.instructions.trim(),
            frequency: m.frequency || [],
            quantities: m.quantities || { Morning: 0, Afternoon: 0, Night: 0 }
          })),
        notes: prescription.notes.trim(),
        status: prescription.status
      };

      const baseUrl = 'https://json-server-7wzo.onrender.com/prescriptions';

      // Only PUT if editingId is a numeric JSON-server ID
      const isJsonServerId = editingId && /^\d+$/.test(editingId);
      const method = isJsonServerId ? 'PUT' : 'POST';
      const endpoint = isJsonServerId ? `${baseUrl}/${editingId}` : baseUrl;

      console.log('Saving to JSON-server:', method, endpoint, prescriptionData);

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prescriptionData),
      });

      if (!response.ok) {
        throw new Error(`JSON-server error ${response.status}`);
      }

      await response.json();
      // navigate back to doctor's appointments; query param to tell appointment page to open the prescription
      router.push(`/doctor/appointments?prescriptionSaved=true&appointmentId=${prescription.appointmentId}`);
    } catch (error) {
      console.error('Save prescription error:', error);
      let displayMessage = 'Failed to save prescription';
      if (error instanceof Error && error.message.includes('404')) {
        displayMessage = 'Prescription service unavailable. Please try again later.';
      }
      setError(displayMessage);
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading prescription data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-inter relative overflow-x-hidden">
      {/* Navbar and other existing components remain the same */}
      {/* ... */}

      {/* Main Content */}
      <div className="relative z-10 pt-28 px-8 pb-16">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors p-3 rounded-xl bg-blue-100 font-semibold"
          >
            <FaChevronLeft /> Back
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-8 rounded-2xl shadow-xl border-2 border-transparent bg-origin-border bg-clip-border bg-gradient-to-br from-blue-50 via-white to-purple-50"
        >
          <h1 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            {editingId ? 'Edit Prescription' : 'Create New Prescription'}
          </h1>

          {error && (
            <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">
                  <FaUser className="inline mr-2 text-blue-500" />
                  Patient Name
                </label>
                <input
                  type="text"
                  value={prescription.patientName}
                  onChange={(e) => setPrescription(prev => ({ ...prev, patientName: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter patient name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">
                  <FaCalendarAlt className="inline mr-2 text-blue-500" />
                  Appointment ID
                </label>
                <input
                  type="text"
                  value={prescription.appointmentId}
                  onChange={(e) => setPrescription(prev => ({ ...prev, appointmentId: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter appointment ID"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  <FaPills className="inline mr-2 text-purple-500" />
                  Medicines
                </h3>
                <button
                  type="button"
                  onClick={addMedicine}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaPlus /> Add Medicine
                </button>
              </div>

              {prescription.medicines.map((medicine, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Medicine Name*</label>
                      <input
                        type="text"
                        value={medicine.name}
                        onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Medicine name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Dosage*</label>
                      <input
                        type="text"
                        value={medicine.dosage}
                        onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 500mg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Duration*</label>
                      <input
                        type="text"
                        value={medicine.duration}
                        onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 7 days"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Instructions</label>
                      <input
                        type="text"
                        value={medicine.instructions}
                        onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., After meals"
                      />
                    </div>
                  </div>

                  {/* Frequency selector with per-slot quantity */}
                  <div className="mb-3">
                    <label className="block text-sm text-gray-600 mb-1">Frequency* (click slot to toggle)</label>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2 items-center">
                        {ALL_SLOTS.map(slot => {
                          const active = (medicine.frequency || []).includes(slot);
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => toggleFrequency(index, slot)}
                              className={`px-3 py-1 rounded-lg border ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                        <span className="text-sm text-gray-500 self-center ml-3">(* select one or more)</span>
                      </div>

                      <div className="flex gap-4 items-center">
                        {ALL_SLOTS.map(slot => {
                          const active = (medicine.frequency || []).includes(slot);
                          return (
                            <div key={slot} className="flex items-center gap-2">
                              <label className="text-sm text-gray-600">{slot} Qty</label>
                              <input
                                type="number"
                                min={0}
                                step={1}
                                value={medicine.quantities?.[slot] ?? 0}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value || '0', 10);
                                  updateSlotQuantity(index, slot, Number.isNaN(val) ? 0 : val);
                                }}
                                disabled={!active}
                                className={`w-20 px-2 py-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${!active ? 'opacity-60 bg-gray-100' : ''}`}
                                title={active ? `${slot} quantity` : `Enable ${slot} to edit quantity`}
                              />
                            </div>
                          );
                        })}
                        <p className="text-sm text-gray-500">Units per dose for each selected slot</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div />
                    <button
                      type="button"
                      onClick={() => removeMedicine(index)}
                      className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                      disabled={prescription.medicines.length <= 1}
                    >
                      <FaTimes /> Remove this medicine
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="block text-gray-700 font-medium">
                <FaNotesMedical className="inline mr-2 text-blue-500" />
                <p>{"Doctor's Notes"}</p>
              </label>
              <textarea
                value={prescription.notes}
                onChange={(e) => setPrescription(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Enter any additional notes or instructions"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-gray-700 font-medium">
                <FaFilePrescription className="inline mr-2 text-blue-500" />
                Status
              </label>
              <select
                value={prescription.status}
                onChange={(e) => setPrescription(prev => ({ ...prev, status: e.target.value as 'active' | 'completed' | 'cancelled' }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
              >
                <FaTimes /> Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                <FaSave /> {isSubmitting ? 'Saving...' : 'Save Prescription'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Footer remains the same */}
      {/* ... */}
    </div>
  );
}