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
  const [patientName, setPatientName] = useState<string>('');
  const [patientAge, setPatientAge] = useState<string>('');
  const [consultationType, setConsultationType] = useState<'online' | 'clinic' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online' | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<{
    doctorName: string;
    date: string;
    time: string;
    type: string;
    token: string;
  } | null>(null);
  const [bookingError, setBookingError] = useState<string>('');
  const [isBooking, setIsBooking] = useState(false);
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    <div className="min-h-screen bg-gray-200 text-gray-900 font-inter p-8">
      <h1 className="text-3xl font-bold mb-4">{doctor.name}</h1>
      <p className="mb-2">{doctor.specialization}</p>

      <div className="bg-white p-6 rounded-xl shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4">Book an Appointment</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Your Name"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="p-3 border rounded-lg"
          />
          <input
            type="number"
            placeholder="Your Age"
            value={patientAge}
            onChange={(e) => setPatientAge(e.target.value)}
            className="p-3 border rounded-lg"
          />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-3 border rounded-lg"
          />
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="p-3 border rounded-lg"
          />
          <select
            value={consultationType || ''}
            onChange={(e) => setConsultationType(e.target.value as 'online' | 'clinic')}
            className="p-3 border rounded-lg"
          >
            <option value="">Select Consultation Type</option>
            <option value="online">Online</option>
            <option value="clinic">Clinic</option>
          </select>
          <select
            value={paymentMethod || ''}
            onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'online')}
            className="p-3 border rounded-lg"
          >
            <option value="">Select Payment Method</option>
            <option value="cash">Cash</option>
            <option value="online">Online</option>
          </select>
        </div>

        {bookingError && (
          <p className="text-red-600 mt-4">{bookingError}</p>
        )}

        <motion.button
          onClick={handleBooking}
          disabled={isBooking}
          className="mt-6 px-6 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isBooking ? 'Booking...' : 'Book Appointment'}
        </motion.button>
      </div>

      {showBookingModal && bookingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-xl font-bold mb-2">Appointment Confirmed!</h3>
            <p className="mb-1">Doctor: {bookingDetails.doctorName}</p>
            <p className="mb-1">Date: {bookingDetails.date}</p>
            <p className="mb-1">Time: {bookingDetails.time}</p>
            <p className="mb-1">Type: {bookingDetails.type}</p>
            <p className="mb-1 font-semibold">Token: {bookingDetails.token}</p>
            <button
              onClick={() => setShowBookingModal(false)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}