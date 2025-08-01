"use client";

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { FaEnvelope, FaKey, FaArrowLeft } from "react-icons/fa";

// ✅ Validation schemas
const emailSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
});

const codeSchema = yup.object().shape({
  code: yup.string().length(4, "Code must be 4 digits").required("Code required"),
});

// ✅ Types
type EmailFormData = {
  email: string;
};

type CodeFormData = {
  code: string;
};

type User = {
  id: string;
  patientemail: string; // Corrected field name
  patientpassword: string; // Corrected field name
  // Add other fields if needed
};

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm<EmailFormData>({
    resolver: yupResolver(emailSchema),
  });

  const {
    register: registerCode,
    handleSubmit: handleCodeSubmit,
    formState: { errors: codeErrors },
  } = useForm<CodeFormData>({
    resolver: yupResolver(codeSchema),
  });

  useEffect(() => {
    // Load fonts for consistency
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Pacifico&family=Poppins:wght@300;400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const handleEmail = async (data: EmailFormData) => {
    try {
      // Use your mockapi.io endpoint here
      const res = await fetch("https://6888ba66adf0e59551bb2689.mockapi.io/v1/patientlogin");
      const users: User[] = await res.json();

      // ✅ Corrected: Finding the user by `patientemail`
      const user = users.find((u) => u.patientemail === data.email);

      if (!user) {
        setErrorMsg("");
        toast.error("❌ Email not registered");
      } else {
        const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
        setCode(randomCode);
        setEmail(data.email);
        setEmailSent(true);
        toast.success(`Your 4-digit code: ${randomCode}`);
        setErrorMsg("");
      }
    } catch {
      setErrorMsg("");
      toast.error("Something went wrong!");
    }
  };

  const handleCode = (data: CodeFormData) => {
    if (data.code === code) {
      localStorage.setItem("rememberMe", "true");
      localStorage.setItem("email", email);
      localStorage.setItem("password", "google123");
      toast.success("✅ Verified! Logging in...");
      router.push("/dashboard");
    } else {
      setErrorMsg("");
      toast.error("❌ Incorrect code");
    }
  };

  // Floating bubbles for background
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 md:p-10 relative z-10"
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
            <span>Back to Login</span>
          </motion.button>

          <div className="w-full text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Forgot Password
            </h2>
          </div>

          {!emailSent ? (
            <form onSubmit={handleEmailSubmit(handleEmail)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your registered email
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <FaEnvelope className="text-gray-400 ml-3" />
                  <input
                    type="email"
                    {...registerEmail("email")}
                    className="w-full px-4 py-3 border-0 focus:outline-none bg-transparent text-gray-800"
                    placeholder="your-email@example.com"
                  />
                </div>
                {emailErrors.email && (
                  <p className="text-red-500 text-sm mt-2">{emailErrors.email.message}</p>
                )}
              </div>
              {errorMsg && <p className="text-red-500 text-sm text-center py-2">{errorMsg}</p>}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg transition-all shadow-md font-medium"
              >
                Send Code
              </motion.button>
            </form>
          ) : (
            <form onSubmit={handleCodeSubmit(handleCode)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter the 4-digit code sent to{" "}
                  <b className="text-blue-600">{email}</b>
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <FaKey className="text-gray-400 ml-3" />
                  <input
                    type="text"
                    {...registerCode("code")}
                    className="w-full px-4 py-3 border-0 focus:outline-none bg-transparent text-gray-800"
                    placeholder="e.g., 1234"
                  />
                </div>
                {codeErrors.code && (
                  <p className="text-red-500 text-sm mt-2">{codeErrors.code.message}</p>
                )}
              </div>
              {errorMsg && <p className="text-red-500 text-sm text-center py-2">{errorMsg}</p>}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md font-medium"
              >
                Verify Code
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}