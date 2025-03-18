import * as React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string; // Optional floating label text
}

/**
 * A Textarea with an optional floating label,
 * mirroring the same logic as your Input component.
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {/* Floating Label */}
        {label && (
          <label
            className={cn(
              "absolute left-3 top-2 -mt-4 bg-[#0b0d29] px-1 text-xs text-gray-400 transition-all",
              // Peer-based classes:
              "peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500",
              "peer-focus:top-2 peer-focus:text-xs peer-focus:text-gray-400"
            )}
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          className={cn(
            "peer block w-full rounded-md border border-gray-600 bg-transparent px-3 py-2 text-white shadow-sm placeholder-transparent",
            " focus:border-[#815bf5] focus:outline-none transition-all",
            "min-h-[60px] resize-none", // or "resize-y" if you want vertical resizing
            className
          )}
          // The placeholder is set to the label text, but hidden via "placeholder-transparent"
          // to enable the "peer-placeholder-shown" styles above.
          placeholder={label}
          {...props}
        />
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
