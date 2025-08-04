"use client";

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { FaUser, FaLock, FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";

// Import Firebase Authentication services
import {
  signInWithEmailAndPassword,
  AuthError,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const schema = yup.object().shape({
  email: yup.string().email("Please enter a valid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

type FormData = {
  email: string;
  password: string;
};

type RememberedUser = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [loginType, setLoginType] = useState<"patient" | "doctor">("patient");
  const [typedText, setTypedText] = useState("");
  const router = useRouter();
  const descriptionRef = useRef<HTMLDivElement>(null);

  const description =
    "Your one-stop solution for finding the right doctor. We connect patients with healthcare professionals. Schedule appointments and manage your health easily. Join us today and take control of your health journey!";

  const onSubmit = async (data: FormData) => {
    setErrorMsg(""); // Clear any previous errors
    try {
      // Use Firebase's signInWithEmailAndPassword function
      await signInWithEmailAndPassword(auth, data.email, data.password);
      
      // On successful login
      if (rememberMe) {
        const remembered = JSON.parse(
          localStorage.getItem("rememberedUsers") || "[]"
        ) as RememberedUser[];
        const filtered = remembered.filter((u) => u.email !== data.email);
        filtered.push({ email: data.email, password: data.password });
        localStorage.setItem("rememberedUsers", JSON.stringify(filtered));
      } else {
        localStorage.removeItem("rememberedUsers");
      }

      toast.success("Logged in successfully ✅");
      router.push("/dashboard");
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
  
  // This is the updated function
  const handleGoogleLogin = () => {
    // Set the login type to patient
    setLoginType("patient");
    
    // Automatically fill in the patient credentials
    setValue("email", "googleuser@gmail.com");
    setValue("password", "google123");
    
    // Set rememberMe and showPassword for a seamless demo
    setRememberMe(true);
    setShowPassword(true);

    // Call the form's submit handler to log in with the new values
    handleSubmit(onSubmit)();
    
    // Display a toast message
    toast.success("Attempting patient login...");
  };
  

  useEffect(() => {
    setValue("email", "");
    setValue("password", "");

    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Pacifico&family=Poppins:wght@300;400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < description.length) {
        setTypedText(description.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 30);

    return () => clearInterval(typingInterval);
  }, [setValue]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setValue("email", input);

    const remembered = JSON.parse(
      localStorage.getItem("rememberedUsers") || "[]"
    ) as RememberedUser[];
    const matchedEmails = remembered
      .filter((user) => user.email.startsWith(input))
      .map((user) => user.email);

    setEmailSuggestions(matchedEmails);

    const exactMatch = remembered.find((user) => user.email === input);
    if (exactMatch) {
      setValue("password", exactMatch.password);
      setShowPassword(true);
    } else {
      setValue("password", "");
      setShowPassword(false);
    }
  };

  const handleSuggestionClick = (email: string) => {
    setValue("email", email);
    const remembered = JSON.parse(
      localStorage.getItem("rememberedUsers") || "[]"
    ) as RememberedUser[];
    const match = remembered.find((user) => user.email === email);
    if (match) {
      setValue("password", match.password);
      setShowPassword(true);
    }
    setEmailSuggestions([]);
  };

  const handleDoctorLogin = () => {
    router.push("/doctor/login");
  };

  const bubbles = [
    { size: 120, left: "5%", duration: 4, delay: 0 },
    { size: 80, left: "20%", duration: 5, delay: 2 },
    { size: 150, left: "35%", duration: 6, delay: 1 },
    { size: 100, left: "50%", duration: 4.5, delay: 3 },
    { size: 70, left: "65%", duration: 5.5, delay: 4 },
    { size: 90, left: "80%", duration: 4.2, delay: 5 },
    { size: 110, left: "95%", duration: 4.8, delay: 1.5 },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="absolute inset-0 overflow-hidden z-0">
        {bubbles.map((bubble, i) => (
          <motion.div
            key={`bubble-${i}`}
            className="absolute rounded-full bg-white opacity-100" // Opacity changed to 100
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.left}`,
            }}
            initial={{ y: "100%", opacity: 1, scale: 0.5 }} // Initial opacity changed to 1
            animate={{
              y: "-150%",
              opacity: [1, 0], // Animation opacity starts at 1
              scale: [0.5, 1.5],
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
              className="rounded-full mx-auto"
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
          className="w-full md:w-1/2 p-8 md:p-10"
        >
          <div className="space-y-6">
            <div className="flex gap-4">
              <button
                type="button"
                className={`flex-1 py-3 rounded-full font-semibold transition-all ${
                  loginType === "patient"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-blue-600 border border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => setLoginType("patient")}
              >
                Patient Login
              </button>
              <button
                type="button"
                className={`flex-1 py-3 rounded-full font-semibold transition-all ${
                  loginType === "doctor"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-blue-600 border border-gray-200 hover:bg-gray-50"
                }`}
                onClick={handleDoctorLogin}
              >
                Doctor Login
              </button>
            </div>

            <div className="w-full text-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Hi, login to your {loginType} account
              </h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <FaUser className="text-gray-400 ml-3" />
                  <input
                    type="email"
                    {...register("email")}
                    onChange={handleEmailChange}
                    className="w-full px-4 py-3 border-0 focus:outline-none bg-transparent text-gray-800"
                    value={getValues("email")}
                    placeholder="Enter your email"
                  />
                </div>
                {emailSuggestions.length > 0 && (
                  <div className="absolute bg-white border border-gray-300 rounded-md mt-1 z-10 w-full max-h-28 overflow-y-auto shadow-lg">
                    {emailSuggestions.map((email) => (
                      <div
                        key={email}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-800"
                        onClick={() => handleSuggestionClick(email)}
                      >
                        {email}
                      </div>
                    ))}
                  </div>
                )}
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
                    className="absolute right-3 text-gray-500 hover:text-gray-700"
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
                  href="/forgot-password"
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
                className="w-full bg-blue-600 text-white py-3 rounded-lg transition-all shadow-md font-medium"
              >
                Login
              </motion.button>

              <div className="flex items-center my-5">
                <hr className="flex-grow border-gray-300" />
                <span className="mx-3 text-sm text-gray-500">or</span>
                <hr className="flex-grow border-gray-300" />
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleLogin} // Call the new Google login function
                className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-lg bg-white transition-all shadow-sm font-medium"
              >
                <FaGoogle className="text-red-500" />
                <span className="text-gray-700">Continue with Google</span>
              </motion.button>

              <p className="text-sm text-center mt-5 text-gray-600">
                Don&apos;t have an account?{" "}
                <a
                  href="/signup"
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  Sign up
                </a>
              </p>
            </form>
          </div>

          <div className="mt-8 p-6 bg-white bg-opacity-70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Login Credentials
            </h3>
            <p className="text-sm text-gray-600 text-center">
              Use these credentials to access the different accounts.
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
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-700 flex items-center">
                  <span className="mr-2">🏥</span> Patient Account
                </h4>
                <p className="text-purple-600 ml-6 text-sm mt-1">
                  Email: `googleuser@gmail.com`
                </p>
                <p className="text-purple-600 ml-6 text-sm">
                  Password: `google123`
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}