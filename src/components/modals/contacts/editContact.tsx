"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarIcon, CheckIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import ReactCountryFlag from "react-country-flag";
import { countries } from "countries-list";


interface Company {
  _id: string;
  companyName: string;
}

interface CustomFieldDef {
  _id: string;
  name: string;
  fieldType: "Text" | "Number" | "Date" | "Dropdown";
  mandatory: boolean;
  options?: string[];
}

interface IContact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  whatsappNumber: string;
  company?: {
    _id: string;
    companyName: string;
  };
  country: string;
  city?: string;
  state?: string;
  pincode?: string;
  address?: string;
  dateOfBirth?: string;
  dateOfAnniversary?: string;
  tags?: Array<{
    _id: string;
    name: string;
    color: string;
  }>;
  customFieldValues?: Array<{
    definition: {
      _id: string;
      name: string;
      fieldType: string;
    };
    value: any;
  }>;
}

interface EditContactProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  contact: IContact | null;
  onContactUpdated?: () => void;
}

export default function EditContact({
  isOpen,
  setIsOpen,
  contact,
  onContactUpdated,
}: EditContactProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDef[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Basic contact fields
  const [companyId, setCompanyId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("India");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [anniversaryDate, setAnniversaryDate] = useState<Date | undefined>(undefined);

  const [fieldValues, setFieldValues] = useState<{ [key: string]: any }>({});

  // Inside the component before return()
  // Convert countries-list object to array for select dropdown
  const countryOptions = Object.entries(countries).map(([code, country]) => ({
    code,
    name: country.name,
  })).sort((a, b) => a.name.localeCompare(b.name));

  // Get country code from name function (used in the dropdown to display flags)
  const getCountryCodeFromName = (name: string) => {
    const entry = Object.entries(countries).find(
      ([_, country]) => country.name === name
    );
    return entry ? entry[0] : "";
  };

  // On opening the modal, fetch companies + customFields and set initial values
  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
      fetchCustomFields();
      if (contact) {
        setCompanyId(contact.company?._id || "");
        setFirstName(contact.firstName || "");
        setLastName(contact.lastName || "");
        setEmail(contact.email || "");
        setCountry(contact.country || "India");
        setWhatsappNumber(contact.whatsappNumber || "");
        setState(contact.state || "");
        setCity(contact.city || "");
        setPincode(contact.pincode || "");
        setAddress(contact.address || "");

        // Set dates if they exist
        if (contact.dateOfBirth) {
          setBirthDate(new Date(contact.dateOfBirth));
        }
        if (contact.dateOfAnniversary) {
          setAnniversaryDate(new Date(contact.dateOfAnniversary));
        }

        // Set custom field values
        const initialFieldValues: { [key: string]: any } = {};
        contact.customFieldValues?.forEach((cf) => {
          initialFieldValues[cf.definition._id] = cf.value;
        });
        setFieldValues(initialFieldValues);
      }
    }
  }, [isOpen, contact]);

  async function fetchCompanies() {
    try {
      const response = await axios.get<Company[]>("/api/companies");
      setCompanies(response.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  }

  async function fetchCustomFields() {
    try {
      const response = await axios.get<CustomFieldDef[]>("/api/contact-custom-fields");
      setCustomFields(response.data);
    } catch (error) {
      console.error("Error fetching custom fields:", error);
    }
  }

  const handleFieldChange = (defId: string, val: any) => {
    setFieldValues((prev) => ({ ...prev, [defId]: val }));
  };

  async function handleUpdate() {
    if (!contact?._id) return;
    setIsSubmitting(true);

    try {
      // Format custom field values
      const customFieldValues = Object.entries(fieldValues).map(([definitionId, value]) => ({
        definition: definitionId,
        value,
      }));

      // Format dates
      let dateOfBirth = null;
      let dateOfAnniversary = null;

      if (birthDate) {
        dateOfBirth = format(birthDate, 'yyyy-MM-dd');
      }

      if (anniversaryDate) {
        dateOfAnniversary = format(anniversaryDate, 'yyyy-MM-dd');
      }

      const updates = {
        company: companyId,
        firstName,
        lastName,
        email,
        country,
        whatsappNumber,
        state,
        city,
        pincode,
        address,
        dateOfBirth,
        dateOfAnniversary,
        customFieldValues,
      };

      await axios.patch(`/api/contacts/${contact._id}`, { updates });

      if (onContactUpdated) onContactUpdated();
      setIsOpen(false);

      toast({
        title: "Contact updated",
        description: "The contact has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating contact:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the contact.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden z-[100]">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-semibold">Edit Contact</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <div className="px-6">
            <TabsList className="grid bg-accent gap-2  w-full grid-cols-2 mb-4">
              <TabsTrigger className="border-none" value="basic">Basic Info</TabsTrigger>
              <TabsTrigger className="border-none" value="additional">Additional Info</TabsTrigger>
            </TabsList>
          </div>

          <div className="px-6 overflow-y-auto max-h-[60vh]">
            <TabsContent value="basic" className="space-y-4 mt-0">
              {/* Company Selection */}
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Select value={companyId} onValueChange={setCompanyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] z-[100]">
                    {companies.length > 0 ? (
                      companies.map((company) => (
                        <SelectItem className='hover:bg-accent' key={company._id} value={company._id}>
                          {company.companyName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-companies" disabled>
                        No companies found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+91 "
                />
              </div>

              {/* Important Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !birthDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {birthDate ? format(birthDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={birthDate}
                        onSelect={setBirthDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Anniversary</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !anniversaryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {anniversaryDate ? format(anniversaryDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={anniversaryDate}
                        onSelect={setAnniversaryDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="additional" className="space-y-4 mt-0">
              {/* Address Information */}
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Country">
                      {country && (
                        <div className="flex items-center">
                          <ReactCountryFlag
                            countryCode={getCountryCodeFromName(country)}
                            svg
                            style={{
                              width: '1.2em',
                              height: '1.2em',
                              marginRight: '0.7em',
                            }}
                          />
                          {country}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] z-[100]">
                    {countryOptions.map((country) => (
                      <SelectItem className='hover:bg-accent' key={country.code} value={country.name}>
                        <div className="flex items-center">
                          <ReactCountryFlag
                            countryCode={country.code}
                            svg
                            style={{
                              width: '1.2em',
                              height: '1.2em',
                              marginRight: '0.7em',
                            }}
                          />
                          {country.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Pincode"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full address"
                />
              </div>

              {/* Custom Fields */}
              {customFields.length > 0 && (
                <div className="space-y-4 mt-6">
                  <div className="text-sm font-medium">Custom Fields</div>

                  {customFields.map((field) => {
                    const value = fieldValues[field._id] || '';

                    return (
                      <div key={field._id} className="space-y-2">
                        <Label>
                          {field.name}
                          {field.mandatory && <span className="text-red-500 ml-1">*</span>}
                        </Label>

                        {field.fieldType === "Text" && (
                          <Input
                            value={value}
                            onChange={(e) => handleFieldChange(field._id, e.target.value)}
                            placeholder={field.name}
                            required={field.mandatory}
                          />
                        )}

                        {field.fieldType === "Number" && (
                          <Input
                            type="number"
                            value={value}
                            onChange={(e) => handleFieldChange(field._id, e.target.value)}
                            placeholder={field.name}
                            required={field.mandatory}
                          />
                        )}

                        {field.fieldType === "Date" && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {value ? format(new Date(value), "PPP") : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={value ? new Date(value) : undefined}
                                onSelect={(date) => handleFieldChange(field._id, date ? format(date, 'yyyy-MM-dd') : '')}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        )}

                        {field.fieldType === "Dropdown" && field.options && (
                          <Select value={value} onValueChange={(val) => handleFieldChange(field._id, val)}>
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${field.name}`} />
                            </SelectTrigger>
                            <SelectContent className="z-[100]">
                              {field.options.map((option) => (
                                <SelectItem className="hover:bg-accent" key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="px-6 py-4 bg-muted/20">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isSubmitting}
            className="gap-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4" />
                Update Contact
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}