"use client";

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ✅ Validation schema
const schema = yup.object().shape({
  doctorId: yup.string().required("Doctor ID is required"),
  password: yup.string().min(6).required("Password is required"),
});

// ✅ Form data type
type FormData = {
  doctorId: string;
  password: string;
};

// ✅ Doctor type for fetched data
type Doctor = {
  doctorId: string;
  password: string;
  // Add other fields if needed
};

export default function DoctorLogin() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      doctorId: "",
      password: "",
    },
  });

  const [fadeIn, setFadeIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    setFadeIn(true);

    // Load Pacifico font
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Pacifico&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Prefill "Remember Me" if previously selected
    const stored = localStorage.getItem("rememberDoctor") === "true";
    if (stored) {
      setRememberMe(true);
    }
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch("http://localhost:4000/doctors");
      const doctors: Doctor[] = await res.json();

      const match = doctors.find(
        (doc) =>
          doc.doctorId === data.doctorId && doc.password === data.password
      );

      if (match) {
        if (rememberMe) {
          localStorage.setItem("rememberDoctor", "true");
          localStorage.setItem("doctorId", data.doctorId);
          localStorage.setItem("docPassword", data.password);
        } else {
          localStorage.removeItem("rememberDoctor");
          localStorage.removeItem("doctorId");
          localStorage.removeItem("docPassword");
        }
        alert("Doctor logged in ✅");
        router.push("/doctor/dashboard");
      } else {
        setErrorMsg("Invalid ID or password ❌");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Login failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-200 flex items-center justify-center px-4">
      <div
        className={`w-full max-w-md bg-white rounded-2xl shadow-xl p-8 transition-opacity duration-700 ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Logo and App Name */}
        <div className="flex flex-col items-center mb-6">
          <Image
            src="https://i.postimg.cc/SKnMMNcw/360-F-863843181-63-Nv8tgy-BU8-X26-B1-Lq-Qvfi0tn95aj-Sg-X.jpg"
            alt="Logo"
            width={80}
            height={80}
            unoptimized
            className="rounded-full"
          />
          <h2
            className="text-4xl text-indigo-600 mt-2"
            style={{ fontFamily: "'Pacifico', cursive" }}
          >
            Shedula
          </h2>
        </div>

        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          Doctor Login
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Doctor ID */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Doctor ID
            </label>
            <input
              type="text"
              {...register("doctorId")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {errors.doctorId && (
              <p className="text-sm text-red-500 mt-1">
                {errors.doctorId.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-2 text-sm text-indigo-700"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center mb-2">
            <label className="flex items-center gap-2 text-gray-900 font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="form-checkbox text-indigo-600"
              />
              Remember me
            </label>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <p className="text-red-500 text-center text-sm">{errorMsg}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}