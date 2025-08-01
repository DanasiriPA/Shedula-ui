// app/signup/page.tsx
"use client";

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserPlus,
  FaChevronLeft,
  FaStethoscope,
  FaCalendarAlt,
  FaCapsules,
  FaNotesMedical,
  FaUserCircle
} from "react-icons/fa";

// ✅ Type Definitions
const schema = yup.object().shape({
  email: yup.string().email("Must be a valid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

type FormData = {
  email: string;
  password: string;
};

interface User {
  patientemail: string;
  patientpassword: string;
  [key: string]: unknown;
}

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    setValue, // Keep setValue for the "Continue with Google" button demo
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // This line adds the Google Font for 'Lobster' for consistency
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Lobster&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch(`https://6888ba66adf0e59551bb2689.mockapi.io/v1/patientlogin`);
      if (!res.ok) {
        throw new Error(`Failed to fetch existing users: ${res.status}`);
      }
      const existingUsers: User[] = await res.json();

      const alreadyExists = existingUsers.find(
        (user) => user.patientemail === data.email
      );

      if (alreadyExists) {
        setErrorMessage("Email already registered ❌. Please try logging in.");
        return;
      }

      const postRes = await fetch("https://6888ba66adf0e59551bb2689.mockapi.io/v1/patientlogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Add default fields for a new patient if needed by your MockAPI schema
          patientemail: data.email,
          patientpassword: data.password,
          patientName: "New Patient",
          age: "0",
          gender: "Prefer not to say",
          location: "Unknown",
          phoneNumber: "",
          dateOfBirth: "",
          bloodGroup: "",
          lifestyleChoices: "",
          dietaryPreferences: "",
          wellnessGoals: "",
          insuranceProvider: "",
          policyNumber: "",
          governmentID: "",
          emergencyContactName: "",
          emergencyContactRelation: "",
          emergencyContactPhone: ""
        }),
      });

      if (postRes.ok) {
        setSuccessMessage("Signup successful ✅! Redirecting to login...");
        setTimeout(() => router.push("/"), 2000); // Redirect to / after 2 seconds
      } else {
        setErrorMessage("Signup failed ❌. Please try again.");
      }
    } catch (err: unknown) { // Changed 'any' to 'unknown'
      console.error("Signup error:", err);
      if (err instanceof Error) { // Type guard to safely access error properties
        setErrorMessage(`An error occurred: ${err.message}. Please try again.`);
      } else {
        setErrorMessage("An unknown error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
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
          <Image
            src="https://i.postimg.cc/SKnMMNcw/360-F-863843181-63-Nv8tgy-BU8-X26-B1-Lq-Qvfi0tn95aj-Sg-X.jpg"
            alt="Shedula Logo"
            width={45}
            height={45}
            className="rounded-full shadow-md"
          />
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
          <motion.button
            onClick={() => router.push("/my-appointments")}
            whileHover={{ y: -3, color: "#4F46E5" }}
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaCalendarAlt className="text-blue-600" /> Appointments
          </motion.button>
          <motion.button
            onClick={() => router.push("/medicines")}
            whileHover={{ y: -3, color: "#4F46E5" }}
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaCapsules className="text-blue-600" /> Medicines
          </motion.button>
          <motion.button
            onClick={() => router.push("/records")}
            whileHover={{ y: -3, color: "#4F46E5" }}
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
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

      <div className="relative z-10 pt-28 px-8 pb-16 w-full min-h-screen flex flex-col items-center justify-center">
        <motion.button
          onClick={() => router.push('/')} // Changed to root path
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6 text-lg font-medium self-start ml-4 md:ml-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FaChevronLeft /> Back to Login
        </motion.button>

        <motion.div
          className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md border border-gray-200"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.3 }}
        >
          {/* Logo and Heading */}
          <div className="flex flex-col items-center mb-6">
            <Image
              src="https://i.postimg.cc/SKnMMNcw/360-F-863843181-63-Nv8tgy-BU8-X26-B1-Lq-Qvfi0tn95aj-Sg-X.jpg"
              alt="Shedula Logo"
              width={80}
              height={80}
              className="rounded-full shadow-md"
            />
            <motion.h2
              className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mt-3 font-lobster"
              style={{ fontFamily: "'Lobster', cursive" }}
              whileHover={{ scale: 1.05, textShadow: "0px 0px 8px rgba(0, 0, 0, 0.2)" }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              Shedula
            </motion.h2>
            <p className="text-sm text-gray-600 mt-1 italic text-center">
              Your journey to better health starts here
            </p>
          </div>

          <h1 className="text-2xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-8 flex items-center justify-center gap-3">
            <FaUserPlus className="text-3xl" /> Create Your Account
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaEnvelope className="text-blue-500" /> Email
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full text-gray-800 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors duration-200 bg-gray-50"
                placeholder="your.email@example.com"
              />
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    className="text-red-500 text-sm mt-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaLock className="text-purple-500" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full text-gray-800 border border-gray-300 rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors duration-200 bg-gray-50"
                  placeholder="Minimum 6 characters"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-purple-700 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                </motion.button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    className="text-red-500 text-sm mt-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {errorMessage && (
                <motion.p
                  className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-lg flex items-center gap-2"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {errorMessage}
                </motion.p>
              )}
              {successMessage && (
                <motion.p
                  className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded-lg flex items-center gap-2"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {successMessage}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02, boxShadow: "0 8px 15px rgba(128, 0, 128, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                  Signing Up...
                </div>
              ) : (
                <><FaUserPlus /> Sign Up</>
              )}
            </motion.button>

            {/* Continue with Google */}
            <div className="flex items-center my-6">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-4 text-gray-600 font-medium">OR</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            <motion.button
              type="button"
              onClick={() => {
                setValue("email", "googleuser@gmail.com");
                setValue("password", "google123");
                setErrorMessage(null); // Clear any previous errors
                setSuccessMessage("Demo Google login data pre-filled. Click 'Sign Up' to proceed.");
              }}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-md text-lg font-semibold"
              whileHover={{ scale: 1.02, boxShadow: "0 5px 10px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.98 }}
            >
              <Image
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                width={24}
                height={24}
              />
              <span>Continue with Google</span>
            </motion.button>

            <p className="text-center text-gray-600 mt-6">
              Already have an account?{" "}
              <motion.a
                href="/" // Changed to root path
                className="text-blue-600 hover:underline font-semibold"
                whileHover={{ color: "#4F46E5" }}
              >
                Log In
              </motion.a>
            </p>
          </form>
        </motion.div>
      </div>
      {/* Footer removed */}
    </div>
  );
}
