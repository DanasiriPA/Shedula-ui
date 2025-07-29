"use client";

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const emailSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
});

const codeSchema = yup.object().shape({
  code: yup.string().length(4, "Code must be 4 digits").required("Code required"),
});

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
  } = useForm({
    resolver: yupResolver(emailSchema),
  });

  const {
    register: registerCode,
    handleSubmit: handleCodeSubmit,
    formState: { errors: codeErrors },
  } = useForm({
    resolver: yupResolver(codeSchema),
  });

  const handleEmail = async (data: any) => {
    try {
      const res = await fetch("http://localhost:4000/users");
      const users = await res.json();

      const user = users.find((u: any) => u.email === data.email);

      if (!user) {
        setErrorMsg("❌ Email not registered");
      } else {
        const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
        setCode(randomCode);
        setEmail(data.email);
        setEmailSent(true);
        alert(`Your 4-digit code: ${randomCode}`);
        setErrorMsg("");
      }
    } catch (err) {
      setErrorMsg("Something went wrong!");
    }
  };

  const handleCode = (data: any) => {
    if (data.code === code) {
      localStorage.setItem("rememberMe", "true");
      localStorage.setItem("email", email);
      localStorage.setItem("password", "google123"); // or a dummy value
      alert("✅ Verified! Logging in...");
      router.push("/dashboard");
    } else {
      setErrorMsg("❌ Incorrect code");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Forgot Password
        </h2>

        {!emailSent ? (
          <form onSubmit={handleEmailSubmit(handleEmail)} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Enter your registered email
            </label>
            <input
              type="email"
              {...registerEmail("email")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-400"
            />
            {emailErrors.email && (
              <p className="text-red-500 text-sm">{emailErrors.email.message}</p>
            )}
            {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Send Code
            </button>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit(handleCode)} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Enter the 4-digit code sent to <b>{email}</b>
            </label>
            <input
              type="text"
              {...registerCode("code")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-400"
            />
            {codeErrors.code && (
              <p className="text-red-500 text-sm">{codeErrors.code.message}</p>
            )}
            {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Verify Code
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
