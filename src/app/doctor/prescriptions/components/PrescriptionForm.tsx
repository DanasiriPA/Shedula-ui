"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';
import { Prescription, MedicinePrescription } from '@/types';

interface PrescriptionFormProps {
  initialData?: Prescription;
  appointmentId?: string;
  patientId?: string;
  patientName?: string;
  doctorId: string;
  doctorName: string;
  onSubmit: (prescription: Omit<Prescription, 'id'>) => Promise<void>;
}

export const PrescriptionForm = ({
  initialData,
  appointmentId,
  patientId,
  patientName,
  doctorId,
  doctorName,
  onSubmit
}: PrescriptionFormProps) => {
  const router = useRouter();
  const [medicines, setMedicines] = useState<MedicinePrescription[]>(
    initialData?.medicines || []
  );
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newMedicine, setNewMedicine] = useState<MedicinePrescription>({
    name: '',
    dosage: '',
    duration: '',
    instructions: ''
  });

  const handleAddMedicine = () => {
    if (newMedicine.name && newMedicine.dosage && newMedicine.duration) {
      setMedicines([...medicines, newMedicine]);
      setNewMedicine({
        name: '',
        dosage: '',
        duration: '',
        instructions: ''
      });
    }
  };

  const handleRemoveMedicine = (index: number) => {
    const updatedMedicines = [...medicines];
    updatedMedicines.splice(index, 1);
    setMedicines(updatedMedicines);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const prescriptionData: Omit<Prescription, 'id'> = {
        appointmentId: appointmentId || initialData?.appointmentId || '',
        patientId: patientId || initialData?.patientId || '',
        patientName: patientName || initialData?.patientName || '',
        doctorId,
        doctorName,
        date: new Date().toISOString().split('T')[0],
        medicines,
        notes,
        status: 'active',
        createdAt: Timestamp.now()
      };

      await onSubmit(prescriptionData);
      router.push('/doctor/prescriptions');
    } catch (error) {
      console.error('Error submitting prescription:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Medicines</h3>
        {medicines.map((medicine, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{medicine.name}</p>
                <p>Dosage: {medicine.dosage}</p>
                <p>Duration: {medicine.duration}</p>
                {medicine.instructions && <p>Instructions: {medicine.instructions}</p>}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveMedicine(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <div className="space-y-4 p-4 border rounded-lg">
          <h4 className="font-medium">Add New Medicine</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                value={newMedicine.name}
                onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Dosage</label>
              <input
                type="text"
                value={newMedicine.dosage}
                onChange={(e) => setNewMedicine({...newMedicine, dosage: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Duration</label>
              <input
                type="text"
                value={newMedicine.duration}
                onChange={(e) => setNewMedicine({...newMedicine, duration: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Instructions</label>
              <input
                type="text"
                value={newMedicine.instructions}
                onChange={(e) => setNewMedicine({...newMedicine, instructions: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddMedicine}
            className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Add Medicine
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.push('/doctor/prescriptions')}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || medicines.length === 0}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Prescription'}
        </button>
      </div>
    </form>
  );
};