"use client";

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const schema = yup.object().shape({
  email: yup.string().email().required("Email is required"),
  password: yup.string().min(6, "Min 6 characters").required("Password is required"),
});

type FormData = {
  email: string;
  password: string;
};

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Pacifico&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const onSubmit = async (data: FormData) => {
    const res = await fetch(`https://6888ba66adf0e59551bb2689.mockapi.io/v1/patientlogin`);
    const existingUsers = await res.json();

    const alreadyExists = existingUsers.find(
      (user: any) => user.patientemail === data.email
    );

    if (alreadyExists) {
      setError("Email already registered ❌");
      return;
    }

    await fetch("https://6888ba66adf0e59551bb2689.mockapi.io/v1/patientlogin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientemail: data.email,
        patientpassword: data.password,
      }),
    });

    alert("Signup successful ✅");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        {/* Logo and Heading */}
        <div className="flex flex-col items-center mb-6">
          <Image
            src="https://i.postimg.cc/SKnMMNcw/360-F-863843181-63-Nv8tgy-BU8-X26-B1-Lq-Qvfi0tn95aj-Sg-X.jpg"
            alt="Shedula Logo"
            width={80}
            height={80}
            className="rounded-full"
            unoptimized
          />
          <h2
            className="text-4xl text-purple-700 mt-3"
            style={{ fontFamily: "'Pacifico', cursive" }}
          >
            Shedula
          </h2>
          <p className="text-sm text-gray-600 mt-1 italic text-center">
            Find the right doctor for your needs
          </p>
        </div>

        <h1 className="text-2xl font-semibold text-center text-purple-600 mb-6">Signup</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Email</label>
            <input
              type="email"
              {...register("email")}
              className="w-full text-black border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="w-full text-black border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-sm text-gray-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition"
          >
            Sign Up
          </button>

          {/* Continue with Google */}
          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-2 text-sm text-gray-600">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <button
            type="button"
            onClick={() => {
              setValue("email", "googleuser@gmail.com");
              setValue("password", "google123");
            }}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            <Image
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              width={20}
              height={20}
              unoptimized
            />
            <span className="text-black">Continue with Google</span>
          </button>
        </form>
      </div>
    </div>
  );
}