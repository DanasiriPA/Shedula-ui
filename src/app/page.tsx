"use client";

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const schema = yup.object().shape({
  email: yup.string().email().required("Email is required"),
  password: yup.string().min(6).required("Password is required"),
});

type FormData = {
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
  const [fadeIn, setFadeIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [loginType, setLoginType] = useState<"patient" | "doctor">("patient");
  const router = useRouter();

  useEffect(() => {
    setFadeIn(true);
    setValue("email", "");
    setValue("password", "");

    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Pacifico&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, [setValue, loginType]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setValue("email", input);

    const remembered = JSON.parse(localStorage.getItem("rememberedUsers") || "[]");
    const matchedEmails = remembered
      .filter((user: any) => user.email.startsWith(input))
      .map((user: any) => user.email);

    setEmailSuggestions(matchedEmails);

    const exactMatch = remembered.find((user: any) => user.email === input);
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
    const remembered = JSON.parse(localStorage.getItem("rememberedUsers") || "[]");
    const match = remembered.find((user: any) => user.email === email);
    if (match) {
      setValue("password", match.password);
      setShowPassword(true);
    }
    setEmailSuggestions([]);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch("https://6888ba66adf0e59551bb2689.mockapi.io/v1/patientlogin");
      const users = await res.json();

      const match = users.find(
        (u: any) => u.patientemail === data.email && u.patientpassword === data.password
      );

      if (match) {
        if (rememberMe) {
          const remembered = JSON.parse(localStorage.getItem("rememberedUsers") || "[]");
          const filtered = remembered.filter((u: any) => u.email !== data.email);
          filtered.push({ email: data.email, password: data.password });
          localStorage.setItem("rememberedUsers", JSON.stringify(filtered));
        } else {
          localStorage.removeItem("rememberedUsers");
        }

        alert("Logged in ✅");
        router.push("/dashboard");
      } else {
        setErrorMsg("Invalid email or password ❌");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Login failed. Try again.");
    }
  };

  const handleDoctorLogin = () => {
    router.push("/doctor/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center px-4">
      <div
        className={`w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 transition-opacity duration-700 ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Logo, App Name, and Quote */}
        <div className="flex flex-col items-center mb-6">
          <Image
            src="https://i.postimg.cc/SKnMMNcw/360-F-863843181-63-Nv8tgy-BU8-X26-B1-Lq-Qvfi0tn95aj-Sg-X.jpg"
            alt="Shedula Logo"
            width={80}
            height={80}
            unoptimized
            className="rounded-full"
          />
          <h1
            className="text-5xl text-blue-700 mt-3"
            style={{ fontFamily: "'Pacifico', cursive" }}
          >
            Shedula
          </h1>
          <p className="text-sm text-gray-600 italic mt-2 text-center">
            Find the right doctor for your needs
          </p>
        </div>

        {/* Login Type Buttons */}
        <div className="flex gap-4 mt-4 w-full">
          <button
            className={`flex-1 py-2 rounded-full font-semibold transition-transform hover:scale-105 ${
              loginType === "patient"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-blue-700 border border-blue-200"
            }`}
            onClick={() => setLoginType("patient")}
          >
            Patient Login
          </button>
          <button
            className={`flex-1 py-2 rounded-full font-semibold transition-transform hover:scale-105 ${
              loginType === "doctor"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-blue-700 border border-blue-200"
            }`}
            onClick={handleDoctorLogin}
          >
            Doctor Login
          </button>
        </div>

        <div className="w-full mt-3 text-center">
          <span className="text-base text-blue-700 font-medium">
            Hi, login to your {loginType} account
          </span>
        </div>

        {/* Login Form */}
        {loginType === "patient" && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative mt-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                onChange={handleEmailChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={getValues("email")}
              />
              {emailSuggestions.length > 0 && (
                <div className="absolute bg-white border border-gray-300 rounded-md mt-1 z-10 w-full max-h-28 overflow-y-auto">
                  {emailSuggestions.map((email) => (
                    <div
                      key={email}
                      className="px-4 py-1 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => handleSuggestionClick(email)}
                    >
                      {email}
                    </div>
                  ))}
                </div>
              )}
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-sm text-black"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm text-black">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="form-checkbox text-blue-600"
                />
                Remember me
              </label>
              <a href="/forgot-password" className="text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>

                        {/* Error Message */}
            {errorMsg && (
              <p className="text-red-500 text-center text-sm">{errorMsg}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-full hover:bg-blue-600 transition"
            >
              Login
            </button>

            {/* Divider */}
            <div className="flex items-center my-4">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-2 text-sm text-black">or</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={() => {
                setValue("email", "googleuser@gmail.com");
                setValue("password", "google123");
                setShowPassword(true);
              }}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-full hover:bg-gray-100 transition"
            >
              <Image
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                width={20}
                height={20}
                unoptimized
              />
              <span className="text-black font-medium">Continue with Google</span>
            </button>

            {/* Signup Link */}
            <p className="text-sm text-center mt-4 text-black">
              Don't have an account?{" "}
              <a href="/signup" className="text-blue-600 hover:underline">
                Sign up
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}