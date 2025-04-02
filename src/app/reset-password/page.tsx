"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Lock, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

 function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [error, setError] = useState("");
  const [tokenError, setTokenError] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState<string>("");

  useEffect(() => {
    const tokenParam = searchParams?.get("token");
    if (!tokenParam) {
      setTokenError(true);
      return;
    }
    setToken(tokenParam);
  }, [searchParams]);

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordFeedback("");
      return;
    }

    // Simple password strength calculator
    let strength = 0;
    let feedback = "";

    // Length check
    if (password.length >= 6) {
      strength += 25;
    } else {
      feedback = "Password should be at least 6 characters";
    }

    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;

    // Determine feedback based on strength
    if (strength === 25) feedback = "Password is weak";
    else if (strength === 50) feedback = "Password is moderate";
    else if (strength === 75) feedback = "Password is good";
    else if (strength === 100) feedback = "Password is strong";

    setPasswordStrength(strength);
    setPasswordFeedback(feedback);
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500";
    if (passwordStrength <= 50) return "bg-orange-500";
    if (passwordStrength <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!password || !confirmPassword) {
      setError("Please fill in both password fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post("/api/auth/reset-password", { token, password });
      setIsSuccessful(true);
      toast({
        title: "Password reset successful",
        description: "Your password has been reset. You can now log in with your new password.",
        variant: "default",
      });
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to reset password";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tokenError) {
    return (
      <div className="flex min-h-screen bg-[#04071F] overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#815bf5] rounded-full filter blur-[120px] opacity-30" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FC8929] rounded-full filter blur-[120px] opacity-30" />

        <div className="m-auto w-full max-w-md p-6 relative z-10">
          <Link href="/login" className="inline-flex items-center text-sm text-[#815bf5] mb-6 hover:text-[#9f75ff] transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to login
          </Link>

          <Card className="border-none bg-background/60 backdrop-blur-xl shadow-2xl text-white">
            <CardContent className="pt-6 pb-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Invalid Request</h2>
                <p className="text-zinc-400 text-sm">
                  The password reset link is invalid or has expired.
                </p>
                <Button
                  onClick={() => router.push('/forgetPassword')}
                  className="w-full bg-gradient-to-r from-[#815bf5] to-[#9f75ff] hover:from-[#6842e3] hover:to-[#815bf5] transition-all mt-4"
                >
                  Request a new link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#04071F] overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#815bf5] rounded-full filter blur-[120px] opacity-30" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FC8929] rounded-full filter blur-[120px] opacity-30" />

      <div className="m-auto w-full max-w-md p-6 relative z-10">
        <Link href="/login" className="inline-flex items-center text-sm text-[#815bf5] mb-6 hover:text-[#9f75ff] transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to login
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-none bg-[#04071F] backdrop-blur-xl shadow-2xl text-white">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <img src="/logo.png" className="h-8" alt="Zapllo Logo" />
              </div>

              <AnimatePresence mode="wait">
                {isSuccessful ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-4"
                  >
                    <div className="mx-auto w-16 h-16 bg-[#815bf5]/10 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-[#815bf5]" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Password Reset Complete</h2>
                    <p className="text-zinc-400 text-sm">
                      Your password has been successfully reset. You can now log in with your new password.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h2 className="text-2xl font-bold tracking-tight text-center">Create a new password</h2>
                    <p className="text-zinc-400 text-sm text-center mt-2">
                      Enter a strong password that you don't use elsewhere
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardHeader>

            <AnimatePresence mode="wait">
              {!isSuccessful ? (
                <motion.div
                  key="reset-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <CardContent className="space-y-4 pt-4">
                  {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                          <Input
                            placeholder="New password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 bg-transparent placeholder:text-muted-foreground  focus-visible:ring-[#815bf5]"
                            disabled={isSubmitting}
                          />
                        </div>
                        
                        {password && (
                          <div className="space-y-1">
                            <Progress 
                              value={passwordStrength} 
                              className="h-1 bg-zinc-800"
                            />
                            <p className={`text-xs ${
                              passwordStrength <= 25 ? 'text-red-400' : 
                              passwordStrength <= 50 ? 'text-orange-400' : 
                              passwordStrength <= 75 ? 'text-yellow-400' : 
                              'text-green-400'
                            }`}>
                              {passwordFeedback}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                        <Input
                          placeholder="Confirm new password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10 bg-transparent placeholder:text-muted-foreground focus-visible:ring-[#815bf5]"
                          disabled={isSubmitting}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting || passwordStrength < 20}
                        className="w-full bg-gradient-to-r from-[#815bf5] to-[#9f75ff] hover:from-[#6842e3] hover:to-[#815bf5] transition-all duration-300 text-white font-medium"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Resetting...
                          </>
                        ) : (
                          "Reset Password"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </motion.div>
              ) : (
                <motion.div
                  key="success-actions"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-6 pb-6 pt-2"
                >
                  <Button
                    onClick={() => router.push('/login')}
                    className="w-full bg-gradient-to-r from-[#815bf5] to-[#9f75ff] hover:from-[#6842e3] hover:to-[#815bf5] transition-all duration-300 text-white font-medium"
                  >
                    Go to Login
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <CardFooter className="pt-2 pb-6 px-6">
              <div className="text-center w-full">
                <p className="text-xs text-zinc-400">
                  By resetting your password, you agree to our{" "}
                  <a href="/terms" className="text-[#815bf5] hover:text-[#9f75ff] transition-colors">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacypolicy" className="text-[#815bf5] hover:text-[#9f75ff] transition-colors">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="w-full">
      <Card className="border shadow-md animate-pulse">
        <CardHeader className="pb-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full p-3 bg-gray-200 dark:bg-gray-700 h-14 w-14"></div>
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
        </CardHeader>
        <CardContent className="space-y-6 pb-6">
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </CardFooter>
      </Card>
    </div>
  );
}

// Main component that wraps the content with Suspense
export default function ResetPasswordPage() {
  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto h-screen overflow-y-scroll flex items-center justify-center">
      <Suspense fallback={<LoadingCard />}>
        <ResetPassword />
      </Suspense>
    </div>
  );
}