import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
    label?: string; // Optional floating label text
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, ...props }, ref) => {
        return (
            <div className="relative w-full">
                {/* Floating Label */}
                {label && (
                    <label
                        className="absolute left-3 -mt-4 top-2 text-xs text-gray-400 bg-background px-1 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-gray-400"
                    >
                        {label}
                    </label>
                )}
                
                {/* Input Field */}
                <input
                    type={type}
                    ref={ref}
                    className={cn(
                        "peer flex h-9   w-full rounded-md border bg-transparent px-3 py-2 text-white shadow-sm transition-all placeholder-transparent  focus:border-[#815bf5] focus:outline-none",
                        className
                    )}
                    placeholder={label} // Placeholder needed for peer styles
                    {...props}
                />
            </div>
        );
    }
);

Input.displayName = "Input";

export { Input };
