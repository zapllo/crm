"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu, X, ArrowRight, PlusCircle, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Sparkles, Check, Clock, User, Zap, BarChart3, ArrowUpRight } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const navigation = [
  { name: "Features", href: "#features" },
  { name: "Demo", href: "#demo" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "Integrations", href: "#integrations" },
]

export default function Header() {
  const { theme, setTheme } = useTheme()
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const [showFeatureDialog, setShowFeatureDialog] = useState(false)
  const [featureTab, setFeatureTab] = useState("productivity")
  const [countdown, setCountdown] = useState(1800) // 30 minutes in seconds
  const [showLoader, setShowLoader] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showFeatureDialog && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showFeatureDialog, countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Determine if we're scrolling up or down
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
      setIsScrolled(currentScrollY > 10)

      // Check which section is currently in view
      const sections = ["features", "demo", "testimonials", "integrations"]

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Add a smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Add function to handle login click
  const handleLoginClick = (e:any) => {
    e.preventDefault();
    setShowLoader(true);

    // Redirect after 3 seconds
    setTimeout(() => {
      window.location.href = "/login";
    }, 3000);
  };

  // If loader is active, show loading screen
  if (showLoader) {
    return (
      <div className="h-screen bg-[#04071F] flex items-center justify-center overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-[#815bf5] rounded-full filter blur-[80px] opacity-20 animate-pulse"
                style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#FC8929] rounded-full filter blur-[90px] opacity-15 animate-pulse"
                style={{ animationDuration: '6s' }} />
            <div className="absolute top-2/3 left-1/2 w-48 h-48 bg-[#9f75ff] rounded-full filter blur-[70px] opacity-20 animate-pulse"
                style={{ animationDuration: '5s' }} />
        </div>

        <div className="relative z-10 flex flex-col items-center">
            {/* Logo with subtle animation */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-10"
            >
                <img src="/logo.png" className="h-12" alt="Zapllo Logo" />
            </motion.div>

            {/* Primary loading animation */}
            <div className="relative flex items-center justify-center mb-8">
                <svg className="w-24 h-24" viewBox="0 0 100 100">
                    {/* Outer circle */}
                    <circle
                        cx="50" cy="50" r="40"
                        stroke="rgba(129, 91, 245, 0.1)"
                        strokeWidth="4"
                        fill="none"
                    />
                    {/* Animated progress circle */}
                    <motion.circle
                        cx="50" cy="50" r="40"
                        stroke="url(#gradientStroke)"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, rotate: 0 }}
                        animate={{
                            pathLength: [0, 0.5, 1],
                            rotate: 360
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{
                            rotate: "0 0 0 0 50 50",
                            transformOrigin: "center"
                        }}
                    />
                    {/* Gradient definition */}
                    <defs>
                        <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#815bf5" />
                            <stop offset="100%" stopColor="#FC8929" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Center pulse element */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        className="w-10 h-10 bg-gradient-to-br from-[#815bf5] to-[#9f75ff] rounded-full"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.7, 1, 0.7]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </div>
            </div>

            {/* Loading message */}
            <motion.div
                animate={{
                    opacity: [0.5, 1, 0.5],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="text-center"
            >
                <h3 className="text-white font-medium text-xl mb-2">Preparing Your Dashboard</h3>
                <p className="text-[#a29bfe] text-sm max-w-xs text-center">
                    Loading your personalized CRM experience. Just a moment...
                </p>
            </motion.div>

            {/* Loading steps indication */}
            <div className="mt-8 flex space-x-2">
                {[0, 1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 bg-[#815bf5] rounded-full"
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.3, 1, 0.3]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>

            {/* Helpful tips that cycle */}
            <motion.div
                className="mt-10 max-w-sm text-center px-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
            >
                <AnimatePresence mode="wait">
                    {[
                        "Zapllo helps you convert 35% more leads on average",
                        "Use automation tools to save up to 12 hours per week",
                        "Track your team's performance with real-time analytics",
                        "Customize your dashboard for optimal productivity"
                    ].map((tip, index) => (
                        <motion.p
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                            className="text-white/60 text-sm font-light"
                            style={{
                                display: Math.floor((Date.now() / 3000) % 4) === index ? 'block' : 'none'
                            }}
                        >
                            <span className="text-[#FC8929]">TIP:</span> {tip}
                        </motion.p>
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
      </div>
    );
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-200 ${isScrolled
        ? "bg-background/90 backdrop-blur-md shadow-md"
        : "bg-transparent"
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
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

          {/* Desktop Navigation */}
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href.substring(1))}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  activeSection === item.href.substring(1)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {item.name}
              </button>
            ))}
            <Badge onClick={() => setShowFeatureDialog(true)}
              className="ml-2 bg-primary/20 text-primary cursor-pointer hover:bg-primary/30 whitespace-nowrap">
              <PlusCircle className="h-3 w-3 mr-1" />
              New Features
            </Badge>
          </nav>

          {/* Action Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="mr-2"
              aria-label="Toggle theme"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button> */}
            <Link href="/login">
            <Button variant="ghost" size="sm" onClick={handleLoginClick}>
              Log in
            </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="relative group overflow-hidden">
                <span className="relative z-10 flex items-center">
                  Start free trial
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 bg-primary z-0 group-hover:bg-opacity-0 transition-all duration-300" />
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[radial-gradient(circle,_white_10%,_transparent_70%)] group-hover:animate-shine" />
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Menu className="h-5 w-5 -ml-6 md:ml-0" />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary"
                  />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <div className="flex flex-col h-full">
                  {/* Header with logo and theme toggle */}
                  <div className="flex items-center justify-between py-4">
                    <Link href="/" className="flex items-center space-x-2">
                      <img src="/icons/zapllo.png" alt="Zapllo Logo" className="h-8 w-auto" />
                      <span className="font-bold text-lg">Zapllo<span className="text-primary">CRM</span></span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      aria-label="Toggle theme"
                    >
                      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </Button>
                  </div>

                  {/* Navigation with smooth scrolling */}
                  <div className="flex flex-col space-y-1 mt-6">
                    {navigation.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => {
                          scrollToSection(item.href.substring(1));
                          const element = document.querySelector('[data-radix-collection-item]') as HTMLElement;
                          element?.click(); // Close the sheet
                        }}
                        className={cn(
                          "px-3 py-2 text-left text-base font-medium rounded-md transition-colors",
                          activeSection === item.href.substring(1)
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                      >
                        {item.name}
                      </button>
                    ))}
                    <Badge onClick={() => setShowFeatureDialog(true)}
                      className="w-fit mt-2 ml-3 bg-primary/20 cursor-pointer text-primary hover:bg-primary/30">
                      <PlusCircle className="h-3 w-3 mr-1" />
                      New Features
                    </Badge>
                  </div>

                  {/* Action buttons - same as before */}
                  <div className="mt-auto space-y-3 py-6">
                    <Link href="/login" className="block">
                      <Button variant="outline" size="sm" className="w-full">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/signup" className="block">
                      <Button size="sm" className="w-full relative group overflow-hidden">
                        <span className="relative z-10 flex items-center">
                          Start free trial
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                        <span className="absolute inset-0 bg-primary z-0 group-hover:bg-opacity-0 transition-all duration-300" />
                        <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[radial-gradient(circle,_white_10%,_transparent_70%)] group-hover:animate-shine" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <Dialog open={showFeatureDialog} onOpenChange={setShowFeatureDialog}>
        <DialogContent className="sm:max-w-[600px]  z-[100] max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle className=" text-xl">
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
                Exclusive New Features
              </div>
              <span className="ml-auto p-2 text-sm font-normal text-muted-foreground flex items-center">
                <Clock className="h-4 w-4 mr-1" /> Limited offer: {formatTime(countdown)}
              </span>
            </DialogTitle>
            <DialogDescription>
              Get 50% off today on our Pro plan with these cutting-edge features that will transform your business
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="productivity" value={featureTab} onValueChange={setFeatureTab} className="mt-4">
            <TabsList className="grid grid-cols-3 gap-4 bg-accent">
              <TabsTrigger value="productivity" className="flex items-center border-none">
                <Zap className="h-4 w-4 mr-1" /> Productivity
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center border-none">
                <BarChart3 className="h-4 w-4 mr-1" /> Analytics
              </TabsTrigger>
              <TabsTrigger value="engagement" className="flex items-center border-none">
                <User className="h-4 w-4 mr-1" /> Engagement
              </TabsTrigger>
            </TabsList>

            <TabsContent value="productivity" className="space-y-4 mt-4">
              <Card className="border-2 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle>AI-Powered Lead Scoring</CardTitle>
                  <CardDescription>Never miss a hot lead again</CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div
                    className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 p-4 rounded-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="text-sm">Our AI analyzes customer behavior and predicts which leads are most likely to convert, boosting sales efficiency by 67%.</p>
                    <div className="mt-3 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium">Available only in Pro plan</span>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4 mt-4">
              <Card className="border-2 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle>Real-time Sales Dashboard</CardTitle>
                  <CardDescription>Make data-driven decisions instantly</CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div
                    className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-950 dark:to-blue-950 p-4 rounded-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="text-sm">Live metrics and predictive analytics help you spot trends before competitors. Companies using this feature report 43% revenue growth.</p>
                    <div className="mt-3 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium">Available only in Pro plan</span>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="engagement" className="space-y-4 mt-4">
              <Card className="border-2 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle>Smart Follow-up Sequences</CardTitle>
                  <CardDescription>Never let prospects fall through the cracks</CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div
                    className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950 dark:to-pink-950 p-4 rounded-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="text-sm">Automated, personalized follow-ups that adapt based on customer engagement. Users report 78% higher response rates.</p>
                    <div className="mt-3 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium">Available only in Pro plan</span>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="my-4 p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-md border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 flex items-start">
              <Clock className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                <span className="font-bold">Limited time offer:</span> Sign up today to lock in 50% off the Pro plan forever. Only {Math.floor(countdown / 60)} minutes left!
              </span>
            </p>
          </div>

          <p className="text-sm text-muted-foreground mb-3">
            Join 5,000+ businesses already using ZaplloCRM to boost their sales process
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeatureDialog(false)}>
              Maybe later
            </Button>
            <Link href="/signup" className="block w-full sm:w-auto">
              <Button className="w-full relative group overflow-hidden">
                <span className="relative z-10 flex items-center">
                  Get 50% Off Pro Plan
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
                <motion.span
                  className="absolute inset-0 bg-white dark:bg-black mix-blend-overlay opacity-0"
                  animate={{
                    opacity: [0, 0.1, 0],
                    left: ['-100%', '100%', '100%']
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                    repeatDelay: 1
                  }}
                />
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.header>
  )
}
