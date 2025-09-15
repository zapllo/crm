"use client";
import { useState, useEffect } from "react";
import { useUserContext } from "@/contexts/userContext";
import { formatDistanceToNow } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { X, Crown, Clock } from "lucide-react";

const PremiumTrialBanner = () => {
  const { user } = useUserContext();
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [progressPercentage, setProgressPercentage] = useState(0);

  // Total days for trial
  const TRIAL_DAYS = 7;

  useEffect(() => {
    if (!user?.organization?.trialExpires) {
      return;
    }

    const trialExpiry = new Date(user.organization.trialExpires);

    try {
      const now = new Date();
      setTimeLeft(formatDistanceToNow(trialExpiry, { addSuffix: false }));

      // Calculate days left
      const diffTime = trialExpiry.getTime() - now.getTime();
      const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      setDaysLeft(diffDays);

      // Correct progress calculation: (days used / total days) * 100
      // Days used = TRIAL_DAYS - daysLeft
      const daysUsed = TRIAL_DAYS - diffDays;
      const progress = (daysUsed / TRIAL_DAYS) * 100;
      setProgressPercentage(Math.max(0, Math.min(100, progress)));
    } catch (error) {
      console.error("Error calculating time left:", error);
    }

    // Update every minute
    const timer = setInterval(() => {
      try {
        const now = new Date();
        if (now >= trialExpiry) {
          clearInterval(timer);
          setIsVisible(false);
          return;
        }

        setTimeLeft(formatDistanceToNow(trialExpiry, { addSuffix: false }));

        // Update days left
        const diffTime = trialExpiry.getTime() - now.getTime();
        const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        setDaysLeft(diffDays);

        // Update progress with corrected calculation
        const daysUsed = TRIAL_DAYS - diffDays;
        const progress = (daysUsed / TRIAL_DAYS) * 100;
        setProgressPercentage(Math.max(0, Math.min(100, progress)));
      } catch (error) {
        console.error("Error updating time:", error);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [user?.organization?.trialExpires]);

  if (!isVisible || !user?.organization?.trialExpires) return null;

  // Get days message
  const getDaysMessage = () => {
    if (daysLeft <= 0) return "Trial ends today";
    if (daysLeft === 1) return "1 day left";
    return `${daysLeft} days left`;
  };

  return (
    <div className="bg-gradient-to-r from-primary to-blue-400 dark:from-primary dark:to-blue-900 border border-primary py-2 px-4 w-full flex items-center justify-between text-white text-sm">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 text-white p-1 rounded-md">
          <Crown className="h-4 w-4" />
        </div>
        <div className="font-medium">
          <span className="text-">Your 7-day Premium trial: </span>
          <span className="text- font-bold">{getDaysMessage()}</span>
          <span className="text ml-1 text-xs">(7 days)</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-48 flex items-center gap-3">
          <div className="w-full">
            <Progress
              value={progressPercentage}
              className="h-2 bg-gray-200"
            />
          </div>
          <div className="flex items-center text-xs text-nowrap -indigo-800">
            <Clock className="h-3 w-3 mr-1" />
            {Math.round(progressPercentage)}% used
          </div>
        </div>

        <Button
          size="sm"
          className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white border-none"
          onClick={() => window.location.href = "/settings/billing"}
        >
          <Crown className="h-3 w-3 mr-1" />
          Upgrade Now
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default PremiumTrialBanner;