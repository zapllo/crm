"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Device } from "twilio-client";
import {
  PhoneCall, PhoneOff, MicOff, Mic, Volume2,
  AlertCircle, Clock, Plus
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type PhoneDialerProps = {
  contactId: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  leadId?: string;
  onCallComplete?: (callData: any) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export default function PhoneDialer({
  contactId,
  contactName,
  contactPhone,
  contactEmail,
  leadId,
  onCallComplete,
  isOpen,
  setIsOpen
}: PhoneDialerProps) {
  const { toast } = useToast();

  let phoneNumber = contactPhone;
  if (!phoneNumber.startsWith("+")) {
    phoneNumber = "+91" + phoneNumber;
  }
  // Basic UI states
  const [status, setStatus] = useState<"idle" | "connecting" | "in-progress" | "completed" | "failed">("idle");
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [connection, setConnection] = useState<any>(null);
  const [device, setDevice] = useState<Device | null>(null);

  // Others
  const [callId, setCallId] = useState("");
  const [callRecording, setCallRecording] = useState<string | null>(null);
  const [callTranscript, setCallTranscript] = useState<string | null>(null);
  const [callCost, setCallCost] = useState<number>(0);

  // Notes
  const [showNotes, setShowNotes] = useState(false);
  const [callNotes, setCallNotes] = useState("");

  // Wallet
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLowBalance, setIsLowBalance] = useState(false);

  // Timer references
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const costIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ─────────────────────────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      fetchWalletBalance();
      setupTwilioDevice();
      resetStates();
    } else {
      // Clean up if we closed
      teardownTwilio();
    }
  }, [isOpen]);

  function resetStates() {
    setStatus("idle");
    setCallDuration(0);
    setIsMuted(false);
    setIsCallEnded(false);
    setConnection(null);
    setCallId("");
    setCallCost(0);
    setCallRecording(null);
    setCallTranscript(null);
    setCallNotes("");
  }

  async function fetchWalletBalance() {
    try {
      const response = await axios.get("/api/wallet/balance");
      setWalletBalance(response.data.balance);
      if (response.data.balance < 100) {
        setIsLowBalance(true);
      }
    } catch (err) {
      console.error("Error fetching wallet balance:", err);
    }
  }

  async function setupTwilioDevice() {
    try {
      const { data } = await axios.post("/api/calls/token");
      const token = data.token;
      if (!token) throw new Error("No Twilio token returned");

      const newDevice = new Device(token);

      newDevice.on("ready", () => {
        console.log("Twilio Device Ready");
      });

      newDevice.on("error", (err: any) => {
        console.error("Twilio Device Error:", err);
        setStatus("failed");
        toast({
          title: "Twilio Error",
          description: err.message || "An error occurred with the device",
          variant: "destructive"
        });
      });

      setDevice(newDevice);
    } catch (error) {
      console.error("Error setting up Twilio device:", error);
      toast({
        title: "Setup Error",
        description: "Could not initialize the calling system",
        variant: "destructive"
      });
    }
  }

  function teardownTwilio() {
    if (device) {
      device.destroy();
      setDevice(null);
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    if (costIntervalRef.current) {
      clearInterval(costIntervalRef.current);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Start Call
  // ─────────────────────────────────────────────────────────────
  async function startCall() {
    // Check wallet
    if (walletBalance < 50) {
      setIsLowBalance(true);
      return;
    }
    if (!device) {
      toast({
        title: "Device Error",
        description: "Twilio device not ready yet.",
        variant: "destructive"
      });
      return;
    }

    setStatus("connecting");

    try {
      // (1) Create the call record in your DB.
      const resp = await axios.post("/api/calls/create", {
        contactId,
        leadId,
        phoneNumber,
        direction: "outbound"
      });
      const createdCall = resp.data.call;
      setCallId(createdCall._id);

      // (2) Connect from Twilio Device to your TwiML, passing the same callId and the phone number we want to dial
      const conn = device.connect({
        callId: createdCall._id,
        To: phoneNumber
      });

      // Event: accept
      conn.on("accept", () => {
        setStatus("in-progress");
        // Start local duration timer
        durationIntervalRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
        // Start cost example (₹1/min)
        costIntervalRef.current = setInterval(() => {
          const costPerSecond = 1 / 60; // ₹1 per minute
          setCallCost(prev => prev + costPerSecond);
        }, 1000);
      });

      // Event: disconnect
      conn.on("disconnect", () => {
        handleCallEnd();
      });

      setConnection(conn);
    } catch (err) {
      console.error("Error making call:", err);
      setStatus("failed");
      toast({
        title: "Call Failed",
        description: "Unable to connect the call. Please try again.",
        variant: "destructive"
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // End Call
  // ─────────────────────────────────────────────────────────────
  function endCall() {
    if (connection) {
      connection.disconnect();
    }
  }

  async function handleCallEnd() {
    // Stop timers
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    if (costIntervalRef.current) clearInterval(costIntervalRef.current);

    setStatus("completed");
    setIsCallEnded(true);

    // Optionally, let server know final duration
    try {
      const resp = await axios.put(`/api/calls/${callId}/update`, {
        status: "completed",
        duration: callDuration
      });
      const updatedCall = resp.data;

      if (updatedCall.recordingUrl) setCallRecording(updatedCall.recordingUrl);
      if (updatedCall.transcription) setCallTranscript(updatedCall.transcription);

      // If parent wants to handle completion
      if (onCallComplete) onCallComplete(updatedCall);

    } catch (err) {
      console.error("Error updating call record:", err);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Mute
  // ─────────────────────────────────────────────────────────────
  function toggleMute() {
    if (connection) {
      connection.mute(!isMuted);
      setIsMuted(!isMuted);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────
  function formatDuration(sec: number): string {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }

  // ─────────────────────────────────────────────────────────────
  // Save Call Notes
  // ─────────────────────────────────────────────────────────────
  async function saveCallNotes() {
    if (!callNotes.trim()) return;
    try {
      await axios.put(`/api/calls/${callId}/notes`, { notes: callNotes });
      toast({
        title: "Notes Saved",
        description: "Your call notes have been saved."
      });
      setShowNotes(false);
    } catch (err) {
      console.error("Error saving call notes:", err);
      toast({
        title: "Error",
        description: "Failed to save call notes",
        variant: "destructive"
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Close Dialog
  // ─────────────────────────────────────────────────────────────
  function handleCloseDialog() {
    if (status === "in-progress") {
      // If you want a confirm, do it here
    }
    teardownTwilio();
    setIsOpen(false);
  }

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md z-[100]">
        <DialogHeader>
          <DialogTitle className="text-center relative">
            {status !== "in-progress" && status !== "connecting" ? (
              "Call Contact"
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-lg font-semibold">{contactName}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "mt-1 animate-pulse",
                    status === "connecting" ? "text-amber-500" : "text-green-500"
                  )}
                >
                  {status === "connecting"
                    ? "Connecting..."
                    : `Call in progress · ${formatDuration(callDuration)}`}
                </Badge>
              </div>
            )}

          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-4 space-y-4">
          {status !== "completed" && (
            <Avatar className="h-24 w-24 border-2 border-primary/20">
              <AvatarFallback className="text-3xl bg-primary/10">
                {getInitials(contactName)}
              </AvatarFallback>
            </Avatar>
          )}

          {status === "idle" && (
            <div className="text-center">
              <p className="text-xl font-semibold mb-1">{contactName}</p>
              <p className="text-muted-foreground">{contactPhone}</p>
              {contactEmail && (
                <p className="text-muted-foreground text-sm">
                  {contactEmail}
                </p>
              )}
            </div>
          )}

          {status === "connecting" && (
            <div className="w-full">
              <p className="text-center text-muted-foreground mb-4">
                Establishing secure connection...
              </p>
              <Progress value={45} className="h-1.5 w-full" />
            </div>
          )}

          {status === "failed" && (
            <div className="text-center space-y-2">
              <div className="rounded-full bg-red-100 p-3 inline-flex dark:bg-red-900">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-lg font-medium">Call Failed</p>
              <p className="text-muted-foreground text-sm max-w-xs">
                We couldn't connect your call. Please try again later.
              </p>
            </div>
          )}

          {status === "completed" && !isCallEnded && (
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">Call Ended</p>
              <p className="text-muted-foreground">
                Duration: {formatDuration(callDuration)}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Call cost: ₹{callCost.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {status === "completed" && isCallEnded && (
            <div className="w-full space-y-6">
              <div className="text-center space-y-2">
                <div className="rounded-full bg-green-100 p-3 inline-flex dark:bg-green-900">
                  <PhoneCall className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-lg font-medium">Call Complete</p>
                  <p className="text-muted-foreground">
                    You spoke with {contactName} for {formatDuration(callDuration)}
                  </p>
                </div>
              </div>

              <Card className="w-full">
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Call Summary</span>
                    <Badge variant="outline" className="text-xs">
                      ₹{callCost.toFixed(2)}
                    </Badge>
                  </div>

                  {callRecording && (
                    <div className="bg-muted p-3 rounded-md">
                      <div className="text-xs font-medium mb-1 text-muted-foreground">Recording</div>
                      <audio controls className="w-full h-10">
                        <source src={callRecording} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}

                  {callTranscript && (
                    <div className="bg-muted p-3 rounded-md max-h-32 overflow-y-auto">
                      <div className="text-xs font-medium mb-1 text-muted-foreground">Transcript</div>
                      <p className="text-sm">{callTranscript}</p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowNotes(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Call Notes
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Controls if in progress */}
        {status === "in-progress" && (
          <div className="flex justify-center space-x-4 py-4">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full bg-muted"
              onClick={toggleMute}
            >
              {isMuted ? <MicOff className="h-5 w-5 text-red-500" /> : <Mic className="h-5 w-5" />}
            </Button>

            <Button
              variant="destructive"
              size="icon"
              className="h-14 w-14 rounded-full"
              onClick={endCall}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full bg-muted"
            >
              <Volume2 className="h-5 w-5" />
            </Button>
          </div>
        )}

        <div className="gap-2">
          {status === "idle" && (
            <>
            <div className='flex justify-center gap-2'>
              <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={startCall} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                <PhoneCall className="h-4 w-4" />
                Call Now
              </Button>
              </div>
            </>
          )}
          {(status === "failed" || status === "completed") && (
            <Button onClick={handleCloseDialog}>Close</Button>
          )}
        </div>
      </DialogContent>

      {/* Low Balance Alert */}
      <AlertDialog open={isLowBalance} onOpenChange={setIsLowBalance}>
        <AlertDialogContent className="z-[100]">
          <div className="p-4 space-y-4">
            <h2 className="font-semibold text-lg">Low Balance Alert</h2>
            <p className="text-sm">
              Your calling balance is low (₹{(walletBalance / 100).toFixed(2)}).
              Please top up soon for uninterrupted service.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsLowBalance(false)}>
                Later
              </Button>
              <Button
                onClick={() => {
                  setIsLowBalance(false);
                  window.location.href = "/settings/wallet";
                }}
              >
                Add Credits
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Notes Dialog */}
      <Dialog open={showNotes} onOpenChange={setShowNotes}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Call Notes</DialogTitle>
            <DialogDescription>Add notes about your call with {contactName}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="What did you discuss in this call?"
              className="min-h-32"
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotes(false)}>
              Cancel
            </Button>
            <Button onClick={saveCallNotes}>
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
