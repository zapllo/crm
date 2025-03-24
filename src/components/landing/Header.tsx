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
import { Menu, X, ArrowRight, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "Integrations", href: "#integrations" },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

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
      const sections = ["features", "pricing", "testimonials", "integrations"]
      
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

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-200 ${
        isScrolled 
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
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  activeSection === item.href.substring(1)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {item.name}
              </Link>
            ))}
            <Badge className="ml-2 bg-primary/20 text-primary hover:bg-primary/30 whitespace-nowrap">
              <PlusCircle className="h-3 w-3 mr-1" />
              New Features
            </Badge>
          </nav>

          {/* Action Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="group relative overflow-hidden">
                <span className="relative z-10">Start free trial</span>
                <span className="absolute inset-0 bg-primary group-hover:translate-y-full transition-transform duration-300" />
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <ArrowRight className="ml-2 h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Menu className="h-5 w-5" />
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
                  <div className="flex items-center justify-between py-4">
                    <Link href="/" className="flex items-center space-x-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-auto text-primary"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span className="font-bold text-lg">CRM<span className="text-primary">Pro</span></span>
                    </Link>
                  </div>
                  <div className="flex flex-col space-y-1 mt-6">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "px-3 py-2 text-base font-medium rounded-md transition-colors",
                          activeSection === item.href.substring(1)
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                    <Badge className="w-fit mt-2 ml-3 bg-primary/20 text-primary hover:bg-primary/30">
                      <PlusCircle className="h-3 w-3 mr-1" />
                      New Features
                    </Badge>
                  </div>
                  <div className="mt-auto space-y-3 py-6">
                    <Link href="/login" className="block">
                      <Button variant="outline" size="sm" className="w-full">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/signup" className="block">
                      <Button size="sm" className="w-full group relative overflow-hidden">
                        <span className="relative z-10">Start free trial</span>
                        <span className="absolute inset-0 bg-primary group-hover:translate-y-full transition-transform duration-300" />
                        <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <ArrowRight className="ml-2 h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  )
}