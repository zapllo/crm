"use client";
import {
  useMotionValueEvent,
  useScroll,
  useTransform,
  motion,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { FaSyncAlt, FaPhone, FaComment, FaStickyNote, FaClock } from "react-icons/fa";

interface TimelineEntry {
  type: "stage" | "followup" | "note";
  stage?: string;
  action: string;
  remark: string;
  timestamp: string; // ISO string
  followupType?: string;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  // Map event type to icons
  const getIconForType = (type: string, followupType?: string) => {
    if (type === "stage") return <FaSyncAlt className="text-primary text-xl" />;
    if (type === "followup") return followupType === "call" ? <FaPhone className="text-green-500 text-xl" /> : <FaComment className="text-blue-500 text-xl" />;
    if (type === "note") return <FaStickyNote className="text-yellow-500 text-xl" />;
    return <FaClock className="text-gray-400 text-xl" />;
  };

  return (
    <div className="w-full bg-card font-sans md:px-10" ref={containerRef}>
      <div className="max-w-7xl mx-auto py-10 px-4 md:px-8 lg:px-10">
        <h2 className="text-lg md:text-4xl mb-4 text-primary max-w-4xl">
          Lead Activity Timeline
        </h2>
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div key={index} className="flex justify-start pt-6 md:pt-12 md:gap-6">
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-background flex items-center justify-center">
                {getIconForType(item.type, item.followupType)}
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-2xl font-semibold text-muted-foreground">
                {new Date(item.timestamp).toLocaleString()}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full bg-muted p-4 rounded-md shadow-sm border">
              <h3 className="md:hidden block text-sm font-semibold text-muted-foreground">
                {new Date(item.timestamp).toLocaleString()}
              </h3>
              <p className="font-medium text-sm">{item.action}</p>
              <p className="text-xs text-muted-foreground">{item.remark || "No remarks"}</p>
            </div>
          </div>
        ))}

        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-gradient-to-b from-transparent via-muted to-transparent"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-[#815bf5] via-[#5f31e9] to-transparent rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
