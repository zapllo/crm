"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Megaphone, ExternalLink, Bell, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Announcement {
  id: string;
  title: string;
  description: string;
  type: "info" | "warning" | "success" | "promo";
  ctaText?: string;
  ctaLink?: string;
  expiresAt?: string;
  dismissible: boolean;
  variant?: "default" | "highlight" | "subtle";
}

const DynamicAnnouncement = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasNewAnnouncement, setHasNewAnnouncement] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);


  // Default fallback announcement about the new Quotations product
  const defaultAnnouncement: Announcement = {
    id: "quotations-launch",
    title: "New: Quotations is here!",
    description: "Create and manage professional quotes for your customers with our new Quotations feature.",
    type: "promo",
    ctaText: "Try it now",
    ctaLink: "/quotations/create",
    dismissible: true,
    variant: "highlight"
  };

  useEffect(() => {
      // Check if announcement was dismissed in this session
      const isDismissed = sessionStorage.getItem('announcement-dismissed') === 'true';
      if (isDismissed) {
        setIsVisible(false);
        return;
      }
    const fetchAnnouncements = async () => {
      try {
        // Try to fetch announcements from API
        const response = await fetch('/api/announcements');
        
        if (response.ok) {
          const data = await response.json();
          
          // Filter out expired announcements
          const activeAnnouncements = data.filter((announcement: Announcement) => {
            if (!announcement.expiresAt) return true;
            return new Date(announcement.expiresAt) > new Date();
          });
          
          if (activeAnnouncements.length > 0) {
            setAnnouncements(activeAnnouncements);
            
            // Check if there's a new announcement the user hasn't seen
            const lastSeen = localStorage.getItem('last-announcement-seen');
            const hasNew = activeAnnouncements.some(
              (a: Announcement) => !lastSeen || a.id > lastSeen
            );
            setHasNewAnnouncement(hasNew);
          } else {
            // Use default announcement if no active announcements
            setAnnouncements([defaultAnnouncement]);
          }
        } else {
          // Use default announcement if API call fails
          setAnnouncements([defaultAnnouncement]);
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
        setAnnouncements([defaultAnnouncement]);
      }
    };

    fetchAnnouncements();

    // Check for expanded state preference (only for this session)
    // Note: We're not checking localStorage here to ensure it reappears on refresh
    
    // Set default to expanded to show announcement initially
    setIsExpanded(true);
    setHasNewAnnouncement(true);

    // Rotate through multiple announcements every 7 seconds when expanded
    const rotationInterval = setInterval(() => {
      if (announcements.length > 1 && isExpanded) {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
      }
    }, 7000);

    return () => clearInterval(rotationInterval);
  }, [announcements.length, isExpanded]);

  const dismissAnnouncement = () => {
    setIsVisible(false);
    // Store dismissal in sessionStorage to remember for this session
    sessionStorage.setItem('announcement-dismissed', 'true');
    
    // Mark as seen for this session
    setHasNewAnnouncement(false);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    
    // Mark as seen when expanding (for this session only)
    if (!isExpanded) {
      setHasNewAnnouncement(false);
    }
  };

  const nextAnnouncement = () => {
    if (announcements.length > 1) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }
  };

  const prevAnnouncement = () => {
    if (announcements.length > 1) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + announcements.length) % announcements.length);
    }
  };

  if (!isVisible || announcements.length === 0) return null;

  const currentAnnouncement = announcements[currentIndex];

  // Get theme based on type
  const getTheme = () => {
    switch (currentAnnouncement.type) {
      case "info":
        return "bg-blue-500 border-blue-600 dark:bg-blue-700 dark:border-blue-800";
      case "warning":
        return "bg-amber-500 border-amber-600 dark:bg-amber-700 dark:border-amber-800";
      case "success":
        return "bg-emerald-500 border-emerald-600 dark:bg-emerald-700 dark:border-emerald-800";
      case "promo":
        return "bg-indigo-500 border-indigo-600 dark:bg-indigo-700 dark:border-indigo-800";
      default:
        return "bg-blue-500 border-blue-600 dark:bg-blue-700 dark:border-blue-800";
    }
  };

  // Get icon based on type
  const getIcon = () => {
    switch (currentAnnouncement.type) {
      case "info":
        return <Bell className="h-4 w-4" />;
      case "warning":
        return <Megaphone className="h-4 w-4" />;
      case "success":
        return <Bell className="h-4 w-4" />;
      case "promo":
        return <FileText className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2`}
    >
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`${getTheme()} text-white rounded-lg shadow-lg overflow-hidden max-w-sm w-full border`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 rounded-full">
                    {getIcon()}
                  </div>
                  <h3 className="font-medium">{currentAnnouncement.title}</h3>
                </div>
                
                {currentAnnouncement.dismissible && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 -mr-1 -mt-1 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                    onClick={dismissAnnouncement}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              
              <p className="text-sm text-white/90 mb-3">{currentAnnouncement.description}</p>
              
              <div className="flex items-center justify-between">
                {currentAnnouncement.ctaText && currentAnnouncement.ctaLink && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 text-xs bg-white/20 hover:bg-white/30 text-white border-none"
                    onClick={() => router.push(currentAnnouncement.ctaLink!)}
                  >
                    {currentAnnouncement.ctaText}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                )}
                
                {announcements.length > 1 && (
                  <div className="flex items-center ml-auto gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 w-7 p-0 rounded-full bg-white/10 hover:bg-white/20"
                      onClick={prevAnnouncement}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs">
                      {currentIndex + 1}/{announcements.length}
                    </span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 w-7 p-0 rounded-full bg-white/10 hover:bg-white/20"
                      onClick={nextAnnouncement}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleExpanded}
              className={`${getTheme()} text-white p-3 rounded-full shadow-lg relative`}
            >
              {getIcon()}
              {hasNewAnnouncement && !isExpanded && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white" />
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{isExpanded ? "Minimize announcements" : "View announcements"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
};

export default DynamicAnnouncement;