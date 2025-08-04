"use client";

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";

// Import Firebase Authentication services
import {
  signInWithEmailAndPassword,
  AuthError,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

// Validation schema
const schema = yup.object().shape({
  email: yup.string().email("Please enter a valid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

// Form data type
type FormData = {
  email: string;
  password: string;
};

export default function DoctorLogin() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const descriptionRef = useRef<HTMLDivElement>(null);

  const description = "Welcome, Doctor! Manage your appointments and patient records with ease. Your dedicated portal for seamless healthcare management.";
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    // Load fonts
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Pacifico&family=Poppins:wght@300;400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Typing animation for description
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < description.length) {
        setTypedText(description.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 30);

    // Removed the pre-fill logic from here
    // setValue("email", "dr123@hospital.com");
    // setValue("password", "password123");
    // setRememberMe(true);

    return () => clearInterval(typingInterval);
  }, [setValue]);

  const onSubmit = async (data: FormData) => {
    setErrorMsg(""); // Clear previous errors
    try {
      // Use Firebase's signInWithEmailAndPassword function
      await signInWithEmailAndPassword(auth, data.email, data.password);
      
      // On successful login
      if (rememberMe) {
        localStorage.setItem("rememberDoctor", "true");
        localStorage.setItem("docEmail", data.email);
      } else {
        localStorage.removeItem("rememberDoctor");
        localStorage.removeItem("docEmail");
      }

      toast.success("Doctor logged in successfully! ✅");
      router.push("/doctor/dashboard"); // Redirect to doctor dashboard
    } catch (err) {
      const firebaseError = err as AuthError;
      console.error(firebaseError);

      let message = "An unexpected error occurred. Please try again.";
      // Provide user-friendly error messages based on Firebase error codes
      switch (firebaseError.code) {
        case "auth/invalid-email":
          message = "The email address is not valid.";
          break;
        case "auth/user-not-found":
          message = "No account found with this email.";
          break;
        case "auth/wrong-password":
        case "auth/invalid-credential":
          message = "Invalid email or password.";
          break;
        default:
          message = "Login failed. Please check your credentials.";
          break;
      }
      setErrorMsg(message);
    }
  };

  const bubbles = [
    { size: 120, left: "5%", duration: 15, delay: 0 },
    { size: 80, left: "20%", duration: 20, delay: 2 },
    { size: 150, left: "35%", duration: 25, delay: 1 },
    { size: 100, left: "50%", duration: 18, delay: 3 },
    { size: 70, left: "65%", duration: 22, delay: 4 },
    { size: 90, left: "80%", duration: 17, delay: 5 },
    { size: 110, left: "95%", duration: 19, delay: 1.5 },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-100 to-pink-50">
      <div className="absolute inset-0 overflow-hidden z-0">
        {bubbles.map((bubble, i) => (
          <motion.div
            key={`bubble-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.left}`,
            }}
            initial={{ y: "100%", opacity: 0.2, scale: 0.2 }}
            animate={{
              y: "-150%",
              opacity: [0.2, 0.6, 0.2],
              scale: [0.2, 1.2, 1.2],
            }}
            transition={{
              duration: bubble.duration,
              delay: bubble.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <Toaster position="top-center" />

      <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto relative z-10 px-4">
        <div className="flex-col justify-center items-center p-8 w-full md:w-1/2 mb-8 md:mb-0">
          <div className="mb-8 text-center">
            <Image
              src="https://i.postimg.cc/SKnMMNcw/360-F-863843181-63-Nv8tgy-BU8-X26-B1-Lq-Qvfi0tn95aj-Sg-X.jpg"
              alt="Shedula Logo"
              width={120}
              height={120}
              unoptimized
              className="rounded-full mx-auto shadow-lg"
            />
            <h1
              className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-700 mt-4"
              style={{ fontFamily: "'Pacifico', cursive" }}
            >
              Shedula
            </h1>
          </div>
          <div
            ref={descriptionRef}
            className="text-gray-800 max-w-md text-center mx-auto"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <p className="text-base font-normal h-40 overflow-hidden leading-relaxed">
              {typedText}
              <span className="animate-pulse">|</span>
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full md:w-1/2 p-8 md:p-10 bg-white rounded-3xl shadow-2xl border border-gray-200"
        >
          <div className="space-y-6">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/")}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-lg bg-white transition-all shadow-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FaArrowLeft className="text-blue-600" />
              <span>Back to Patient Login</span>
            </motion.button>

            <div className="w-full text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Hi, login to your Doctor account
              </h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <FaUser className="text-gray-400 ml-3" />
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full px-4 py-3 border-0 focus:outline-none bg-transparent text-gray-800"
                    placeholder="Enter your Doctor Email"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 mt-2">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <FaLock className="text-gray-400 ml-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className="w-full px-4 py-3 border-0 focus:outline-none bg-transparent text-gray-800 pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 mt-2">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  Remember me
                </label>
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              {errorMsg && (
                <p className="text-red-500 text-center text-sm py-2">
                  {errorMsg}
                </p>
              )}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg transition-all shadow-md font-medium hover:bg-blue-700"
              >
                Login
              </motion.button>
            </form>
          </div>

          <div className="mt-8 p-6 bg-white bg-opacity-70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Demo Doctor Credentials
            </h3>
            <p className="text-sm text-gray-600 text-center">
              Use these credentials for testing the Doctor portal.
            </p>
            <div className="space-y-4 mt-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-700 flex items-center">
                  <span className="mr-2">👨‍⚕️</span> Doctor Account
                </h4>
                <p className="text-blue-600 ml-6 text-sm mt-1">
                  Email: `dr123@hospital.com`
                </p>
                <p className="text-blue-600 ml-6 text-sm">
                  Password: `password123`
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}