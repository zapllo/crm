"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Simplified country list for example
const countries = [
  { label: "United States", value: "US", dialCode: "+1" },
  { label: "United Kingdom", value: "GB", dialCode: "+44" },
  { label: "India", value: "IN", dialCode: "+91" },
  { label: "Canada", value: "CA", dialCode: "+1" },
  { label: "Australia", value: "AU", dialCode: "+61" },
  { label: "Germany", value: "DE", dialCode: "+49" },
  { label: "France", value: "FR", dialCode: "+33" },
  { label: "Japan", value: "JP", dialCode: "+81" },
  { label: "China", value: "CN", dialCode: "+86" },
  { label: "Brazil", value: "BR", dialCode: "+55" },
];

export type CountrySelectProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function CountrySelect({ value, onChange, className }: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);
  
  const selectedCountry = countries.find((country) => country.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/70 transition-colors",
            className
          )}
        >
          {selectedCountry ? selectedCountry.label : "Select country..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 bg-zinc-900 border-zinc-800">
        <Command className="bg-transparent">
          <CommandInput placeholder="Search country..." className="focus:ring-0 text-white" />
          <CommandEmpty className="text-zinc-400">No country found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {countries.map((country) => (
              <CommandItem
                key={country.value}
                value={country.label}
                onSelect={() => {
                  onChange(country.value);
                  setOpen(false);
                }}
                className="text-zinc-300 hover:bg-zinc-800 hover:text-white aria-selected:bg-zinc-800 aria-selected:text-white"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === country.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {country.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}