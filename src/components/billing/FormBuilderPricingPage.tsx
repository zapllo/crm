import React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, FileText, Sparkles, Award, Zap, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FormBuilderPricingPage = () => {
  const router = useRouter();

  const handlePurchase = (plan: string) => {
    router.push(`/settings/billing?product=formBuilder&plan=${plan}`);
  };

  const plans = [
    {
      name: "Starter",
      price: "₹2,499",
      period: "per year",
      description: "Perfect for small businesses getting started",
      features: [
        "10 live forms",
        "1,000 submissions per month",
        "File uploads",
        "Email notifications",
        "Form analytics",
        "Export responses to CSV",
        "Custom thank you pages",
        "Basic form customization"
      ],
      highlighted: false,
      icon: <FileText className="h-6 w-6 text-blue-500" />,
      color: "blue",
      planId: "starter"
    },
    {
      name: "Growth",
      price: "₹4,999",
      period: "per year",
      description: "For growing businesses with more form needs",
      features: [
        "30 live forms",
        "10,000 submissions per month",
        "Advanced form logic",
        "Conditional fields",
        "Custom branding",
        "Multi-page forms",
        "Webhooks integration",
        "Lead generation tools"
      ],
      highlighted: true,
      icon: <Zap className="h-6 w-6 text-purple-500" />,
      color: "purple",
      planId: "growth"
    },
    {
      name: "Pro",
      price: "₹9,999",
      period: "per year",
      description: "Complete toolkit for professional form management",
      features: [
        "Unlimited forms",
        "50,000 submissions per month",
        "Advanced analytics",
        "Priority support",
        "E-signature collection",
        "Custom workflows",
        "API access",
        "Custom form templates"
      ],
      highlighted: false,
      icon: <Award className="h-6 w-6 text-amber-500" />,
      color: "amber",
      planId: "pro"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "Tailored solutions for large organizations",
      features: [
        "Unlimited forms & submissions",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantees",
        "Custom security requirements",
        "Bulk operations",
        "User management & roles",
        "On-premise deployment options"
      ],
      highlighted: false,
      icon: <Building className="h-6 w-6 text-slate-700" />,
      color: "slate",
      planId: "enterprise",
      contactSales: true
    }
  ];

  return (
    <div   style={{
      maxHeight: 'calc(100vh - 16px)', // Adjust based on your layout
      scrollBehavior: 'auto' // Prevent smooth scrolling which can interfere
  }} className="bg-gradient-to-b from-background h-full overflow-y-scroll scrollbar-hide  to-muted py-12">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            Form Builder
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Create powerful forms for your business
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose the right plan for your form building needs, from simple contact forms to complex multi-page surveys
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`border-2 ${
                plan.highlighted
                  ? `border-${plan.color}-500/30 shadow-lg shadow-${plan.color}-500/10`
                  : 'border-border'
              } overflow-hidden`}
            >
              <CardHeader className={`pb-8 ${plan.highlighted ? `bg-${plan.color}-50 dark:bg-${plan.color}-950/10` : ''}`}>
                <div className="mb-2 flex items-center justify-between">
                  <div className={`p-2 rounded-lg bg-${plan.color}-100 dark:bg-${plan.color}-900/20`}>
                    {plan.icon}
                  </div>
                  {plan.highlighted && (
                    <Badge className={`bg-${plan.color}-500 hover:bg-${plan.color}-600`}>
                      Most Popular
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground ml-1.5">{plan.period}</span>}
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle2 className={`h-5 w-5 text-${plan.color}-500 mr-2 flex-shrink-0`} />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? `bg-${plan.color}-500 hover:bg-${plan.color}-600 text-white`
                      : plan.contactSales
                        ? 'bg-slate-800 hover:bg-slate-900 text-white'
                        : ''
                  }`}
                  onClick={() => plan.contactSales
                    ? router.push('/contact-sales')
                    : handlePurchase(plan.planId)
                  }
                >
                  {plan.contactSales ? 'Contact Sales' : 'Subscribe Now'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-accent/50 mb-12 rounded-lg p-6">
          <div className="flex flex-col mb-12 md:flex-row items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Need a custom solution?</h3>
              <p className="text-muted-foreground">Get in touch with our sales team for a tailored quote.</p>
            </div>
            <Button
              variant="outline"
              className="mt-4 md:mt-0"
              onClick={() => router.push('/contact-sales')}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilderPricingPage;
