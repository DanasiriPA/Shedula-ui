// src/app/doctor/prescriptions/components/PrescriptionList.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { PrescriptionCard } from "./PrescriptionCard";
import { Prescription } from '@/types';
import { SearchPrescriptions } from './SearchPrescriptions';

interface PrescriptionListProps {
  prescriptions: Prescription[];
}

export const PrescriptionList = ({ prescriptions: initialPrescriptions }: PrescriptionListProps) => {
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);

  const handleSearch = (filtered: Prescription[]) => {
    setPrescriptions(filtered);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Patient Prescriptions</h2>
        <Link
          href="/doctor/prescriptions/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create New
        </Link>
      </div>

      <SearchPrescriptions 
        prescriptions={initialPrescriptions} 
        onSearch={handleSearch} 
      />

      {prescriptions.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No prescriptions found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prescriptions.map((prescription) => (
            <PrescriptionCard 
              key={prescription.id} 
              prescription={prescription} 
            />
          ))}
        </div>
      )}
    </div>
  );
};