'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Loader2, Upload, Trash2, Plus, X } from 'lucide-react'
import Image from 'next/image'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface OrganizationSettings {
  logo: string | null
  additionalLogos: string[]
  defaultCurrency: string
  defaultQuotationExpiry: number // days
  termsAndConditions: string
  emailSignature: string
}

export default function QuotationSettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingAdditionalLogo, setUploadingAdditionalLogo] = useState(false)
  const [settings, setSettings] = useState<OrganizationSettings>({
    logo: null,
    additionalLogos: [],
    defaultCurrency: 'USD',
    defaultQuotationExpiry: 30,
    termsAndConditions: '',
    emailSignature: '',
  })

  // Fetch organization settings
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true)
      try {
        // Replace with your actual API endpoint
        const response = await axios.get('/api/organization/settings')
        setSettings(response.data)
      } catch (error) {
        console.error('Failed to fetch organization settings:', error)
        toast({title:'Failed to load settings'})
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    const maxSizeMB = 5
    const maxSizeBytes = maxSizeMB * 1024 * 1024

    if (file.size > maxSizeBytes) {
      toast({title:`Logo file size exceeds maximum allowed (${maxSizeMB}MB)`})
      return
    }

    const formData = new FormData()
    formData.append('files', file)

    setUploadingLogo(true)
    try {
      const response = await axios.post('/api/upload', formData)
      
      if (response.data.fileUrls && response.data.fileUrls.length > 0) {
        const logoUrl = response.data.fileUrls[0]
        
        // Update the organization settings with new logo
        await axios.patch('/api/organization/settings', {
          logo: logoUrl
        })
        
        setSettings(prev => ({
          ...prev,
          logo: logoUrl
        }))
        
        toast({title:'Organization logo updated successfully'})
      }
    } catch (error) {
      console.error('Failed to upload logo:', error)
    //   toast('Failed to upload logo')
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
    //   toast.error(`Logo file size exceeds maximum allowed (${maxSizeMB}MB)`)
      return
    }

    const formData = new FormData()
    formData.append('files', file)

    setUploadingAdditionalLogo(true)
    try {
      const response = await axios.post('/api/upload', formData)
      
      if (response.data.fileUrls && response.data.fileUrls.length > 0) {
        const logoUrl = response.data.fileUrls[0]
        const newAdditionalLogos = [...settings.additionalLogos, logoUrl]
        
        // Update the organization settings with new additional logo
        await axios.patch('/api/organization/settings', {
          additionalLogos: newAdditionalLogos
        })
        
        setSettings(prev => ({
          ...prev,
          additionalLogos: newAdditionalLogos
        }))
        
        // toast.success('Additional logo added successfully')
      }
    } catch (error) {
      console.error('Failed to upload additional logo:', error)
    //   toast.error('Failed to upload additional logo')
    } finally {
      setUploadingAdditionalLogo(false)
    }
  }

  const handleRemoveLogo = async () => {
    if (!settings.logo) return

    setUploadingLogo(true)
    try {
      await axios.patch('/api/organization/settings', {
        logo: null
      })
      
      setSettings(prev => ({
        ...prev,
        logo: null
      }))
      
    //   toast.success('Organization logo removed')
    } catch (error) {
      console.error('Failed to remove logo:', error)
    //   toast.error('Failed to remove logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleRemoveAdditionalLogo = async (logoUrl: string) => {
    try {
      const newAdditionalLogos = settings.additionalLogos.filter(logo => logo !== logoUrl)
      
      await axios.patch('/api/organization/settings', {
        additionalLogos: newAdditionalLogos
      })
      
      setSettings(prev => ({
        ...prev,
        additionalLogos: newAdditionalLogos
      }))
      
    //   toast.success('Logo removed')
    } catch (error) {
      console.error('Failed to remove logo:', error)
    //   toast.error('Failed to remove logo')
    }
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      await axios.patch('/api/organization/settings', {
        defaultCurrency: settings.defaultCurrency,
        defaultQuotationExpiry: settings.defaultQuotationExpiry,
        termsAndConditions: settings.termsAndConditions,
        emailSignature: settings.emailSignature
      })
    //   toast.success('Quotation settings saved successfully')
    } catch (error) {
      console.error('Failed to save settings:', error)
    //   toast.error('Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotation Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your quotation defaults and appearance settings
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
          <TabsTrigger className='border-none' value="branding">Branding</TabsTrigger>
          <TabsTrigger className='border-none' value="defaults">Defaults</TabsTrigger>
          <TabsTrigger className='border-none' value="templates">Templates</TabsTrigger>
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

        <TabsContent value="defaults">
          <Card>
            <CardHeader>
              <CardTitle>Default Settings</CardTitle>
              <CardDescription>
                Configure your default quotation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <select
                    id="currency"
                    className="w-full p-2 border rounded-md"
                    value={settings.defaultCurrency}
                    onChange={(e) => setSettings({...settings, defaultCurrency: e.target.value})}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="AUD">AUD (A$)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
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
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
              <Label htmlFor="terms">Default Terms & Conditions</Label>
                <textarea
                  id="terms"
                  rows={6}
                  className="w-full p-2 border rounded-md"
                  value={settings.termsAndConditions}
                  onChange={(e) => setSettings({...settings, termsAndConditions: e.target.value})}
                  placeholder="Enter your default terms and conditions..."
                />
                <p className="text-xs text-muted-foreground">
                  These terms will be automatically added to new quotations.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signature">Email Signature</Label>
                <textarea
                  id="signature"
                  rows={4}
                  className="w-full p-2 border rounded-md"
                  value={settings.emailSignature}
                  onChange={(e) => setSettings({...settings, emailSignature: e.target.value})}
                  placeholder="Enter your email signature for quotation emails..."
                />
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                You can use placeholders like {`{{company_name}}`}, {`{{quotation_number}}`}, etc. in your default content.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>
                Manage your quotation templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Go to the Templates section to create and manage your quotation templates.
              </p>
              <Button 
                onClick={() => router.push('/quotations/templates')}
                className="w-full md:w-auto"
              >
                Manage Templates
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}