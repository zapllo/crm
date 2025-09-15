import { Metadata } from "next";
import LeadQualificationDemo from "@/components/agents/LeadQualificationDemo";

export const metadata: Metadata = {
  title: "Zapllo AI Lead Qualification Agent | Convert More Prospects",
  description: "Automate lead qualification with our AI agent that engages prospects, asks qualifying questions, scores leads, and routes them to the right sales representatives."
};

export default function LeadQualificationPage() {
  return <LeadQualificationDemo />;
}
