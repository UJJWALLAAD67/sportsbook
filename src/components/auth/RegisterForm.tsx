"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";


const registerSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["USER", "OWNER"] as const).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

type RegisterFormData = z.infer<typeof registerSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

export default function RegisterForm() {
  const [step, setStep] = useState<"register" | "otp">("register");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const {
    register: otpField,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  // Registration submit
  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok && result.ok) {
        setUserEmail(data.email);
        setStep("otp");
      } else {
        setError(result.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // OTP submit
  const onOtpSubmit = async (data: OtpFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, otp: data.otp }),
      });

      const result = await res.json();

      if (res.ok && result.ok) {
        router.push("/auth/login?verified=true");
      } else {
        setError(result.error || "Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Step UI
  if (step === "otp") {
    return (
      <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden">
        {/* Left image */}
        <div className="hidden md:flex md:w-1/2 h-full bg-green-600 items-center justify-center">
          <img
            src="/login/banner.jpg"
            alt="Sports banner"
            className="object-cover h-full w-full"
          />
        </div>

        {/* OTP form */}
        <div className="flex w-full md:w-1/2 h-full items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-green-800">
                Verify your email
              </h2>
              <p className="mt-2 text-center text-sm text-gray-700">
                We sent an OTP to {userEmail}
              </p>
            </div>

            <form
              className="mt-8 space-y-6"
              onSubmit={handleOtpSubmit(onOtpSubmit)}
            >
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enter 6-digit OTP
                </label>
                <input
                  {...otpField("otp")}
                  type="text"
                  maxLength={6}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="123456"
                />
                {otpErrors.otp && (
                  <p className="mt-1 text-sm text-red-600">
                    {otpErrors.otp.message}
                  </p>
                )}
              </div>

              {error && (
                <p className="text-center text-red-600 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 rounded-md text-white bg-green-600 hover:bg-green-700 font-medium transition disabled:opacity-50"
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Registration Step UI
  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left image */}
      <div className="hidden md:flex md:w-1/2 h-full bg-green-600 items-center justify-center">
        <img
          src="/login/banner.jpg"
          alt="Sports banner"
          className="object-cover h-full w-full"
        />
      </div>

      {/* Registration form */}
      <div className="flex w-full md:w-1/2 h-full items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-green-800">
              Create your account
            </h2>
          </div>

          <form
            className="mt-8 space-y-6"
            onSubmit={handleSubmit(onRegisterSubmit)}
          >
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  {...registerField("fullName")}
                  type="text"
                  placeholder="Your full name"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  {...registerField("email")}
                  type="email"
                  placeholder="your@email.com"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Account Type
                </label>
                <select
                  {...registerField("role")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="USER">User (Book facilities)</option>
                  <option value="OWNER">Facility Owner</option>
                </select>
                {errors.role && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.role.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  {...registerField("password")}
                  type="password"
                  placeholder="Password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  {...registerField("confirmPassword")}
                  type="password"
                  placeholder="Confirm password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {error && (
              <p className="text-center text-red-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 rounded-md text-white bg-green-600 hover:bg-green-700 font-medium transition disabled:opacity-50"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-green-600 hover:text-green-700"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
