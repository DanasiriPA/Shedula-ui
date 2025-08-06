// src/app/doctor/prescriptions/components/SearchPrescriptions.tsx
"use client";

import { useState, useEffect } from 'react';
import { Prescription } from '@/types';

interface SearchPrescriptionsProps {
  prescriptions: Prescription[];
  onSearch: (filtered: Prescription[]) => void;
}

export const SearchPrescriptions = ({ prescriptions, onSearch }: SearchPrescriptionsProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const filtered = prescriptions.filter(prescription => {
      const matchesSearch = 
        prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.appointmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.medicines.some(med => 
          med.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesStatus = 
        filterStatus === 'all' || 
        prescription.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
    
    onSearch(filtered);
  }, [searchTerm, filterStatus, prescriptions, onSearch]);

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Search by patient, appointment ID, or medicine..."
          className="w-full px-4 py-2 border rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div>
        <select
          className="px-4 py-2 border rounded-md"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>
  );
};