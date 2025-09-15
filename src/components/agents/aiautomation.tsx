"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  whatsappNumber: z.string().min(10, { message: "Number must be at least 10 digits" }).regex(/^\+?[0-9]+$/, { message: "Please enter a valid phone number" }),
  description: z.string().min(10, { message: "Please tell us more about your needs (min 10 characters)" })
});

export default function AIAutomationForm({ agentType }: { agentType: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      whatsappNumber: "",
      description: ""
    }
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, agentType })
      });
      if (!response.ok) throw new Error("Submission failed");

      toast({
        title: "Demo request received!",
        description: "You'll receive a WhatsApp message, email, and call shortly.",
      });
      form.reset();
    } catch (err) {
      console.error(err);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact our support team directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField name="fullName" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Smith" {...field} className="bg-background" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="email" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Work Email</FormLabel>
              <FormControl>
                <Input placeholder="john@company.com" {...field} className="bg-background" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField name="whatsappNumber" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>WhatsApp Number</FormLabel>
            <FormControl>
              <Input placeholder="+1 (555) 123-4567" {...field} className="bg-background" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField name="description" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>What are you looking to achieve?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Tell us about your sales process and current challenges..."
                rows={4}
                {...field}
                className="resize-none bg-background"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <Button
          type="submit"
          className="w-full mt-6 py-6"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing Your Request...</>
          ) : (
            <>Get Your Personalized Demo <ArrowRight className="w-4 h-4 ml-2" /></>
          )}
        </Button>
      </form>
    </Form>
  );
}
