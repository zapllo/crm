"use client";

import React, { useState, useEffect } from "react";
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
import { Loader2, CalendarIcon } from "lucide-react";
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
import ReactCountryFlag from "react-country-flag";
import { countries } from "countries-list";

interface Company {
  _id: string;
  companyName: string;
}

interface ContactData {
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  whatsappNumber: string;
  state: string;
  city: string;
  pincode: string;
  address: string;
  dateOfBirth?: string;
  dateOfAnniversary?: string;
}

interface AddContactProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface CustomFieldDef {
  _id: string;
  name: string;
  fieldType: "Text" | "Number" | "Date" | "Dropdown";
  mandatory: boolean;
  options?: string[];
}

const AddContact: React.FC<AddContactProps> = ({ isOpen, setIsOpen }) => {
  // Companies fetched from the DB
  const [companies, setCompanies] = useState<Company[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDef[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Contact form data
  const [contactData, setContactData] = useState<ContactData>({
    companyId: "",
    firstName: "",
    lastName: "",
    email: "",
    country: "India",
    whatsappNumber: "",
    state: "",
    city: "",
    pincode: "",
    address: "",
  });
  const countryOptions = Object.entries(countries).map(([code, country]) => ({
    code,
    name: country.name,
  })).sort((a, b) => a.name.localeCompare(b.name));

  // We store the user's dynamic answers as a dictionary: { [definitionId]: string }
  const [fieldValues, setFieldValues] = useState<{ [key: string]: any }>({});
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [anniversaryDate, setAnniversaryDate] = useState<Date | undefined>(undefined);

  // Fetch companies only when the modal is opened
  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
      fetchCustomFields();
    }
  }, [isOpen]);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get<Company[]>("/api/companies");
      setCompanies(res.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const fetchCustomFields = async () => {
    try {
      const res = await axios.get<CustomFieldDef[]>("/api/contact-custom-fields");
      setCustomFields(res.data);
    } catch (error) {
      console.error("Error fetching custom fields:", error);
    }
  };

  // Handler for dynamic field inputs
  const handleFieldChange = (defId: string, val: any) => {
    setFieldValues((prev) => ({ ...prev, [defId]: val }));
  };

  // Handle input changes
  const handleInputChange = (field: keyof ContactData, value: string) => {
    setContactData(prev => ({ ...prev, [field]: value }));
  };

  // Submit to create contact
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Format dates
      let formattedData = { ...contactData };
      if (birthDate) {
        formattedData.dateOfBirth = format(birthDate, 'yyyy-MM-dd');
      }
      if (anniversaryDate) {
        formattedData.dateOfAnniversary = format(anniversaryDate, 'yyyy-MM-dd');
      }

      // Build the customFieldValues array from fieldValues
      const customFieldValues = Object.entries(fieldValues).map(([definitionId, value]) => ({
        definition: definitionId,
        value,
      }));

      // Merge into our main payload
      const dataToSend = {
        ...formattedData,
        customFieldValues,
      };

      // POST to /api/contacts with the form data
      await axios.post("/api/contacts", dataToSend);

      // Reset form fields
      setContactData({
        companyId: "",
        firstName: "",
        lastName: "",
        email: "",
        country: "India",
        whatsappNumber: "",
        state: "",
        city: "",
        pincode: "",
        address: "",
      });
      setFieldValues({});
      setBirthDate(undefined);
      setAnniversaryDate(undefined);

      setIsOpen(false);
    } catch (error) {
      console.error("Error adding contact:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]  p-0 overflow-hidden z-[100]">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-semibold">Add New Contact</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <div className="px-6">
            <TabsList className="grid w-full bg-accent gap-2 grid-cols-2 mb-4">
              <TabsTrigger className='border-none' value="basic">Basic Info</TabsTrigger>
              <TabsTrigger className='border-none' value="additional">Additional Info</TabsTrigger>
            </TabsList>
          </div>

          <div className="px-6 overflow-y-auto max-h-[60vh]">
            <TabsContent value="basic" className="space-y-4 mt-0">
              {/* Company Selection */}
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Select value={contactData.companyId} onValueChange={(val) => handleInputChange('companyId', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] z-[100]">
                    {companies.length > 0 ? (
                      companies.map((company) => (
                        <SelectItem className="hover:bg-accent" key={company._id} value={company._id}>
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
                    value={contactData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={contactData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  value={contactData.whatsappNumber}
                  onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
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
  <Select 
    value={contactData.country} 
    onValueChange={(val) => handleInputChange('country', val)}
  >
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Select Country" />
    </SelectTrigger>
    <SelectContent className="max-h-[200px] z-[100]">
      {countryOptions.map((country) => (
        <SelectItem className="hover:bg-accent" key={country.code} value={country.name}>
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
                    value={contactData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={contactData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={contactData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  placeholder="Pincode"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={contactData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
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
                            <SelectContent>
                              {field.options.map((option) => (
                                <SelectItem key={option} value={option}>
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
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gap-1"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Creating...' : 'Create Contact'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddContact;