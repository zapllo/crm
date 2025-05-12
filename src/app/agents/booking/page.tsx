import { Metadata } from "next";
import BookingAgentDemo from "@/components/agents/BookingAgentDemo";

export const metadata: Metadata = {
  title: "Zapllo AI Booking Agent | Automate Your Appointment Scheduling",
  description: "Streamline your booking process with our AI booking agent that handles appointment scheduling, confirmations, and reminders without human intervention."
};

export default function BookingAgentPage() {
  return <BookingAgentDemo />;
}
