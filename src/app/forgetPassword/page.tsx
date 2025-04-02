"use client";

import React, { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await axios.post("/api/auth/forgot-password", { email });
      setIsSubmitted(true);
      toast({
        title: "Password reset email sent",
        description: "Please check your inbox for further instructions.",
        variant: "default",
      });
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to send reset email";
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
                {isSubmitted ? (
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
                    <h2 className="text-2xl font-bold tracking-tight">Check your email</h2>
                    <p className="text-zinc-400 text-sm">
                      We've sent a password reset link to <span className="font-medium text-white">{email}</span>
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h2 className="text-2xl font-bold tracking-tight text-center">Reset your password</h2>
                    <p className="text-zinc-400 text-sm text-center mt-2">
                      Enter your email and we'll send you instructions to reset your password
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardHeader>

            <AnimatePresence mode="wait">
              {!isSubmitted ? (
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
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                        <Input
                          placeholder="Email address"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-transparent placeholder:text-muted-foreground  border focus-visible:ring-[#815bf5]"
                          disabled={isSubmitting}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-[#815bf5] to-[#9f75ff] hover:from-[#6842e3] hover:to-[#815bf5] transition-all duration-300 text-white font-medium"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Send Reset Link"
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
                  <div className="space-y-4">
                    <p className="text-sm text-zinc-400 text-center">
                      Didn't receive the email? Check your spam folder or try again.
                    </p>
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      variant="outline"
                      className="w-full border-[#815bf5]/30 text-[#815bf5] hover:bg-[#815bf5]/10 hover:text-[#9f75ff]"
                    >
                      Try again
                    </Button>
                    <Button
                      onClick={() => router.push('/login')}
                      className="w-full bg-gradient-to-r from-[#815bf5] to-[#9f75ff] hover:from-[#6842e3] hover:to-[#815bf5] transition-all duration-300 text-white font-medium"
                    >
                      Back to Login
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <CardFooter className="flex flex-col gap-2 pt-2 pb-6 px-6">
              <div className="w-full">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-full border-t border border-zinc-800/50"></div>
                  <div className="relative bg-black px-4 text-xs text-zinc-500">OR</div>
                </div>
              </div>

              <div className="text-center mt-2">
                <p className="text-sm text-zinc-400">
                  Remember your password?{" "}
                  <Link href="/login" className="text-[#815bf5] hover:text-[#9f75ff] font-medium transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        <p className="text-xs text-center mt-8 text-zinc-600">
          🔒 We care about your privacy
          <a href="/terms" className="text-zinc-400 hover:text-[#815bf5] transition-colors">
            {" "}
            (Terms of Service
          </a>{" "}
          &{" "}
          <a href="/privacypolicy" className="text-zinc-400 hover:text-[#815bf5] transition-colors">
            Privacy Policy)
          </a>
        </p>
      </div>
    </div>
  );
}