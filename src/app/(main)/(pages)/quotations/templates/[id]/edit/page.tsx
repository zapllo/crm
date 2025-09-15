'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, ArrowLeft, Eye, Layout, Palette, File, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import QuotationPreview from '@/components/quotations/QuotationPreview';
import TemplateRenderer from '@/components/quotations/TemplateRenderer';

export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const templateId = params.id as string;
  
  const [template, setTemplate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [previewData, setPreviewData] = useState<any>(null);
  
  useEffect(() => {
    fetchTemplate();
    // Generate sample data for preview
    setPreviewData({
      title: "Sample Quotation",
      quotationNumber: "QUO-202308-0001",
      organization: {
        companyName: "Acme Corporation",
        industry: "Technology",
      },
      creator: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      },
      lead: {
        title: "Website Redesign Project",
        leadId: "LEAD-0001",
      },
      contact: {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        whatsappNumber: "+1234567890",
      },
      items: [
        {
          name: "Website Design",
          description: "Complete redesign of company website",
          quantity: 1,
          unitPrice: 2500,
          discount: 10,
          tax: 5,
          total: 2362.5,
        },
        {
          name: "SEO Optimization",
          description: "Search engine optimization package",
          quantity: 1,
          unitPrice: 800,
          discount: 0,
          tax: 5,
          total: 840,
        },
      ],
      subtotal: 3300,
      discount: {
        type: "percentage",
        value: 10,
        amount: 330,
      },
      tax: {
        name: "GST",
        percentage: 5,
        amount: 148.5,
      },
      total: 3118.5,
      currency: "USD",
      issueDate: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: "draft",
      terms: [
        {
          title: "Payment Terms",
          content: "Payment due within 30 days of invoice date.",
        },
        {
          title: "Delivery Timeline",
          content: "Project will be delivered within 45 days of quotation approval.",
        },
      ],
      notes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }, [templateId]);
  
  const fetchTemplate = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`/api/quotations/templates/${templateId}`);
      setTemplate(data);
    } catch (error) {
      console.error('Error fetching template:', error);
      toast({
        title: 'Error',
        description: 'Failed to load template data',
        variant: 'destructive',
      });
      router.push('/quotations/templates');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await axios.put(`/api/quotations/templates/${templateId}`, template);
      
      toast({
        title: 'Success',
        description: 'Template saved successfully',
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleUpdateHeaderContent = (content: string) => {
    setTemplate({
      ...template,
      layout: {
        ...template.layout,
        header: {
          ...template.layout.header,
          content,
        },
      },
    });
  };
  
  const handleUpdateFooterContent = (content: string) => {
    setTemplate({
      ...template,
      layout: {
        ...template.layout,
        footer: {
          ...template.layout.footer,
          content,
        },
      },
    });
  };
  
  const handleToggleHeaderShow = (show: boolean) => {
    setTemplate({
      ...template,
      layout: {
        ...template.layout,
        header: {
          ...template.layout.header,
          show,
        },
      },
    });
  };
  
  const handleToggleFooterShow = (show: boolean) => {
    setTemplate({
      ...template,
      layout: {
        ...template.layout,
        footer: {
          ...template.layout.footer,
          show,
        },
      },
    });
  };
  
  const handleUpdateSectionOrder = (id: string, newOrder: number) => {
    const updatedSections = [...template.layout.sections].map(section => {
      if (section.id === id) {
        return { ...section, order: newOrder };
      }
      return section;
    });
    
    setTemplate({
      ...template,
      layout: {
        ...template.layout,
        sections: updatedSections.sort((a, b) => a.order - b.order),
      },
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      </div>
    );
  }
  
  if (!template) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">Template not found</p>
          <Button onClick={() => router.push('/quotations/templates')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/quotations/templates')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{template.name}</h1>
            <p className="text-muted-foreground">Template Editor</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" /> Preview
            </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="general">
                <File className="h-4 w-4 mr-2" /> General
              </TabsTrigger>
              <TabsTrigger value="layout">
                <Layout className="h-4 w-4 mr-2" /> Layout
              </TabsTrigger>
              <TabsTrigger value="styles">
                <Palette className="h-4 w-4 mr-2" /> Styles
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Template Information</CardTitle>
                  <CardDescription>Basic settings for this template</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Professional Blue"
                      value={template.name}
                      onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your template..."
                      value={template.description}
                      onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="previewImage">Preview Image URL</Label>
                    <Input
                      id="previewImage"
                      placeholder="https://example.com/image.jpg"
                      value={template.previewImage}
                      onChange={(e) => setTemplate({ ...template, previewImage: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isDefault"
                      checked={template.isDefault}
                      onCheckedChange={(checked) => setTemplate({ ...template, isDefault: checked })}
                    />
                    <Label htmlFor="isDefault">Set as default template</Label>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Page Settings</CardTitle>
                  <CardDescription>Configure the page dimensions and orientation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="pageSize">Page Size</Label>
                    <Select
                      value={template.pageSettings.pageSize}
                      onValueChange={(value) => setTemplate({
                        ...template,
                        pageSettings: {
                          ...template.pageSettings,
                          pageSize: value
                        }
                      })}
                    >
                      <SelectTrigger id="pageSize">
                        <SelectValue placeholder="Select page size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A4">A4</SelectItem>
                        <SelectItem value="Letter">Letter</SelectItem>
                        <SelectItem value="Legal">Legal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="orientation">Orientation</Label>
                    <Select
                      value={template.pageSettings.orientation}
                      onValueChange={(value) => setTemplate({
                        ...template,
                        pageSettings: {
                          ...template.pageSettings,
                          orientation: value
                        }
                      })}
                    >
                      <SelectTrigger id="orientation">
                        <SelectValue placeholder="Select orientation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Margins (mm)</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor="marginTop" className="text-xs">Top</Label>
                        <Input
                          id="marginTop"
                          type="number"
                          value={template.pageSettings.margins.top}
                          onChange={(e) => setTemplate({
                            ...template,
                            pageSettings: {
                              ...template.pageSettings,
                              margins: {
                                ...template.pageSettings.margins,
                                top: Number(e.target.value)
                              }
                            }
                          })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="marginRight" className="text-xs">Right</Label>
                        <Input
                          id="marginRight"
                          type="number"
                          value={template.pageSettings.margins.right}
                          onChange={(e) => setTemplate({
                            ...template,
                            pageSettings: {
                              ...template.pageSettings,
                              margins: {
                                ...template.pageSettings.margins,
                                right: Number(e.target.value)
                              }
                            }
                          })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="marginBottom" className="text-xs">Bottom</Label>
                        <Input
                          id="marginBottom"
                          type="number"
                          value={template.pageSettings.margins.bottom}
                          onChange={(e) => setTemplate({
                            ...template,
                            pageSettings: {
                              ...template.pageSettings,
                              margins: {
                                ...template.pageSettings.margins,
                                bottom: Number(e.target.value)
                              }
                            }
                          })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="marginLeft" className="text-xs">Left</Label>
                        <Input
                          id="marginLeft"
                          type="number"
                          value={template.pageSettings.margins.left}
                          onChange={(e) => setTemplate({
                            ...template,
                            pageSettings: {
                              ...template.pageSettings,
                              margins: {
                                ...template.pageSettings.margins,
                                left: Number(e.target.value)
                              }
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="layout" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Header</CardTitle>
                  <CardDescription>Configure the quotation header</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="headerShow"
                      checked={template.layout.header.show}
                      onCheckedChange={handleToggleHeaderShow}
                    />
                    <Label htmlFor="headerShow">Show header</Label>
                  </div>
                  
                  {template.layout.header.show && (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="headerHeight">Height (px)</Label>
                        <Input
                          id="headerHeight"
                          type="number"
                          value={template.layout.header.height}
                          onChange={(e) => setTemplate({
                            ...template,
                            layout: {
                              ...template.layout,
                              header: {
                                ...template.layout.header,
                                height: Number(e.target.value)
                              }
                            }
                          })}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="headerContent">Content (HTML)</Label>
                        <Textarea
                          id="headerContent"
                          value={template.layout.header.content}
                          onChange={(e) => handleUpdateHeaderContent(e.target.value)}
                          rows={6}
                          className="font-mono text-sm"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          You can use variables like , etc.
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Footer</CardTitle>
                  <CardDescription>Configure the quotation footer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="footerShow"
                      checked={template.layout.footer.show}
                      onCheckedChange={handleToggleFooterShow}
                    />
                    <Label htmlFor="footerShow">Show footer</Label>
                  </div>
                  
                  {template.layout.footer.show && (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="footerHeight">Height (px)</Label>
                        <Input
                          id="footerHeight"
                          type="number"
                          value={template.layout.footer.height}
                          onChange={(e) => setTemplate({
                            ...template,
                            layout: {
                              ...template.layout,
                              footer: {
                                ...template.layout.footer,
                                height: Number(e.target.value)
                              }
                            }
                          })}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="footerContent">Content (HTML)</Label>
                        <Textarea
                          id="footerContent"
                          value={template.layout.footer.content}
                          onChange={(e) => handleUpdateFooterContent(e.target.value)}
                          rows={6}
                          className="font-mono text-sm"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          You can use variables like , etc.
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Sections</CardTitle>
                  <CardDescription>Organize and arrange template sections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {template.layout.sections.sort((a: any, b: any) => a.order - b.order).map((section: any) => (
                      <div 
                        key={section.id} 
                        className="flex items-center justify-between p-3 border rounded-md bg-muted/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                            <span className="font-medium">{section.order}</span>
                          </div>
                          <div>
                            <p className="font-medium">{section.title}</p>
                            <p className="text-xs text-muted-foreground">{section.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={section.order.toString()}
                            onValueChange={(value) => handleUpdateSectionOrder(section.id, Number(value))}
                          >
                            <SelectTrigger className="w-16">
                              <SelectValue placeholder="Order" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: template.layout.sections.length }).map((_, i) => (
                                <SelectItem key={i} value={(i + 1).toString()}>
                                  {i + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`section-${section.id}-visible`}
                              checked={section.isVisible}
                              onCheckedChange={(checked) => {
                                const updatedSections = template.layout.sections.map((s: any) => {
                                  if (s.id === section.id) {
                                    return { ...s, isVisible: checked };
                                  }
                                  return s;
                                });
                                
                                setTemplate({
                                  ...template,
                                  layout: {
                                    ...template.layout,
                                    sections: updatedSections,
                                  },
                                });
                              }}
                            />
                            <Label htmlFor={`section-${section.id}-visible`} className="text-xs">
                              Visible
                            </Label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="styles" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Colors</CardTitle>
                  <CardDescription>Define the color scheme of your template</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-8 w-8 rounded-md border"
                        style={{ backgroundColor: template.styles.primaryColor }}
                      />
                      <Input
                        id="primaryColor"
                        value={template.styles.primaryColor}
                        onChange={(e) => setTemplate({
                          ...template,
                          styles: {
                            ...template.styles,
                            primaryColor: e.target.value
                          }
                        })}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-8 w-8 rounded-md border"
                        style={{ backgroundColor: template.styles.secondaryColor }}
                      />
                      <Input
                        id="secondaryColor"
                        value={template.styles.secondaryColor}
                        onChange={(e) => setTemplate({
                          ...template,
                          styles: {
                            ...template.styles,
                            secondaryColor: e.target.value
                          }
                        })}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Typography</CardTitle>
                  <CardDescription>Configure text appearance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <Select
                      value={template.styles.fontFamily}
                      onValueChange={(value) => setTemplate({
                        ...template,
                        styles: {
                          ...template.styles,
                          fontFamily: value
                        }
                      })}
                    >
                      <SelectTrigger id="fontFamily">
                        <SelectValue placeholder="Select font family" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                        <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                        <SelectItem value="Helvetica, sans-serif">Helvetica</SelectItem>
                        <SelectItem value="Times New Roman, serif">Times New Roman</SelectItem>
                        <SelectItem value="Georgia, serif">Georgia</SelectItem>
                        <SelectItem value="Courier New, monospace">Courier New</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="fontSize">Base Font Size</Label>
                    <Select
                      value={template.styles.fontSize}
                      onValueChange={(value) => setTemplate({
                        ...template,
                        styles: {
                          ...template.styles,
                          fontSize: value
                        }
                      })}
                    >
                      <SelectTrigger id="fontSize">
                        <SelectValue placeholder="Select font size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10px">10px</SelectItem>
                        <SelectItem value="11px">11px</SelectItem>
                        <SelectItem value="12px">12px</SelectItem>
                        <SelectItem value="13px">13px</SelectItem>
                        <SelectItem value="14px">14px</SelectItem>
                        <SelectItem value="16px">16px</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Table Settings</CardTitle>
                  <CardDescription>Configure table appearance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="borderStyle">Border Style</Label>
                    <Select
                      value={template.styles.borderStyle}
                      onValueChange={(value) => setTemplate({
                        ...template,
                        styles: {
                          ...template.styles,
                          borderStyle: value
                        }
                      })}
                    >
                      <SelectTrigger id="borderStyle">
                        <SelectValue placeholder="Select border style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid">Solid</SelectItem>
                        <SelectItem value="dashed">Dashed</SelectItem>
                        <SelectItem value="dotted">Dotted</SelectItem>
                        <SelectItem value="double">Double</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="tableBorders"
                      checked={template.styles.tableBorders}
                      onCheckedChange={(checked) => setTemplate({
                        ...template,
                        styles: {
                          ...template.styles,
                          tableBorders: checked
                        }
                      })}
                    />
                    <Label htmlFor="tableBorders">Show table borders</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="alternateRowColors"
                      checked={template.styles.alternateRowColors}
                      onCheckedChange={(checked) => setTemplate({
                        ...template,
                        styles: {
                          ...template.styles,
                          alternateRowColors: checked
                        }
                      })}
                    />
                    <Label htmlFor="alternateRowColors">Alternate row colors</Label>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Custom CSS</CardTitle>
                  <CardDescription>Add custom styles to your template</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={template.styles.customCSS}
                    onChange={(e) => setTemplate({
                      ...template,
                      styles: {
                        ...template.styles,
                        customCSS: e.target.value
                      }
                    })}
                    rows={10}
                    className="font-mono text-sm"
                    placeholder=".quotation-header { 
  background-color: #f5f5f5; 
}
.quotation-table th {
  font-weight: bold;
}"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Add custom CSS to fine-tune the appearance of your template.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Template Preview</CardTitle>
              <CardDescription>See how your template will look</CardDescription>
            </CardHeader>
            <CardContent className="p-0 border-t">
              <div className="bg-white dark:bg-gray-950 max-h-[800px] overflow-auto">
                {previewData && (
                  <TemplateRenderer 
                    quotation={previewData} 
                    // templateData={template}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}