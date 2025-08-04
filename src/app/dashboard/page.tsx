"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaStar,
  FaStethoscope,
  FaCalendarAlt,
  FaCapsules,
  FaNotesMedical,
  FaBriefcaseMedical,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaTimes,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";

// --- START: FIREBASE AND TYPE IMPORTS ---
// Import Firestore services from your local firebase.ts file
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

// Define the Doctor interface since we're no longer importing from a mock file
export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  education: string;
  rating: number;
  reviews: number;
  experience: number;
  location: string;
  onlinePrice: number;
  clinicPrice: number;
  available: boolean;
  avatar: string;
  description: string;
}
// --- END: FIREBASE AND TYPE IMPORTS ---

// Animation variants for Framer Motion
const dropdownVariants = {
  open: { opacity: 1, y: 0, scale: 1 },
  closed: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const defaultButtonGradient = "bg-gradient-to-br from-green-50 to-blue-100 text-gray-700 hover:from-green-100 hover:to-blue-200";
const activeButtonGradient = "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg";

// Mock data for patient reviews (this can remain as a static list)
const patientReviews = [
    { name: "Ananya Sharma", location: "Mumbai", title: "Online Consult", review: "The virtual consultation was seamless and the doctor was very attentive. Got my prescription within minutes!", date: "2 days ago" },
    { name: "Rahul Verma", location: "Delhi", title: "Clinic Visit", review: "I had a great experience with my doctor. The clinic was clean and the staff was very friendly. Highly recommended!", date: "1 week ago" },
    { name: "Priya Singh", location: "Bengaluru", title: "Follow-up", review: "Booking a follow-up was easy. The doctor remembered my case and provided excellent advice. Really appreciate the service.", date: "3 weeks ago" },
    { name: "Ajay Kumar", location: "Chennai", title: "Online Consult", review: "Quick and efficient. The doctor was knowledgeable and answered all my questions patiently. Will definitely use Shedula again.", date: "1 month ago" },
    { name: "Sneha Gupta", location: "Kolkata", title: "Clinic Visit", review: "Excellent doctor and facility. The wait time was minimal and the care was top-notch. Very satisfied with the service.", date: "1 month ago" },
];

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [consultationFilter, setConsultationFilter] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // --- START: NEW STATE FOR LOADING & ERROR ---
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // --- END: NEW STATE FOR LOADING & ERROR ---

  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const reviewsRef = useRef<HTMLDivElement>(null);
  const reviewsCarouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // --- START: FETCH DOCTORS FROM FIREBASE ---
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsCollectionRef = collection(db, "doctors");
        const querySnapshot = await getDocs(doctorsCollectionRef);
        const fetchedDoctors: Doctor[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Doctor));
        setDoctors(fetchedDoctors);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
        setError("Failed to load doctors. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
    
    // Add dynamic font loading as before
    const lobsterLink = document.createElement("link");
    lobsterLink.href = "https://fonts.googleapis.com/css2?family=Lobster&display=swap";
    lobsterLink.rel = "stylesheet";
    document.head.appendChild(lobsterLink);

    const interLink = document.createElement("link");
    interLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap";
    interLink.rel = "stylesheet";
    document.head.appendChild(interLink);

  }, []);
  // --- END: FETCH DOCTORS FROM FIREBASE ---

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleViewProfileClick = (id: string, isAvailable: boolean) => {
    if (isAvailable) {
      setLoadingId(id);
      setTimeout(() => {
        router.push(`/doctors/${id}`);
      }, 1000);
    }
  };

  const handleDropdownToggle = (dropdownName: string) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const handleFilterSelection = (filterType: string, value: string) => {
    switch (filterType) {
      case "specialization":
        setSpecializationFilter(value);
        break;
      case "city":
        setCityFilter(value);
        break;
      case "availability":
        setAvailabilityFilter(value);
        break;
      case "consultation":
        setConsultationFilter(value);
        break;
      default:
        break;
    }
    setOpenDropdown(null);
  };

  const scrollReviews = (direction: "left" | "right") => {
    if (reviewsCarouselRef.current) {
      const { current } = reviewsCarouselRef;
      const scrollAmount = 300;
      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(search.toLowerCase())
  ).filter(
    (doc) =>
      (!specializationFilter || doc.specialization === specializationFilter) &&
      (!cityFilter || doc.location === cityFilter) &&
      (!availabilityFilter ||
        (availabilityFilter === "available" && doc.available) ||
        (availabilityFilter === "unavailable" && !doc.available)) &&
      (!consultationFilter ||
        (consultationFilter === "online" && doc.onlinePrice) ||
        (consultationFilter === "clinic" && doc.clinicPrice))
  );

  return (
    <div className="min-h-screen bg-gray-200 text-gray-900 font-inter relative overflow-x-hidden">
      <style jsx global>{`
        .bg-medical-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2393c5fd' fill-opacity='0.6'%3E%3Cpath d='M20 40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0-20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm40-40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2z'/%3E%3Cpath d='M42 20h-4v-4h-4v4h-4v4h4v4h4v-4h4v-4zm0 40h-4v-4h-4v4h-4v4h4v4h4v-4h4v-4z'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 80px 80px;
          opacity: 0.5;
        }
      `}</style>
      
      <div className="absolute inset-0 z-0 bg-white bg-medical-pattern"></div>

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
          <motion.button
            onClick={scrollToReviews}
            whileHover={{ y: -3, color: "#4F46E5" }}
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaStar className="text-blue-600" /> Reviews
          </motion.button>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => router.push("/profile")}
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

      {/* Page Content */}
      <div className="pt-32 px-8">
        {/* Heading */}
        <h2 className="text-center text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 mb-10">Find your doctor</h2>

        {/* Search Bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="🔍 Search doctors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-5 py-3 rounded-full border border-gray-300 shadow-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative" ref={(el) => { dropdownRefs.current["availability"] = el; }}>
            <motion.button
              onClick={() => handleDropdownToggle("availability")}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all flex items-center gap-2 border ${
                availabilityFilter ? activeButtonGradient : defaultButtonGradient
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {availabilityFilter === "available"
                ? "🟢 Available"
                : availabilityFilter === "unavailable"
                ? "🔴 Unavailable"
                : "Availability"}{" "}
              <FaChevronDown className={`ml-2 transform transition-transform duration-200 ${openDropdown === "availability" ? "rotate-180" : "rotate-0"}`} />
            </motion.button>
            <AnimatePresence>
              {openDropdown === "availability" && (
                <motion.div
                  className="absolute z-30 top-full mt-2 w-64 bg-white rounded-lg shadow-xl py-2 border border-gray-200"
                  variants={dropdownVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                >
                  {["", "available", "unavailable"].map((type) => (
                    <motion.button
                      key={type}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                      onClick={() => handleFilterSelection("availability", type)}
                    >
                      {type === "available"
                        ? "🟢 Available"
                        : type === "unavailable"
                        ? "🔴 Unavailable"
                        : "All"}
                      {availabilityFilter === type && <FaTimes className="text-red-500" />}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative" ref={(el) => { dropdownRefs.current["consultation"] = el; }}>
            <motion.button
              onClick={() => handleDropdownToggle("consultation")}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all flex items-center gap-2 border ${
                consultationFilter ? activeButtonGradient : defaultButtonGradient
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {consultationFilter === "clinic"
                ? "Clinic Visit"
                : consultationFilter === "online"
                ? "Online"
                : "Consultation"}{" "}
              <FaChevronDown className={`ml-2 transform transition-transform duration-200 ${openDropdown === "consultation" ? "rotate-180" : "rotate-0"}`} />
            </motion.button>
            <AnimatePresence>
              {openDropdown === "consultation" && (
                <motion.div
                  className="absolute z-30 top-full mt-2 w-64 bg-white rounded-lg shadow-xl py-2 border border-gray-200"
                  variants={dropdownVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                >
                  {["", "clinic", "online"].map((type) => (
                    <motion.button
                      key={type}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                      onClick={() => handleFilterSelection("consultation", type)}
                    >
                      {type === "clinic"
                        ? "Clinic Visit"
                        : type === "online"
                        ? "Online"
                        : "All"}
                      {consultationFilter === type && <FaTimes className="text-red-500" />}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative" ref={(el) => { dropdownRefs.current["specialization"] = el; }}>
            <motion.button
              onClick={() => handleDropdownToggle("specialization")}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all flex items-center gap-2 border ${
                specializationFilter ? activeButtonGradient : defaultButtonGradient
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {specializationFilter || "Specialization"}{" "}
              <FaChevronDown className={`ml-2 transform transition-transform duration-200 ${openDropdown === "specialization" ? "rotate-180" : "rotate-0"}`} />
            </motion.button>
            <AnimatePresence>
              {openDropdown === "specialization" && (
                <motion.div
                  className="absolute z-30 top-full mt-2 w-64 bg-white rounded-lg shadow-xl py-2 border border-gray-200"
                  variants={dropdownVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                >
                  <motion.button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                    onClick={() => handleFilterSelection("specialization", "")}
                  >
                    All
                    {specializationFilter === "" && <FaTimes className="text-red-500" />}
                  </motion.button>
                  {Array.from(new Set(doctors.map((doc) => doc.specialization))).map((spec) => (
                    <motion.button
                      key={spec}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => handleFilterSelection("specialization", spec)}
                    >
                      {spec}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative" ref={(el) => { dropdownRefs.current["city"] = el; }}>
            <motion.button
              onClick={() => handleDropdownToggle("city")}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all flex items-center gap-2 border ${
                cityFilter ? activeButtonGradient : defaultButtonGradient
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {cityFilter || "City"}{" "}
              <FaChevronDown className={`ml-2 transform transition-transform duration-200 ${openDropdown === "city" ? "rotate-180" : "rotate-0"}`} />
            </motion.button>
            <AnimatePresence>
              {openDropdown === "city" && (
                <motion.div
                  className="absolute z-30 top-full mt-2 w-64 bg-white rounded-lg shadow-xl py-2 border border-gray-200"
                  variants={dropdownVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                >
                  <motion.button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                    onClick={() => handleFilterSelection("city", "")}
                  >
                    All
                    {cityFilter === "" && <FaTimes className="text-red-500" />}
                  </motion.button>
                  {Array.from(new Set(doctors.map((doc) => doc.location))).map((city) => (
                    <motion.button
                      key={city}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => handleFilterSelection("city", city)}
                    >
                      {city}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* --- START: CONDITIONAL RENDERING FOR LOADING AND ERROR STATES --- */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-red-600 text-xl font-semibold">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && (
        // --- END: CONDITIONAL RENDERING ---
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.08, duration: 0.6 },
              },
            }}
            initial="hidden"
            animate="visible"
          >
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doc) => (
                <motion.div
                  key={`${doc.id}-${doc.name}-${doc.specialization}-${doc.location}`}
                  className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 relative overflow-hidden group cursor-pointer"
                  variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                  whileHover={{
                    y: -10,
                    scale: 1.03,
                    boxShadow: "0px 20px 30px rgba(99, 102, 241, 0.4)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {loadingId === doc.id && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-3xl">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
                    </div>
                  )}

                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={doc.avatar}
                        alt={doc.name}
                        width={80}
                        height={80}
                        className="rounded-full object-cover border-2 border-blue-200 shadow-md"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-2xl font-bold text-gray-900">{doc.name}</h3>
                      <p className="text-md text-blue-600 font-medium">{doc.specialization}</p>
                      <p className="text-sm text-gray-500">{doc.education}</p>
                      <div className="flex items-center mt-1 text-gray-500 text-sm">
                        <FaStar className="text-yellow-400 mr-1" />
                        <span>{doc.rating} ({doc.reviews} reviews)</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        doc.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                      }`}
                    >
                      {doc.available ? "Available" : "Unavailable"}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{doc.description}</p>

                  <div className="flex flex-col gap-2 text-sm text-gray-700 mb-4">
                    <p className="flex items-center gap-2">
                      <FaBriefcaseMedical className="text-blue-600" /> {doc.experience} years experience
                    </p>
                    <p className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-blue-600" /> {doc.location}
                    </p>
                  </div>

                  <div className="flex justify-around items-center bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">Clinic Visit</p>
                      <p className="text-xl font-bold text-gray-900">₹{doc.clinicPrice}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">Online Consulting</p>
                      <p className="text-xl font-bold text-gray-900">₹{doc.onlinePrice}</p>
                    </div>
                  </div>

                  <motion.button
                    className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg text-lg ${
                      doc.available
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={!doc.available}
                    whileHover={doc.available ? { scale: 1.02 } : {}}
                    whileTap={doc.available ? { scale: 0.98 } : {}}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewProfileClick(doc.id, doc.available);
                    }}
                  >
                    {doc.available ? "View Profile" : "Not Available"}
                  </motion.button>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500">
                <p className="text-xl">No doctors found matching your criteria.</p>
              </div>
            )}
          </motion.div>
        )}

        <div ref={reviewsRef} className="bg-gradient-to-br from-blue-50 to-white py-16 px-8 relative overflow-hidden mt-16 rounded-3xl shadow-inner">
          <motion.div
            className="max-w-7xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-blue-800 mb-2">Patient Reviews</h2>
              <p className="text-gray-600">Real experiences from thousands of Indians who trust Shedula for their healthcare journey.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-12">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }}>
                <p className="text-5xl font-bold text-blue-600">50,000+</p>
                <p className="text-gray-500">Happy Patients</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} viewport={{ once: true }}>
                <p className="text-5xl font-bold text-blue-600">1000+</p>
                <p className="text-gray-500">Verified Doctors</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} viewport={{ once: true }}>
                <p className="text-5xl font-bold text-blue-600">24/7</p>
                <p className="text-gray-500">Available Support</p>
              </motion.div>
            </div>

            <div className="relative">
              <motion.div
                ref={reviewsCarouselRef}
                className="flex gap-6 overflow-x-scroll scroll-smooth py-4 no-scrollbar"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
              >
                {patientReviews.map((review) => (
                <motion.div
                  key={`${review.name}-${review.date}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-lg dark:text-white">{review.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{review.date}</div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{review.review}</p>
                </motion.div>
              ))}

              </motion.div>

              <div className="absolute inset-y-0 left-0 flex items-center -translate-x-4">
                <motion.button
                  onClick={() => scrollReviews("left")}
                  className="bg-white/70 p-3 rounded-full shadow-lg text-gray-600 hover:bg-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaChevronLeft />
                </motion.button>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center translate-x-4">
                <motion.button
                  onClick={() => scrollReviews("right")}
                  className="bg-white/70 p-3 rounded-full shadow-lg text-gray-600 hover:bg-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaChevronRight />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

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
    </div>
  );
}
