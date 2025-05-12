import { Metadata } from "next";
import SupportAgentDemo from "@/components/agents/SupportAgentDemo";

export const metadata: Metadata = {
  title: "Zapllo AI Support Agent | 24/7 Customer Service Automation",
  description: "Deliver exceptional customer support around the clock with our AI support agent that resolves issues, answers questions, and escalates complex cases when needed."
};

export default function SupportAgentPage() {
  return <SupportAgentDemo />;
}
