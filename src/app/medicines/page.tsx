// app/medicines/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStethoscope, FaCalendarAlt, FaCapsules, FaNotesMedical, FaUserCircle, FaSearch, FaChevronLeft, FaRupeeSign, FaBoxOpen, FaClipboardList, FaTimesCircle, FaMapMarkerAlt, FaBriefcaseMedical } from 'react-icons/fa'; // Added FaMapMarkerAlt, FaBriefcaseMedical for footer
import mockMedicines, { medicineCategories } from '@/lib/medicineData';
import { getMedicineOrders, saveMedicineOrder, cancelMedicineOrder } from '@/lib/medicineStorage';
import { Medicine, MedicineOrder } from '@/types';

export default function MedicinesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'myOrders'>('available'); // For toggle

  // Modals and their states
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [buyQuantity, setBuyQuantity] = useState<number>(1);
  const [totalBuyPrice, setTotalBuyPrice] = useState(0);

  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderFormError, setOrderFormError] = useState('');

  const [myOrders, setMyOrders] = useState<MedicineOrder[]>([]);

  // Function to load and filter medicines
  const filterAndLoadMedicines = useCallback(() => {
    let tempMedicines = mockMedicines;

    if (selectedCategory) {
      tempMedicines = tempMedicines.filter(med => med.category === selectedCategory);
    }

    if (searchTerm) {
      tempMedicines = tempMedicines.filter(med =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredMedicines(tempMedicines);
  }, [searchTerm, selectedCategory]);

  // Function to load orders
  const loadMyOrders = useCallback(() => {
    setMyOrders(getMedicineOrders());
  }, []);

  useEffect(() => {
    filterAndLoadMedicines();
    loadMyOrders(); // Load orders on initial mount
  }, [filterAndLoadMedicines, loadMyOrders]);

  useEffect(() => {
    if (selectedMedicine) {
      setTotalBuyPrice(selectedMedicine.pricePerUnit * buyQuantity);
    }
  }, [buyQuantity, selectedMedicine]);

  const handleMedicineClick = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setBuyQuantity(1); // Reset quantity
    setTotalBuyPrice(medicine.pricePerUnit * 1); // Calculate initial price
    setShowBuyModal(true);
  };

  const handleBuyNow = () => {
    if (buyQuantity <= 0) {
      alert("Quantity must be greater than 0.");
      return;
    }
    setShowBuyModal(false);
    setShowOrderDetailsModal(true);
    setOrderFormError(''); // Clear previous errors
  };

  const generateOrderId = () => {
    return `ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  };

  const handlePlaceOrder = () => {
    if (!selectedMedicine || !customerName || !customerCity || !customerAddress || !customerPhone) {
      setOrderFormError("Please fill in all customer details.");
      return;
    }

    const newOrder: MedicineOrder = {
      orderId: generateOrderId(),
      medicine: selectedMedicine,
      quantity: buyQuantity,
      totalPrice: totalBuyPrice,
      customerName,
      city: customerCity,
      address: customerAddress,
      phoneNumber: customerPhone,
      orderDate: new Date().toISOString().split('T')[0],
      deliveryStatus: 'pending',
      deliveryNote: 'Expected delivery in 2 days.', // As requested
    };

    saveMedicineOrder(newOrder);
    loadMyOrders(); // Refresh orders list
    setShowOrderDetailsModal(false);
    // Optionally show a confirmation message
    alert(`Order for ${selectedMedicine.name} placed successfully! Order ID: ${newOrder.orderId}`);
    
    // Clear form fields
    setCustomerName('');
    setCustomerCity('');
    setCustomerAddress('');
    setCustomerPhone('');
    setSelectedMedicine(null);
    setBuyQuantity(1);
    setTotalBuyPrice(0);
  };

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      cancelMedicineOrder(orderId);
      loadMyOrders(); // Refresh orders list
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 text-gray-900 font-inter relative overflow-x-hidden">
      <style jsx global>{`
        .bg-medical-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2393c5fd' fill-opacity='0.6'%3E%3Cpath d='M20 40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0-20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm40-40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2z'/%3E%3Cpath d='M42 20h-4v-4h-4v4h-4v4h4v4h4v-4h4v-4zm0 40h-4v-4h-4v4h-4v4h4v4h4v-4h4v-4z'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 80px 80px;
          opacity: 0.5;
        }
      `}</style>

      {/* Background with Medical Pattern */}
      <div className="absolute inset-0 z-0 bg-white bg-medical-pattern"></div>
      
      {/* --- Header (Top Nav) --- */}
      <motion.div
        className={`fixed top-0 left-0 right-0 z-50 py-5 px-8 flex justify-between items-center transition-all duration-300 rounded-b-3xl shadow-xl bg-white/90 backdrop-blur-md border-b-2 border-transparent bg-origin-border bg-clip-border bg-gradient-to-br from-blue-200 via-white to-purple-200`}
      >
        <div className="flex items-center gap-4">
          <Image src="https://i.postimg.cc/SKnMMNcw/360-F-863843181-63-Nv8tgy-BU8-X26-B1-Lq-Qvfi0tn95aj-Sg-X.jpg" alt="Shedula Logo" width={45} height={45} className="rounded-full shadow-md" />
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
            onClick={() => router.push("/dashboard")}
            whileHover={{ y: -3, color: "#4F46E5" }} 
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaStethoscope className="text-blue-600" /> Doctors
          </motion.button>
          <motion.button onClick={() => router.push("/my-appointments")} whileHover={{ y: -3, color: "#4F46E5" }} className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
            <FaCalendarAlt className="text-blue-600" /> Appointments
          </motion.button>
          <motion.button onClick={() => router.push("/medicines")} whileHover={{ y: -3, color: "#4F46E5" }} className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
            <FaCapsules className="text-blue-600" /> Medicines
          </motion.button>
          <motion.button onClick={() => router.push("/records")} whileHover={{ y: -3, color: "#4F46E5" }} className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
            <FaNotesMedical className="text-blue-600" /> Records
          </motion.button>
        </div>
        <motion.button
          onClick={() => router.push("/profile")}
          className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors shadow-md"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaUserCircle className="text-2xl" />
        </motion.button>
      </motion.div>

      <div className="relative z-10 pt-28 px-8 pb-16 w-full min-h-screen flex flex-col items-center">
        <motion.button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6 text-lg font-medium self-start ml-4 md:ml-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <FaChevronLeft /> Back to Dashboard
        </motion.button>

        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 mb-10 mt-4">Medicine Store</h1>

        {/* Toggle between Available Medicines and My Orders */}
        <div className="flex gap-4 mb-8 p-1 bg-white rounded-xl shadow-md border border-gray-200">
          <motion.button
            onClick={() => setActiveTab('available')}
            className={`py-2 px-6 rounded-lg font-semibold text-lg transition-colors ${
              activeTab === 'available' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaCapsules className="inline mr-2" /> Available Medicines
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('myOrders')}
            className={`py-2 px-6 rounded-lg font-semibold text-lg transition-colors ${
              activeTab === 'myOrders' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaClipboardList className="inline mr-2" /> My Orders ({myOrders.length})
          </motion.button>
        </div>

        {activeTab === 'available' && (
          <div className="w-full max-w-7xl">
            {/* Search Bar */}
            <div className="mb-8 p-4 bg-white rounded-xl shadow-md flex items-center border border-gray-200">
              <FaSearch className="text-gray-400 text-2xl mr-3" />
              <input
                type="text"
                placeholder="Search medicines by name..."
                className="flex-grow p-2 text-lg rounded-lg border-0 focus:ring-0 focus:outline-none text-gray-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Categories/Filters */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Categories</h2>
              <div className="flex flex-wrap gap-3">
                <motion.button
                  onClick={() => setSelectedCategory(null)}
                  className={`py-2 px-5 rounded-full font-semibold transition-colors border-2 ${
                    selectedCategory === null
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  All
                </motion.button>
                {medicineCategories.map(category => (
                  <motion.button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`py-2 px-5 rounded-full font-semibold transition-colors border-2 ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Medicine Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMedicines.length > 0 ? (
                filteredMedicines.map(medicine => (
                  <motion.div
                    key={medicine.id}
                    className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-gray-200 cursor-pointer hover:shadow-xl transition-shadow duration-300"
                    onClick={() => handleMedicineClick(medicine)}
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600 text-5xl font-bold shadow-inner">
                      {medicine.firstLetterId}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{medicine.name}</h3>
                    <p className="text-gray-600 text-sm mb-1">Category: {medicine.category}</p>
                    <p className="text-gray-700 text-md font-semibold mb-3">Qty: {medicine.initialQuantity}</p>
                    <p className="text-green-600 text-2xl font-bold flex items-center">
                      <FaRupeeSign className="text-xl mr-1" />{medicine.pricePerUnit.toFixed(2)} / unit
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full bg-white p-6 rounded-2xl shadow-lg text-center text-gray-600 border border-gray-300">
                  <p className="text-lg font-medium">No medicines found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'myOrders' && (
          <div className="w-full max-w-7xl">
            <h2 className="sr-only">My Orders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myOrders.length > 0 ? (
                myOrders.map(order => (
                  <motion.div
                    key={order.orderId}
                    className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-purple-500 flex flex-col"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold shadow-inner border-2 border-blue-300">
                        {order.medicine.firstLetterId}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{order.medicine.name}</h3>
                        <p className="text-purple-600 text-sm font-semibold">Order ID: {order.orderId}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-gray-700 text-sm flex-grow">
                      <p className="flex items-center gap-2"><FaBoxOpen className="text-purple-500" /> Quantity: <span className="font-semibold">{order.quantity}</span></p>
                      <p className="flex items-center gap-2"><FaRupeeSign className="text-purple-500" /> Total Price: <span className="font-bold text-lg">{order.totalPrice.toFixed(2)}</span></p>
                      <p className="flex items-center gap-2"><FaCalendarAlt className="text-purple-500" /> Order Date: <span className="font-semibold">{new Date(order.orderDate).toLocaleDateString()}</span></p>
                      <p className="flex items-center gap-2"><FaUserCircle className="text-purple-500" /> Customer: <span className="font-semibold">{order.customerName}</span></p>
                      <p className="flex items-center gap-2"><FaNotesMedical className="text-purple-500" /> Delivery: <span className="font-bold text-green-700">{order.deliveryNote}</span></p>
                      <p className={`font-bold text-sm px-2 py-1 rounded-full w-fit ${
                        order.deliveryStatus === 'pending' ? 'bg-orange-100 text-orange-600' :
                        order.deliveryStatus === 'cancelled' ? 'bg-red-100 text-red-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {order.deliveryStatus.charAt(0).toUpperCase() + order.deliveryStatus.slice(1)}
                      </p>
                    </div>
                    {order.deliveryStatus === 'pending' && (
                      <div className="mt-4">
                        <motion.button
                          onClick={() => handleCancelOrder(order.orderId)}
                          className="w-full py-2 px-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors shadow-md flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaTimesCircle /> Cancel Order
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full bg-white p-6 rounded-2xl shadow-lg text-center text-gray-600 border border-gray-300">
                  <p className="text-lg font-medium">You have no pending or past medicine orders.</p>
                  <motion.button
                    onClick={() => setActiveTab('available')}
                    className="mt-4 py-2 px-5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Browse Medicines
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Buy Medicine Modal */}
      <AnimatePresence>
        {showBuyModal && selectedMedicine && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center relative"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <button
                onClick={() => setShowBuyModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
              <h3 className="text-3xl font-bold text-blue-600 mb-4">{selectedMedicine.name}</h3>
              <p className="text-gray-700 text-lg mb-2">{selectedMedicine.description}</p>
              <p className="text-gray-700 text-lg mb-4 font-semibold">Price per unit: <FaRupeeSign className="inline" />{selectedMedicine.pricePerUnit.toFixed(2)}</p>

              <div className="mb-6 flex items-center justify-center gap-4">
                <label htmlFor="quantity" className="text-xl font-semibold text-gray-800">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max={selectedMedicine.initialQuantity}
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(parseInt(e.target.value) || 1)}
                  className="w-24 p-2 text-center border-2 border-gray-300 rounded-lg text-xl font-bold text-blue-800"
                />
              </div>

              <p className="text-green-600 text-3xl font-bold mb-6 flex items-center justify-center">
                Total: <FaRupeeSign className="text-2xl mr-1" />{totalBuyPrice.toFixed(2)}
              </p>

              <motion.button
                onClick={handleBuyNow}
                className="w-full py-4 rounded-xl font-bold text-xl transition-all shadow-lg bg-green-500 text-white hover:bg-green-600"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Buy Now
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Details Modal */}
      <AnimatePresence>
        {showOrderDetailsModal && selectedMedicine && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center relative"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <button
                onClick={() => setShowOrderDetailsModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
              <h3 className="text-3xl font-bold text-purple-600 mb-4">Confirm Order Details</h3>
              <p className="text-gray-700 text-lg mb-2">You are buying <strong>{buyQuantity}</strong> unit(s) of <strong>{selectedMedicine.name}</strong> for a total of <FaRupeeSign className="inline" />{totalBuyPrice.toFixed(2)}.</p>

              <div className="space-y-4 my-6 text-left">
                <div>
                  <label htmlFor="customerName" className="block text-gray-800 font-semibold mb-1">Your Full Name</label>
                  <input
                    type="text"
                    id="customerName"
                    className="w-full p-3 rounded-lg border-2 border-gray-300 focus:ring-purple-500 focus:border-purple-500 text-black"
                    placeholder="E.g., John Doe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="customerCity" className="block text-gray-800 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    id="customerCity"
                    className="w-full p-3 rounded-lg border-2 border-gray-300 focus:ring-purple-500 focus:border-purple-500 text-black"
                    placeholder="E.g., Mumbai"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="customerAddress" className="block text-gray-800 font-semibold mb-1">Delivery Address</label>
                  <textarea
                    id="customerAddress"
                    rows={3}
                    className="w-full p-3 rounded-lg border-2 border-gray-300 focus:ring-purple-500 focus:border-purple-500 text-black"
                    placeholder="Full address with pincode"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="customerPhone" className="block text-gray-800 font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    id="customerPhone"
                    className="w-full p-3 rounded-lg border-2 border-gray-300 focus:ring-purple-500 focus:border-purple-500 text-black"
                    placeholder="E.g., 9876543210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
              </div>

              {orderFormError && (
                <motion.p
                  className="text-center text-md mt-4 font-medium text-red-600"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {orderFormError}
                </motion.p>
              )}

              <motion.button
                onClick={handlePlaceOrder}
                className="w-full py-4 rounded-xl font-bold text-xl transition-all shadow-lg bg-purple-600 text-white hover:bg-purple-700"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Place Order
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* --- Footer --- */}
      <footer className="bg-gradient-to-br from-blue-900 to-purple-900 text-white py-12 px-8 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold font-lobster mb-4" style={{ fontFamily: "'Lobster', cursive" }}>Shedula</h3>
            <p className="text-gray-300 text-sm">Your all-in-one healthcare platform for booking appointments, consulting online, and managing health records.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Find a Doctor</a></li>
              <li><a href="#" className="hover:text-white transition-colors">My Appointments</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Health Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
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