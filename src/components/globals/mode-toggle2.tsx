"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle2() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex justify-center">
            <div className="grid grid-cols-2  border-gray-700 items-center border  rounded-lg p-1">
                {/* Light Mode Button */}
                <button
                    className={`flex items-center scale-90 w-fit  px-4 py-2  -400  text-sm font-medium rounded-lg transition-all ${theme === "light" ? "bg-white text-black shadow" : "text-gray-500"
                        }`}
                   
                >
                    <Sun className="mr-2 h-4 w-4" />
                    Light 
                </button>

                {/* Dark Mode Button */}
                <button
                    className={`flex items-center border  scale-90 w-fit  px-4 py-2 text-sm font-medium rounded-lg transition-all ${theme === "dark" ? "bg-[#815bf5] text-white shadow" : "text-gray-500"
                        }`}
                    onClick={() => setTheme("dark")}
                >
                    <Moon className="mr-2 h-4 w-4" />
                    Dark 
                </button>
            </div>
        </div>
    );
}
