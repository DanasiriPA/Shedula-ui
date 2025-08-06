// src/app/doctor/prescriptions/components/PrescriptionCard.tsx
"use client";

import Link from 'next/link';
import { Prescription } from '@/types';
import { formatDate } from '@/lib/utils';

interface PrescriptionCardProps {
  prescription: Prescription;
}

export const PrescriptionCard = ({ prescription }: PrescriptionCardProps) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg">
              {prescription.patientName}
            </h3>
            <p className="text-sm text-gray-500">
              {formatDate(prescription.date)}
            </p>
            <p className="text-sm mt-1">
              Appointment ID: {prescription.appointmentId}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full ${
            prescription.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : prescription.status === 'completed' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800'
          }`}>
            {prescription.status}
          </span>
        </div>

        <div className="mt-3">
          <h4 className="text-sm font-medium">Medicines:</h4>
          <ul className="mt-1 space-y-1">
            {prescription.medicines.map((medicine, index) => (
              <li key={index} className="text-sm">
                {medicine.name} - {medicine.dosage} ({medicine.duration})
              </li>
            ))}
          </ul>
        </div>

        {prescription.notes && (
          <div className="mt-3">
            <h4 className="text-sm font-medium">Notes:</h4>
            <p className="text-sm mt-1">{prescription.notes}</p>
          </div>
        )}

        <div className="mt-4 flex space-x-2">
          <Link
            href={`/doctor/prescriptions/${prescription.id}`}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            View/Edit
          </Link>
        </div>
      </div>
    </div>
  );
};