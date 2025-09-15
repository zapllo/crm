'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Loader2, Upload, Trash2, Plus, X, Building2, User, Settings, FileText, PenTool, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'

// Comprehensive currency list
const CURRENCIES = [
  // Major World Currencies
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound Sterling', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  
  // South Asian Currencies
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: '₨' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨' },
  
  // Southeast Asian Currencies
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  
  // Middle Eastern Currencies
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب' },
  { code: 'OMR', name: 'Omani Rial', symbol: '﷼' },
  
  // African Currencies
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  
  // American Currencies
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
  
  // Oceanian Currencies
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  
  // European Currencies (Non-Euro)
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв' },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn' },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  
  // East Asian Currencies
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
];

interface OrganizationSettings {
  // Existing settings
  logo: string | null
  additionalLogos: string[]
  defaultCurrency: string
  defaultQuotationExpiry: number // days
  termsAndConditions: string
  emailSignature: string
  
  // New quotation-specific settings
  quotationPrefix: string
  clientSalutation: string
  companyDetails: {
    name: string
    address: string
    phone: string
    email: string
    website: string
    taxId: string
    registrationNumber: string
  }
  defaultTermsAndConditions: string
  digitalSignature: string | null // New field for digital signature
}

// Signature Canvas Component
const SignatureCanvas: React.FC<{
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
  existingSignature?: string | null;
}> = ({ onSave, onCancel, existingSignature }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!existingSignature);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas properties
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';

    // Load existing signature if available
    if (existingSignature) {
      const img = new window.Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = existingSignature;
    }
  }, [existingSignature]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setIsEmpty(false);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;

    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 bg-muted/10">
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          className="border border-border rounded bg-white cursor-crosshair w-full"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Draw your signature above using your mouse or touch device
        </p>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={clearCanvas}>
          Clear
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={saveSignature} disabled={isEmpty}>
            Save Signature
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function QuotationSettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingAdditionalLogo, setUploadingAdditionalLogo] = useState(false)
  const [uploadingSignature, setUploadingSignature] = useState(false)
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false)
  
  const [settings, setSettings] = useState<OrganizationSettings>({
    // Existing settings
    logo: null,
    additionalLogos: [],
    defaultCurrency: 'USD',
    defaultQuotationExpiry: 30,
    termsAndConditions: '',
    emailSignature: '',
    
    // New settings with defaults
    quotationPrefix: 'QUO',
    clientSalutation: 'Dear',
    companyDetails: {
      name: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      taxId: '',
      registrationNumber: '',
    },
    defaultTermsAndConditions: '',
    digitalSignature: null,
  })

  // Fetch organization settings
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get('/api/organization/quotation-settings')
        
        // Merge with defaults for any missing fields
        setSettings(prev => ({
          ...prev,
          ...response.data,
          companyDetails: {
            ...prev.companyDetails,
            ...response.data.companyDetails
          }
        }))
      } catch (error) {
        console.error('Failed to fetch organization settings:', error)
        toast({
          title: 'Error',
          description: 'Failed to load settings',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const uploadToS3 = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('files', file)

    const response = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response.data.fileUrls && response.data.fileUrls.length > 0) {
      return response.data.fileUrls[0]
    }
    
    throw new Error('Upload failed')
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    const maxSizeMB = 5
    const maxSizeBytes = maxSizeMB * 1024 * 1024

    if (file.size > maxSizeBytes) {
      toast({
        title: 'File too large',
        description: `Logo file size exceeds maximum allowed (${maxSizeMB}MB)`,
        variant: 'destructive'
      })
      return
    }

    setUploadingLogo(true)
    try {
      // Upload to S3
      const logoUrl = await uploadToS3(file)
      
      // Update the organization settings with new logo URL
      await axios.put('/api/organization/quotation-settings', {
        ...settings,
        logo: logoUrl
      })
      
      setSettings(prev => ({
        ...prev,
        logo: logoUrl
      }))
      
      toast({
        title: 'Success',
        description: 'Organization logo updated successfully'
      })
    } catch (error) {
      console.error('Failed to upload logo:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload logo',
        variant: 'destructive'
      })
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleAdditionalLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    const maxSizeMB = 5
    const maxSizeBytes = maxSizeMB * 1024 * 1024

    if (file.size > maxSizeBytes) {
      toast({
        title: 'File too large',
        description: `Logo file size exceeds maximum allowed (${maxSizeMB}MB)`,
        variant: 'destructive'
      })
      return
    }

    setUploadingAdditionalLogo(true)
    try {
      // Upload to S3
      const logoUrl = await uploadToS3(file)
      const newAdditionalLogos = [...settings.additionalLogos, logoUrl]
      
      // Update the organization settings with new additional logo URL
      await axios.put('/api/organization/quotation-settings', {
        ...settings,
        additionalLogos: newAdditionalLogos
      })
      
      setSettings(prev => ({
        ...prev,
        additionalLogos: newAdditionalLogos
      }))
      
      toast({
        title: 'Success',
        description: 'Additional logo added successfully'
      })
    } catch (error) {
      console.error('Failed to upload additional logo:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload additional logo',
        variant: 'destructive'
      })
    } finally {
      setUploadingAdditionalLogo(false)
    }
  }

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    const maxSizeMB = 2
    const maxSizeBytes = maxSizeMB * 1024 * 1024

    if (file.size > maxSizeBytes) {
      toast({
        title: 'File too large',
        description: `Signature file size exceeds maximum allowed (${maxSizeMB}MB)`,
        variant: 'destructive'
      })
      return
    }

    // Check if it's an image file
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (PNG, JPG, GIF, SVG)',
        variant: 'destructive'
      })
      return
    }

    setUploadingSignature(true)
    try {
      // Upload to S3
      const signatureUrl = await uploadToS3(file)
      
      // Update settings
      const updatedSettings = {
        ...settings,
        digitalSignature: signatureUrl
      }
      
      await axios.put('/api/organization/quotation-settings', updatedSettings)
      
      setSettings(updatedSettings)
      
      toast({
        title: 'Success',
        description: 'Digital signature uploaded successfully'
      })
    } catch (error) {
      console.error('Failed to upload signature:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload signature',
        variant: 'destructive'
      })
    } finally {
      setUploadingSignature(false)
    }
  }

  const handleSignatureDraw = async (dataUrl: string) => {
    setUploadingSignature(true)
    try {
      // Convert data URL to file
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      const file = new File([blob], 'signature.png', { type: 'image/png' })
      
      // Upload to S3
      const signatureUrl = await uploadToS3(file)
      
      // Update settings
      const updatedSettings = {
        ...settings,
        digitalSignature: signatureUrl
      }
      
      await axios.put('/api/organization/quotation-settings', updatedSettings)
      
      setSettings(updatedSettings)
      setSignatureDialogOpen(false)
      
      toast({
        title: 'Success',
        description: 'Digital signature saved successfully'
      })
    } catch (error) {
      console.error('Failed to save signature:', error)
      toast({
        title: 'Error',
        description: 'Failed to save signature',
        variant: 'destructive'
      })
    } finally {
      setUploadingSignature(false)
    }
  }

  const handleRemoveLogo = async () => {
    if (!settings.logo) return

    setUploadingLogo(true)
    try {
      const updatedSettings = {
        ...settings,
        logo: null
      }
      
      await axios.put('/api/organization/quotation-settings', updatedSettings)
      
      setSettings(updatedSettings)
      
      toast({
        title: 'Success',
        description: 'Organization logo removed'
      })
    } catch (error) {
      console.error('Failed to remove logo:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove logo',
        variant: 'destructive'
      })
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleRemoveAdditionalLogo = async (logoUrl: string) => {
    try {
      const newAdditionalLogos = settings.additionalLogos.filter(logo => logo !== logoUrl)
      const updatedSettings = {
        ...settings,
        additionalLogos: newAdditionalLogos
      }
      
      await axios.put('/api/organization/quotation-settings', updatedSettings)
      
      setSettings(updatedSettings)
      
      toast({
        title: 'Success',
        description: 'Logo removed'
      })
    } catch (error) {
      console.error('Failed to remove logo:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove logo',
        variant: 'destructive'
      })
    }
  }

  const handleRemoveSignature = async () => {
    try {
      const updatedSettings = {
        ...settings,
        digitalSignature: null
      }
      
      await axios.put('/api/organization/quotation-settings', updatedSettings)
      
      setSettings(updatedSettings)
      
      toast({
        title: 'Success',
        description: 'Digital signature removed'
      })
    } catch (error) {
      console.error('Failed to remove signature:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove signature',
        variant: 'destructive'
      })
    }
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      await axios.put('/api/organization/quotation-settings', settings)
      
      toast({
        title: 'Success',
        description: 'Quotation settings saved successfully'
      })
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompanyDetailsChange = (field: keyof OrganizationSettings['companyDetails'], value: string) => {
    setSettings(prev => ({
      ...prev,
      companyDetails: {
        ...prev.companyDetails,
        [field]: value
      }
    }))
  }

  return (
    <div className=" mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotation Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your quotation defaults, branding, and company information
          </p>
        </div>
        <Button
          onClick={handleSaveSettings}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </div>

      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="mb-4 bg-accent gap-4">
          <TabsTrigger className='border-none flex items-center gap-2' value="branding">
            <Upload className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger className='border-none flex items-center gap-2' value="company">
            <Building2 className="h-4 w-4" />
            Company Details
          </TabsTrigger>
          <TabsTrigger className='border-none flex items-center gap-2' value="defaults">
            <Settings className="h-4 w-4" />
            Defaults
          </TabsTrigger>
          <TabsTrigger className='border-none flex items-center gap-2' value="signature">
            <PenTool className="h-4 w-4" />
            Digital Signature
          </TabsTrigger>
          <TabsTrigger className='border-none flex items-center gap-2' value="terms">
            <FileText className="h-4 w-4" />
            Terms & Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>
                Customize your company's brand identity on quotations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base">Company Logo</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  This logo will appear on all your quotations. For best results, upload a logo with transparent background.
                </p>
                
                <div className="flex items-center gap-6 mt-4">
                  <div className="border rounded-lg w-48 h-48 flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
                    {settings.logo ? (
                      <Image 
                        src={settings.logo} 
                        alt="Company Logo" 
                        width={160} 
                        height={160}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <p className="text-sm">No logo uploaded</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div>
                      <Button 
                        variant="outline" 
                        className="relative" 
                        disabled={uploadingLogo}
                      >
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/gif,image/svg+xml"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handleLogoUpload}
                          disabled={uploadingLogo}
                        />
                        {uploadingLogo ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Logo
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {settings.logo && (
                      <Button
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={handleRemoveLogo}
                        disabled={uploadingLogo}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Logo
                      </Button>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      Recommended size: 500x200 pixels<br />
                      Maximum file size: 5MB<br />
                      Supported formats: PNG, JPG, GIF, SVG
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-base">Additional Logos</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Add partner or certification logos that will be available to include in your quotations.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {settings.additionalLogos.map((logo, index) => (
                    <div key={index} className="relative border rounded-lg w-full aspect-square flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => handleRemoveAdditionalLogo(logo)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Image 
                        src={logo} 
                        alt={`Additional Logo ${index + 1}`} 
                        width={100} 
                        height={100}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ))}
                  
                  <div className="border border-dashed rounded-lg w-full aspect-square flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 hover:border-primary cursor-pointer">
                    <Button 
                      variant="ghost" 
                      className="relative flex flex-col gap-2 h-full w-full" 
                      disabled={uploadingAdditionalLogo}
                    >
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/gif,image/svg+xml"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleAdditionalLogoUpload}
                        disabled={uploadingAdditionalLogo}
                      />
                      {uploadingAdditionalLogo ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-6 w-6" />
                          <span className="text-xs">Add Logo</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>
                Configure your company information that will appear on quotations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={settings.companyDetails.name}
                    onChange={(e) => handleCompanyDetailsChange('name', e.target.value)}
                    placeholder="Enter your company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={settings.companyDetails.email}
                    onChange={(e) => handleCompanyDetailsChange('email', e.target.value)}
                    placeholder="contact@yourcompany.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <Input
                    id="companyPhone"
                    value={settings.companyDetails.phone}
                    onChange={(e) => handleCompanyDetailsChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Website</Label>
                  <Input
                    id="companyWebsite"
                    value={settings.companyDetails.website}
                    onChange={(e) => handleCompanyDetailsChange('website', e.target.value)}
                    placeholder="https://yourcompany.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / GST Number</Label>
                  <Input
                    id="taxId"
                    value={settings.companyDetails.taxId}
                    onChange={(e) => handleCompanyDetailsChange('taxId', e.target.value)}
                    placeholder="Enter tax identification number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={settings.companyDetails.registrationNumber}
                    onChange={(e) => handleCompanyDetailsChange('registrationNumber', e.target.value)}
                    placeholder="Company registration number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyAddress">Company Address</Label>
                <Textarea
                  id="companyAddress"
                  value={settings.companyDetails.address}
                  onChange={(e) => handleCompanyDetailsChange('address', e.target.value)}
                  placeholder="Enter your complete company address"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defaults">
          <Card>
            <CardHeader>
              <CardTitle>Default Settings</CardTitle>
              <CardDescription>
                Configure your default quotation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="quotationPrefix">Quotation Number Prefix</Label>
                  <Input
                    id="quotationPrefix"
                    value={settings.quotationPrefix}
                    onChange={(e) => setSettings({...settings, quotationPrefix: e.target.value.toUpperCase()})}
                    placeholder="QUO"
                    className="uppercase"
                    maxLength={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: {settings.quotationPrefix}-{new Date().getFullYear()}-001234
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientSalutation">Client Salutation</Label>
                  <Select
                    value={settings.clientSalutation}
                    onValueChange={(value) => setSettings({...settings, clientSalutation: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dear">Dear</SelectItem>
                      <SelectItem value="Hello">Hello</SelectItem>
                      <SelectItem value="Hi">Hi</SelectItem>
                      <SelectItem value="Greetings">Greetings</SelectItem>
                      <SelectItem value="To">To</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    How to address clients in quotation communications
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select
                    value={settings.defaultCurrency}
                    onValueChange={(value) => setSettings({...settings, defaultCurrency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <div className="flex items-center gap-2">
                            <span>{currency.symbol}</span>
                            <span>{currency.code}</span>
                            <span className="text-muted-foreground">- {currency.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiry">Default Quotation Validity (days)</Label>
                  <Input
                    id="expiry"
                    type="number"
                    min="1"
                    max="365"
                    value={settings.defaultQuotationExpiry}
                    onChange={(e) => setSettings({...settings, defaultQuotationExpiry: parseInt(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground">
                    How many days from creation date quotations should be valid
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signature">
          <Card>
            <CardHeader>
              <CardTitle>Digital Signature</CardTitle>
              <CardDescription>
                Add your digital signature to appear on quotations for authenticity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base">Current Signature</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Your digital signature will appear at the bottom of your quotations.
                </p>
                
                <div className="flex items-start gap-6 mt-4">
                  <div className="border rounded-lg w-80 h-40 flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
                    {settings.digitalSignature ? (
                      <Image 
                        src={settings.digitalSignature} 
                        alt="Digital Signature" 
                        width={300} 
                        height={120}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <PenTool className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No signature added</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    {/* Draw Signature Button */}
                    <Dialog open={signatureDialogOpen} onOpenChange={setSignatureDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" disabled={uploadingSignature}>
                          <PenTool className="mr-2 h-4 w-4" />
                          Draw Signature
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg z-[100]">
                        <DialogHeader>
                          <DialogTitle>Draw Your Signature</DialogTitle>
                          <DialogDescription>
                            Use your mouse or touch device to draw your signature below.
                          </DialogDescription>
                        </DialogHeader>
                        <SignatureCanvas
                          onSave={handleSignatureDraw}
                          onCancel={() => setSignatureDialogOpen(false)}
                          existingSignature={settings.digitalSignature}
                        />
                      </DialogContent>
                    </Dialog>

                    {/* Upload Signature Button */}
                    <div>
                      <Button 
                        variant="outline" 
                        className="relative w-full" 
                        disabled={uploadingSignature}
                      >
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/gif,image/svg+xml"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handleSignatureUpload}
                          disabled={uploadingSignature}
                        />
                        {uploadingSignature ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Upload Signature
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {settings.digitalSignature && (
                      <Button
                        variant="outline"
                        className="text-destructive hover:text-destructive w-full"
                        onClick={handleRemoveSignature}
                        disabled={uploadingSignature}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Signature
                      </Button>
                    )}
                    
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-muted-foreground">
                        <strong>Drawing:</strong> Use mouse or touch to draw
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <strong>Upload:</strong> PNG, JPG, GIF, SVG (max 2MB)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <strong>Recommended:</strong> 400x150 pixels with transparent background
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Signature Usage
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your signature will appear at the bottom of quotation PDFs</li>
                  <li>• It can be included in email signatures when sending quotations</li>
                  <li>• Helps authenticate your quotations and adds professionalism</li>
                  <li>• Can be toggled on/off per quotation template</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terms">
          <Card>
            <CardHeader>
              <CardTitle>Terms & Templates</CardTitle>
              <CardDescription>
                Configure your default terms and conditions and email templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="defaultTerms">Default Terms & Conditions</Label>
                <Textarea
                  id="defaultTerms"
                  rows={8}
                  value={settings.defaultTermsAndConditions}
                  onChange={(e) => setSettings({...settings, defaultTermsAndConditions: e.target.value})}
                  placeholder="Enter your default terms and conditions that will be automatically added to new quotations..."
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  These terms will be automatically added to new quotations. You can edit them for individual quotations.
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="signature">Email Signature Template</Label>
                <Textarea
                  id="signature"
                  rows={6}
                  value={settings.emailSignature}
                  onChange={(e) => setSettings({...settings, emailSignature: e.target.value})}
                  placeholder="Enter your email signature template for quotation emails..."
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  This signature will be included in quotation emails. You can use placeholders like {`{{company_name}}`}, {`{{sender_name}}`}, {`{{quotation_number}}`}.
                </p>
              </div>

              <Separator />

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Available Placeholders</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>• {`{{company_name}}`} - Your company name</div>
                  <div>• {`{{sender_name}}`} - Quotation creator's name</div>
                  <div>• {`{{quotation_number}}`} - Quotation number</div>
                  <div>• {`{{quotation_title}}`} - Quotation title</div>
                  <div>• {`{{client_name}}`} - Client's name</div>
                  <div>• {`{{total_amount}}`} - Total quotation amount</div>
                  <div>• {`{{currency}}`} - Currency code</div>
                  <div>• {`{{valid_until}}`} - Quotation validity date</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Quotation Templates</h4>
                    <p className="text-sm text-muted-foreground">
                      Manage your quotation design templates
                    </p>
                  </div>
                  <Button 
                    onClick={() => router.push('/quotations/templates')}
                    variant="outline"
                  >
                    Manage Templates
                  </Button>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Create custom quotation templates with your branding, layouts, and styling preferences. 
                    Visit the Templates section to create, edit, and manage your quotation designs.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>All changes to terms and email templates will apply to new quotations only.</span>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}