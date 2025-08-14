"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  FaStethoscope,
  FaMapMarkerAlt,
  FaBriefcaseMedical,
  FaCalendarAlt,
  FaUserCircle,
  FaUserInjured,
  FaSignOutAlt,
  FaFilePrescription,
  FaStar,
  FaSearch
} from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TooltipProps } from 'recharts';

interface Review {
  id: number;
  patientId: number;
  patientName: string;
  patientPhoto: string;
  appointmentId: number;
  appointmentDate: string;
  rating: number;
  reviewText: string;
  reviewDate: string;
  consultationType: string;
}

interface RatingData {
  rating: number;
  count: number;
  percentage: number;
}

const DoctorReviewsPage = () => {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<{rating: number; count: number; percentage: number}[]>([]);

  useEffect(() => {
    const lobsterLink = document.createElement("link");
    lobsterLink.href = "https://fonts.googleapis.com/css2?family=Lobster&display=swap";
    lobsterLink.rel = "stylesheet";
    document.head.appendChild(lobsterLink);

    const interLink = document.createElement("link");
    interLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap";
    interLink.rel = "stylesheet";
    document.head.appendChild(interLink);
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('https://json-server-7wzo.onrender.com/reviews');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setReviews(data);
        calculateStats(data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const calculateStats = (reviewsData: Review[]) => {
    const totalRatings = reviewsData.reduce((sum, review) => sum + review.rating, 0);
    const avg = totalRatings / reviewsData.length;
    setAverageRating(parseFloat(avg.toFixed(1)));

    const ratingCounts = [0, 0, 0, 0, 0];
    reviewsData.forEach(review => {
      ratingCounts[review.rating - 1]++;
    });

    const distribution = ratingCounts.map((count, index) => ({
      rating: index + 1,
      count,
      percentage: parseFloat(((count / reviewsData.length) * 100).toFixed(1))
    }));

    setRatingDistribution(distribution);
  };

  const filteredReviews = reviews.filter(review => {
    if (filter !== 'all' && review.consultationType !== filter) {
      return false;
    }
    
    if (searchTerm && 
        !review.patientName.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !review.reviewText.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const COLORS = ['#FF6384', '#FF9F40', '#FFCD56', '#4BC0C0', '#36A2EB'];

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`${star <= rating ? 'text-yellow-400' : 'text-gray-300'} text-lg`}
          />
        ))}
      </div>
    );
  };

  const CustomTooltip = ({
  active,
  payload,
}: TooltipProps<number, string> & {
  payload?: Array<{ payload: RatingData }>;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 shadow-md rounded-md border border-gray-200">
        <p className="font-semibold">{data.rating} ★</p>
        <p>Count: {data.count}</p>
        <p>{data.percentage}% of total</p>
      </div>
    );
  }
  return null;
};

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-inter relative overflow-x-hidden">
      <style jsx global>{`
        .bg-medical-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2393c5fd' fill-opacity='0.1'%3E%3Cpath d='M20 40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0-20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm40-40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2z'/%3E%3Cpath d='M42 20h-4v-4h-4v4h-4v4h4v4h4v-4h4v-4zm0 40h-4v-4h-4v4h-4v4h4v4h4v-4h4v-4z'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 80px 80px;
        }
      `}</style>
      
      <div className="absolute inset-0 z-0 bg-medical-pattern"></div>

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
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaFilePrescription className="text-blue-600" /> Prescriptions
          </motion.button>
          <motion.button 
            onClick={() => router.push("/doctor/patients")} 
            whileHover={{ y: -3, color: "#4F46E5" }} 
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaUserInjured className="text-blue-600" /> Patients
          </motion.button>
          <motion.button 
            onClick={() => router.push("/doctor/reviews")} 
            whileHover={{ y: -3, color: "#4F46E5" }} 
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 bg-blue-50 text-blue-700"
          >
            <FaStar className="text-blue-600" /> Reviews
          </motion.button>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => router.push("/doctor/profile")}
            className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors shadow-md"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaUserCircle className="text-2xl" />
          </motion.button>
          <motion.button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 py-2 px-4 rounded-full text-red-500 bg-red-100/50 hover:bg-red-100 transition-colors shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content Area with Solid White Background */}
      <div className="relative z-10 pt-32 px-8 pb-12">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="p-8">
            <h2 className="text-center text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 mb-10">Patient Reviews</h2>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Stats and Filters */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  {/* Average Rating Card */}
                  <motion.div
                    className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Average Rating</h3>
                    <div className="flex items-center justify-between">
                      <div className="text-5xl font-bold text-gray-900">{averageRating}/5</div>
                      <div className="flex">
                        {renderStars(Math.round(averageRating))}
                      </div>
                    </div>
                    <p className="text-gray-500 mt-2">Based on {reviews.length} reviews</p>
                  </motion.div>

                  {/* Rating Distribution Card */}
                  <motion.div
                    className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Rating Distribution</h3>
                    <div className="flex flex-col items-center">
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie
                            data={ratingDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="rating"
                            label={({ rating, count }) => `${rating}★ (${count})`}
                          >
                            {ratingDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend 
                            layout="horizontal" 
                            verticalAlign="bottom" 
                            align="center"
                            wrapperStyle={{ paddingTop: '20px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  {/* Filters Card */}
                  <motion.div
                    className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Filters</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Type</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          value={filter}
                          onChange={(e) => setFilter(e.target.value)}
                        >
                          <option value="all">All Consultations</option>
                          <option value="Clinic Visit">Clinic Visits</option>
                          <option value="Online">Online Consultations</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search Reviews</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Search by patient or review..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Reviews List */}
                <motion.div
                  className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FaStar className="text-yellow-400" /> Patient Feedback ({filteredReviews.length})
                  </h3>

                  {filteredReviews.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      No reviews match your current filters.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredReviews.map((review) => (
                        <motion.div
                          key={review.id}
                          className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
                          whileHover={{ scale: 1.01 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <div className="flex items-start gap-4">
                            <Image
                              src={review.patientPhoto}
                              alt={review.patientName}
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-lg">{review.patientName}</h4>
                                  <p className="text-gray-500 text-sm">
                                    {new Date(review.appointmentDate).toLocaleDateString()} • {review.consultationType}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold">{review.rating}.0</span>
                                  <FaStar className="text-yellow-400" />
                                </div>
                              </div>
                              <div className="mt-2">
                                {renderStars(review.rating)}
                              </div>
                              <p className="mt-2 text-gray-700">{review.reviewText}</p>
                              <p className="text-sm text-gray-400 mt-2">
                                Reviewed on {new Date(review.reviewDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gradient-to-br from-blue-900 to-purple-900 text-white py-12 px-8 rounded-t-3xl mt-8">
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
    </div>
  );
};

export default DoctorReviewsPage;