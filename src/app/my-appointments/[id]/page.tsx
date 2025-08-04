"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { auth } from '@/lib/firebase';
import { Doctor } from '@/types';

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [patientName, ] = useState<string>('');
  const [patientAge, ] = useState<string>('');
  const [consultationType, ] = useState<'online' | 'clinic' | null>(null);
  const [paymentMethod, ] = useState<'cash' | 'online' | null>(null);
  const [, setShowBookingModal] = useState(false);
  const [, setBookingDetails] = useState<{ 
    doctorName: string; 
    date: string; 
    time: string; 
    type: string; 
    token: string; 
  } | null>(null);
  const [, setBookingError] = useState<string>('');
  const [, setIsBooking] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await fetch(`/api/doctors/${id}`);
        const data = await response.json();
        setDoctor(data);
      } catch (error) {
        console.error("Error fetching doctor:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDoctor();
    }
  }, [id]);

  useEffect(() => {
    setSelectedDate('');
    setSelectedTime('');
  }, [id, consultationType]);

  const generateToken = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleBooking = async () => {
    setBookingError('');
    setIsBooking(true);

    if (!selectedDate || !selectedTime || !patientName || !patientAge || !consultationType || !paymentMethod) {
      setBookingError("Please fill all booking details and select a payment method.");
      setIsBooking(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      const token = generateToken();

      // Save to Firebase - this will generate the ID
      
      // Create the complete appointment object with the generated ID

      setBookingDetails({
        doctorName: doctor?.name || '',
        date: selectedDate,
        time: selectedTime,
        type: consultationType === 'online' ? 'Online Consultation' : 'Clinic Visit',
        token: token
      });

      setShowBookingModal(true);
    } catch (error) {
      console.error("Error creating appointment:", error);
      setBookingError("Failed to create appointment. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading doctor information...</div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
        <p className="text-xl text-gray-700">Doctor not found.</p>
        <motion.button
          onClick={() => router.push('/dashboard')}
          className="mt-4 px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Go to Dashboard
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 text-gray-900 font-inter relative overflow-x-hidden">
      {/* Your existing JSX remains unchanged */}
    </div>
  );
}