import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PricingBreakdownProps {
  basePrice: number;
  gstAmount: number;
  discountAmount: number;
  totalPrice: number;
  userCount: number;
}

export default function PricingBreakdown({
  basePrice,
  gstAmount,
  discountAmount,
  totalPrice,
  userCount,
}: PricingBreakdownProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Pricing Summary</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowDetails(!showDetails)}
          className="h-8 px-2"
        >
          {showDetails ? (
            <ChevronUp className="h-4 w-4 mr-1" />
          ) : (
            <ChevronDown className="h-4 w-4 mr-1" />
          )}
          {showDetails ? "Hide" : "Show"} details
        </Button>
      </div>
      
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="flex justify-between py-1 text-sm">
              <span className="text-muted-foreground">Base price ({userCount} users)</span>
              <span>₹{basePrice.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between py-1 text-sm">
              <span className="text-muted-foreground">GST (18%)</span>
              <span>₹{gstAmount.toLocaleString('en-IN')}</span>
            </div>
            
            {discountAmount > 0 && (
              <div className="flex justify-between py-1 text-sm text-green-600 dark:text-green-400">
                <span>Bulk discount (10%)</span>
                <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            
            <Separator className="my-2" />
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex justify-between pt-2 font-bold">
        <span>Total</span>
        <span className="text-xl">₹{totalPrice.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
}