"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, MinusCircle, PlusCircle, Sparkles, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
// import { useSession } from "next-auth/react";
import PricingBreakdown from "@/components/billing/PricingBreakdown";
import FeaturesList from "@/components/billing/FeaturesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Constants for pricing
const CRM_PRICE_PER_USER = 5999; // ₹5,999 per user per year
const QUOTATION_PRICE_PER_USER = 2999; // ₹2,999 per user per year
const GST_RATE = 0.18; // 18% GST

type ProductType = "crm" | "quotation";

interface Product {
  id: ProductType;
  name: string;
  description: string;
  pricePerUser: number;
  icon: React.ReactNode;
  badge?: string;
  features: string[];
}

export default function BillingPage() {
  const [selectedProduct, setSelectedProduct] = useState<ProductType>("crm");
  const [userCount, setUserCount] = useState(5); // Default to 5 users
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
//   const { data: session } = useSession();

  const products: Product[] = [
    {
      id: "crm",
      name: "Zapllo CRM",
      description: "Everything you need to manage and grow your customer relationships",
      pricePerUser: CRM_PRICE_PER_USER,
      icon: <Sparkles className="h-4 w-4 mr-1" />,
      badge: "Most Popular",
      features: [
        "Contact Management",
        "Lead Tracking",
        "Sales Pipeline",
        "Email Integration",
        "Task Management",
        "Reporting & Analytics",
        "Mobile Access",
        "Customer Support"
      ]
    },
    {
      id: "quotation",
      name: "Zapllo Quotations",
      description: "Streamline your quotation process and close deals faster",
      pricePerUser: QUOTATION_PRICE_PER_USER,
      icon: <FileText className="h-4 w-4 mr-1" />,
      badge:"New",
      features: [
        "Customizable Templates",
        "Product Catalog",
        "Automated Calculations",
        "Digital Signatures",
        "PDF Export",
        "Quotation Tracking",
        "Integration with CRM"
      ]
    }
  ];

  const currentProduct = products.find(p => p.id === selectedProduct)!;

  // Calculate pricing
  const basePrice = userCount * currentProduct.pricePerUser;
  const gstAmount = basePrice * GST_RATE;
  const totalPrice = basePrice + gstAmount;

  // Apply early bird discount (10%) if userCount >= 10
  const hasDiscount = userCount >= 10;
  const discountAmount = hasDiscount ? basePrice * 0.1 : 0;
  const finalPrice = totalPrice - discountAmount;

  const handleUserCountChange = (increment: boolean) => {
    if (increment && userCount < 50) {
      setUserCount(userCount + 1);
    } else if (!increment && userCount > 1) {
      setUserCount(userCount - 1);
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Create order
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(finalPrice * 100), // Razorpay expects amount in paise
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          notes: {
            userCount: userCount,
            plan: currentProduct.name,
          },
        }),
      });

      const orderData = await orderResponse.json();
      
      if (!orderData.orderId) {
        throw new Error('Failed to create order');
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(finalPrice * 100),
        currency: 'INR',
        name: 'Zapllo',
        description: `${currentProduct.name} Subscription - ${userCount} Users`,
        order_id: orderData.orderId,
        // prefill: {
        //   name: session.user.name || '',
        //   email: session.user.email || '',
        // },
        handler: function(response: any) {
          handlePaymentSuccess(response, orderData.orderId);
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        },
        theme: {
          color: '#7451F8',
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (response: any, orderId: string) => {
    try {
      const paymentData = {
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
        // userId: session?.user.id,
        amount: finalPrice,
        planName: currentProduct.name,
        subscribedUserCount: userCount,
        deduction: discountAmount,
      };

      const result = await fetch('/api/payment-success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (result.ok) {
        router.push(`/payment-success?userCount=${userCount}&amount=${finalPrice}&product=${selectedProduct}`);
      } else {
        router.push('/payment-failure');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      router.push('/payment-failure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-purple-600 to-orange-500 text-transparent bg-clip-text">
          Power Up Your Business with Zapllo
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect Zapllo solution for your business needs
        </p>
      </div>

      <Tabs 
        defaultValue="crm" 
        value={selectedProduct}
        onValueChange={(value) => setSelectedProduct(value as ProductType)}
        className="mx-auto max-w-4xl mb-8"
      >
        <TabsList className="grid grid-cols-2 h-10 gap-2 bg-accent w-full">
          <TabsTrigger  value="crm" className="text-base border-none ">Zapllo CRM</TabsTrigger>
          <TabsTrigger  value="quotation" className="text-base border-none">Zapllo Quotations</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid md:grid-cols-2 gap-8 mx-auto">
        <Card className="overflow-hidden border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-purple-600/10 to-orange-500/10">
            <div className="flex justify-between items-center">
              <CardTitle>{currentProduct.name}</CardTitle>
              {currentProduct.badge && (
                <Badge className="bg-gradient-to-r from-purple-600 to-orange-500">
                  {currentProduct.icon} {currentProduct.badge}
                </Badge>
              )}
            </div>
            <CardDescription>
              {currentProduct.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-baseline mb-6">
              <span className="text-3xl font-bold">₹{currentProduct.pricePerUser.toLocaleString('en-IN')}</span>
              <span className="text-muted-foreground ml-2">per user / year</span>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Number of Users</span>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => handleUserCountChange(false)}
                    disabled={userCount <= 1}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  
                  <motion.span 
                    key={userCount}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-xl font-bold w-8 text-center"
                  >
                    {userCount}
                  </motion.span>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => handleUserCountChange(true)}
                    disabled={userCount >= 50}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {hasDiscount && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-green-600 dark:text-green-400 font-medium mb-2 flex justify-end"
                >
                  <Sparkles className="h-4 w-4 mr-1" /> 10% bulk discount applied!
                </motion.div>
              )}
            </div>

            <PricingBreakdown 
              basePrice={basePrice} 
              gstAmount={gstAmount} 
              discountAmount={discountAmount} 
              totalPrice={finalPrice}
              userCount={userCount}
            />

            <Button 
              className="w-full mt-6 py-6 text-lg bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? "Processing..." : "Subscribe Now"}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-2">
              Secure payment via Razorpay
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle>What's Included</CardTitle>
              <CardDescription>
                Everything you need with {currentProduct.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {currentProduct.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="mt-6 bg-gradient-to-r from-purple-600/10 to-orange-500/10">
            <CardHeader>
              <CardTitle>Limited Time Offer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Subscribe today and get:
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Free onboarding session </span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>10% discount on 10+ users</span>
                </li>
              
              
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}