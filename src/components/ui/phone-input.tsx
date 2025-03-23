"use client";

import * as React from "react";
import { Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

// Simplified country list
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

export type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function PhoneInput({ value, onChange, className }: PhoneInputProps) {
  const [open, setOpen] = React.useState(false);
  const [countryCode, setCountryCode] = React.useState("+91"); // Default to India
  const [phoneNumber, setPhoneNumber] = React.useState("");

  // Initialize from existing value
  React.useEffect(() => {
    if (value) {
      const match = value.match(/^(\+\d+)(.*)$/);
      if (match) {
        setCountryCode(match[1]);
        setPhoneNumber(match[2]);
      } else {
        setPhoneNumber(value);
      }
    }
  }, []);

  // Update the combined value when either part changes
  const updateCombinedValue = React.useCallback((code: string, number: string) => {
    onChange(`${code}${number}`);
  }, [onChange]);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value;
    setPhoneNumber(newNumber);
    updateCombinedValue(countryCode, newNumber);
  };

  const handleCountryCodeChange = (code: string) => {
    setCountryCode(code);
    updateCombinedValue(code, phoneNumber);
    setOpen(false);
  };

  return (
    <div className="flex">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="rounded-r-none px-3 bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-normal"
          >
            {countryCode}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 bg-zinc-900 border-zinc-800 w-[250px]">
          <Command className="bg-transparent">
            <CommandInput placeholder="Search country code..." className="focus:ring-0 text-white" />
            <CommandEmpty className="text-zinc-400">No country found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {countries.map((country) => (
                <CommandItem
                  key={country.value}
                  onSelect={() => handleCountryCodeChange(country.dialCode)}
                  className="text-zinc-300 hover:bg-zinc-800 hover:text-white aria-selected:bg-zinc-800 aria-selected:text-white"
                >
                  {country.label} ({country.dialCode})
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="relative flex-1">
        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
        <Input
          type="text"
          placeholder="Phone Number"
          className="rounded-l-none pl-10 bg-zinc-900/50 border-zinc-800 focus-visible:ring-[#815bf5]"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
        />
      </div>
    </div>
  );
}