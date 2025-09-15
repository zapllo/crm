"use client";
import { useState, useEffect, useRef } from "react";
import { useUserContext } from "@/contexts/userContext";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Star, CheckCircle, ArrowRight, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import Link from "next/link";

const TrialExpiredBanner = () => {
    const { user } = useUserContext();
    const [activeFeature, setActiveFeature] = useState(0);
    const confettiRef = useRef<HTMLDivElement>(null);

    const premiumFeatures = [
        {
            icon: <Zap className="h-6 w-6 text-yellow-400" />,
            title: "Advanced Automation",
            description: "Save 5+ hours weekly with smart workflows and triggers"
        },
        {
            icon: <Star className="h-6 w-6 text-indigo-400" />,
            title: "Unlimited Contacts",
            description: "Grow your business without limits or extra fees"
        },
        {
            icon: <CheckCircle className="h-6 w-6 text-emerald-400" />,
            title: "Priority Support",
            description: "Get answers within 2 hours from our expert team"
        },
    ];

    useEffect(() => {
        // Auto-rotate features every 3 seconds
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % premiumFeatures.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const triggerConfetti = () => {
        if (confettiRef.current) {
            const rect = confettiRef.current.getBoundingClientRect();
            confetti({
                particleCount: 100,
                spread: 70,
                origin: {
                    x: (rect.left + rect.width / 2) / window.innerWidth,
                    y: (rect.top + rect.height / 2) / window.innerHeight
                }
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
            {/* Header with logo */}
            <header className="p-6 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <motion.div
                                initial={{ rotate: 0 }}
                                whileHover={{ rotate: 10, scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <div className="relative">
                                    <img src="/icons/zapllo.png" />
                                    <motion.div
                                        className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500"
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.7, 1, 0.7]
                                        }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 2
                                        }}
                                    />
                                </div>
                            </motion.div>
                            <div className="flex flex-col">
                                <span className="font-bold text-xl tracking-tight">Zapllo<span className="text-primary">CRM</span></span>
                                <span className="text-[10px] font-medium text-muted-foreground leading-tight -mt-1">Never miss a Lead</span>
                            </div>
                        </Link>
                    </div>
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-md">
                        Premium Required
                    </span>
                </div>
                <div ref={confettiRef}>
                    <Button
                        className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
                        onClick={triggerConfetti}
                    >
                        Upgrade Now
                    </Button>
                </div>
            </header>

            {/* Main content */}
            <div className="flex-grow flex flex-col items-center justify-center p-8 max-w-6xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="flex justify-center mb-6">
                        <div className="bg-gradient-to-r from-amber-500 to-pink-500 p-4 rounded-full">
                            <Lock className="h-10 w-10" />
                        </div>
                    </div>

                    <h1 className="text-4xl font-bold mb-4">
                        Your Premium Trial Has Ended
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        You were 3.5x more productive with our premium features.
                        To continue enjoying all the powerful tools that helped you manage
                        your relationships more effectively, upgrade to our premium plan.
                    </p>
                </motion.div>

                {/* Features grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-12">
                    {premiumFeatures.map((feature, index) => (
                        <motion.div
                            key={index}
                            animate={{
                                scale: activeFeature === index ? 1.05 : 1,
                                borderColor: activeFeature === index ? "rgb(139, 92, 246)" : "rgb(30, 41, 59)"
                            }}
                            transition={{ duration: 0.3 }}
                            className={`bg-slate-800/50 backdrop-blur-sm border-2 rounded-xl p-6 ${activeFeature === index ? "border-indigo-500" : "border-slate-700"
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                {feature.icon}
                                <h3 className="font-semibold text-xl">{feature.title}</h3>
                            </div>
                            <p className="text-gray-300">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* CTA section */}
                <div className="w-full max-w-2xl mx-auto">
                    <div className="bg-indigo-900/60 backdrop-blur-sm border border-indigo-700 rounded-2xl p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4">
                            Special Offer: Don't Lose Your Momentum!
                        </h2>
                        <p className="text-gray-300 mb-6">
                           
                            All your data is still there, waiting for you.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <div ref={confettiRef}>
                                <Link href='/settings/billing'>
                                    <Button
                                        className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-lg w-full sm:w-auto px-8 py-4 h-fit font-medium"
                                        onClick={triggerConfetti}
                                    >
                                        Upgrade to Premium <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                            </div>

                            {/* <Button
                                variant="outline"
                                className="text-black border-white/30 hover:bg-white/10   text-lg w-full sm:w-auto px-6 py-6 h-auto"
                                onClick={() => window.location.href = "/settings/billing"}
                            >
                                View Plans
                            </Button> */}
                        </div>

                        <p className="text-sm text-gray-400 mt-4">
                            Need help? Contact our team at <a href="mailto:support@zapllo.com" className="underline">support@zapllo.com</a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="p-4 border-t border-slate-800 text-center text-gray-400 text-sm">
                <p>© {new Date().getFullYear()} Zapllo. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default TrialExpiredBanner;