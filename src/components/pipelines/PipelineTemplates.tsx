import { useState } from 'react';
import axios from 'axios';
import { Building2, Copy, Eye, Filter, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Define the template interface
export interface PipelineTemplate {
  id: string;
  name: string;
  industry: string;
  description: string;
  openStages: { name: string; color: string }[];
  closeStages: { name: string; color: string; won?: boolean; lost?: boolean }[];
  customFields: {
    name: string;
    type: "Text" | "Date" | "Number" | "MultiSelect";
    options?: string[];
  }[];
}

// Pre-defined templates
export const PIPELINE_TEMPLATES: PipelineTemplate[] = [
  {
    id: "ecommerce-sales",
    name: "E-commerce Sales Pipeline",
    industry: "Retail/E-Commerce",
    description: "Track online store leads from cart to purchase",
    openStages: [
      { name: "Cart Abandonment", color: "#f97316" },
      { name: "Checkout Started", color: "#eab308" },
      { name: "Payment Processing", color: "#22c55e" }
    ],
    closeStages: [
      { name: "Order Completed", color: "#14b8a6", won: true },
      { name: "Cancelled", color: "#ef4444", lost: true }
    ],
    customFields: [
      { name: "Cart Value", type: "Number" },
      { name: "Referral Source", type: "Text" },
      { name: "Discount Code", type: "Text" }
    ]
  },
  {
    id: "saas-sales",
    name: "SaaS Sales Pipeline",
    industry: "Technology",
    description: "B2B software sales from lead to subscription",
    openStages: [
      { name: "Lead", color: "#a855f7" },
      { name: "Qualification", color: "#8b5cf6" },
      { name: "Demo Scheduled", color: "#6366f1" },
      { name: "Proposal", color: "#0ea5e9" },
      { name: "Negotiation", color: "#0891b2" }
    ],
    closeStages: [
      { name: "Subscription Activated", color: "#22c55e", won: true },
      { name: "Lost", color: "#ef4444", lost: true },
      { name: "On Hold", color: "#94a3b8", lost: true }
    ],
    customFields: [
      { name: "Subscription Tier", type: "MultiSelect", options: ["Basic", "Pro", "Enterprise"] },
      { name: "User Count", type: "Number" },
      { name: "Implementation Date", type: "Date" }
    ]
  },
  {
    id: "education-enrollment",
    name: "Education Enrollment Pipeline",
    industry: "Education",
    description: "Track student enrollment process from inquiry to registration",
    openStages: [
      { name: "Initial Inquiry", color: "#06b6d4" },
      { name: "Information Session", color: "#0ea5e9" },
      { name: "Application Submitted", color: "#3b82f6" },
      { name: "Interview", color: "#6366f1" },
      { name: "Offer Made", color: "#8b5cf6" }
    ],
    closeStages: [
      { name: "Enrolled", color: "#22c55e", won: true },
      { name: "Declined", color: "#ef4444", lost: true },
      { name: "Waitlisted", color: "#eab308", lost: true }
    ],
    customFields: [
      { name: "Program", type: "MultiSelect", options: ["Bachelor's", "Master's", "Doctorate", "Certificate"] },
      { name: "Semester", type: "MultiSelect", options: ["Fall", "Spring", "Summer"] },
      { name: "Scholarship", type: "Text" }
    ]
  },
  {
    id: "healthcare-patient",
    name: "Healthcare Patient Acquisition",
    industry: "Healthcare(Doctors/Clinics/Physicians/Hospital)",
    description: "Track patient journey from inquiry to appointment",
    openStages: [
      { name: "Initial Contact", color: "#06b6d4" },
      { name: "Eligibility Check", color: "#0ea5e9" },
      { name: "Appointment Scheduled", color: "#3b82f6" },
      { name: "Pre-Registration", color: "#818cf8" }
    ],
    closeStages: [
      { name: "Appointment Completed", color: "#22c55e", won: true },
      { name: "No-Show", color: "#ef4444", lost: true },
      { name: "Rescheduled", color: "#f59e0b", lost: true }
    ],
    customFields: [
      { name: "Insurance Provider", type: "Text" },
      { name: "Referral Doctor", type: "Text" },
      { name: "Treatment Type", type: "MultiSelect", options: ["Consultation", "Procedure", "Follow-up", "Emergency"] }
    ]
  },
  {
    id: "real-estate-sales",
    name: "Real Estate Sales Pipeline",
    industry: "Real Estate/Construction/Interior/Architects",
    description: "Track property sales from listing to closing",
    openStages: [
      { name: "Lead Generation", color: "#f97316" },
      { name: "Qualification", color: "#f59e0b" },
      { name: "Property Showing", color: "#eab308" },
      { name: "Offer Submitted", color: "#84cc16" },
      { name: "Negotiation", color: "#22c55e" },
      { name: "Under Contract", color: "#10b981" }
    ],
    closeStages: [
      { name: "Closed", color: "#14b8a6", won: true },
      { name: "Lost", color: "#ef4444", lost: true },
      { name: "Expired", color: "#94a3b8", lost: true }
    ],
    customFields: [
      { name: "Property Type", type: "MultiSelect", options: ["Residential", "Commercial", "Land", "Industrial"] },
      { name: "Price Range", type: "Text" },
      { name: "Square Footage", type: "Number" },
      { name: "Location", type: "Text" }
    ]
  },
  {
    id: "logistics-service",
    name: "Logistics Service Pipeline",
    industry: "Logistics",
    description: "Track freight and shipping leads from inquiry to delivery",
    openStages: [
      { name: "Inquiry", color: "#f97316" },
      { name: "Quote Requested", color: "#f59e0b" },
      { name: "Quote Provided", color: "#eab308" },
      { name: "Negotiation", color: "#84cc16" },
      { name: "Booking", color: "#10b981" }
    ],
    closeStages: [
      { name: "Shipment Completed", color: "#14b8a6", won: true },
      { name: "Cancelled", color: "#ef4444", lost: true }
    ],
    customFields: [
      { name: "Shipment Type", type: "MultiSelect", options: ["Air", "Ocean", "Ground", "Rail"] },
      { name: "Origin", type: "Text" },
      { name: "Destination", type: "Text" },
      { name: "Estimated Volume", type: "Text" }
    ]
  },
  {
    id: "financial-services",
    name: "Financial Advisory Pipeline",
    industry: "Financial Consultants",
    description: "Track financial advisory clients from lead to engagement",
    openStages: [
      { name: "Initial Contact", color: "#a855f7" },
      { name: "Discovery Meeting", color: "#8b5cf6" },
      { name: "Financial Analysis", color: "#6366f1" },
      { name: "Proposal", color: "#3b82f6" },
      { name: "Contract Review", color: "#0ea5e9" }
    ],
    closeStages: [
      { name: "Engaged", color: "#10b981", won: true },
      { name: "Declined", color: "#ef4444", lost: true },
      { name: "Delayed", color: "#f59e0b", lost: true }
    ],
    customFields: [
      { name: "Service Type", type: "MultiSelect", options: ["Wealth Management", "Tax Planning", "Retirement", "Estate Planning"] },
      { name: "Portfolio Size", type: "Number" },
      { name: "Risk Tolerance", type: "MultiSelect", options: ["Conservative", "Moderate", "Aggressive"] }
    ]
  },
  {
    id: "trading-deals",
    name: "Trading Deal Pipeline",
    industry: "Trading",
    description: "Track commodity or stock trading deals",
    openStages: [
      { name: "Market Analysis", color: "#a855f7" },
      { name: "Opportunity Identified", color: "#8b5cf6" },
      { name: "Negotiation", color: "#6366f1" },
      { name: "Due Diligence", color: "#3b82f6" },
      { name: "Agreement Drafting", color: "#0ea5e9" }
    ],
    closeStages: [
      { name: "Deal Closed", color: "#10b981", won: true },
      { name: "Cancelled", color: "#ef4444", lost: true }
    ],
    customFields: [
      { name: "Asset Type", type: "MultiSelect", options: ["Commodity", "Stock", "Bond", "Derivative"] },
      { name: "Volume", type: "Number" },
      { name: "Expected ROI", type: "Text" },
      { name: "Market Conditions", type: "Text" }
    ]
  },
  {
    id: "manufacturing-sales",
    name: "Manufacturing Sales Pipeline",
    industry: "Manufacturing",
    description: "Track B2B manufacturing sales from inquiry to order",
    openStages: [
      { name: "Lead", color: "#f97316" },
      { name: "Technical Assessment", color: "#f59e0b" },
      { name: "Sample/Prototype", color: "#eab308" },
      { name: "Quotation", color: "#84cc16" },
      { name: "Negotiation", color: "#22c55e" }
    ],
    closeStages: [
      { name: "Order Placed", color: "#14b8a6", won: true },
      { name: "Lost to Competitor", color: "#ef4444", lost: true },
      { name: "Project Discontinued", color: "#94a3b8", lost: true }
    ],
    customFields: [
      { name: "Product Category", type: "Text" },
      { name: "Quantity", type: "Number" },
      { name: "Production Timeline", type: "Date" },
      { name: "Certification Requirements", type: "Text" }
    ]
  },
  {
    id: "restaurant-catering",
    name: "Restaurant & Catering Pipeline",
    industry: "Service Provider",
    description: "Track food service leads from inquiry to event",
    openStages: [
      { name: "Inquiry", color: "#f97316" },
      { name: "Menu Discussion", color: "#f59e0b" },
      { name: "Site Visit/Planning", color: "#eab308" },
      { name: "Proposal/Quote", color: "#84cc16" },
      { name: "Deposit", color: "#22c55e" }
    ],
    closeStages: [
      { name: "Event Completed", color: "#14b8a6", won: true },
      { name: "Cancelled", color: "#ef4444", lost: true }
    ],
    customFields: [
      { name: "Event Type", type: "MultiSelect", options: ["Wedding", "Corporate", "Social", "Holiday"] },
      { name: "Guest Count", type: "Number" },
      { name: "Dietary Restrictions", type: "Text" },
      { name: "Venue", type: "Text" }
    ]
  },
  {
    id: "construction-projects",
    name: "Construction Project Pipeline",
    industry: "Real Estate/Construction/Interior/Architects",
    description: "Track construction projects from lead to completion",
    openStages: [
      { name: "Lead", color: "#f97316" },
      { name: "Site Visit", color: "#f59e0b" },
      { name: "Initial Design", color: "#eab308" },
      { name: "Quotation", color: "#84cc16" },
      { name: "Contract Negotiation", color: "#22c55e" },
      { name: "Planning/Permits", color: "#10b981" }
    ],
    closeStages: [
      { name: "Project Completed", color: "#14b8a6", won: true },
      { name: "Project Cancelled", color: "#ef4444", lost: true }
    ],
    customFields: [
      { name: "Project Type", type: "MultiSelect", options: ["Residential", "Commercial", "Industrial", "Infrastructure"] },
      { name: "Budget", type: "Number" },
      { name: "Timeline", type: "Date" },
      { name: "Square Footage", type: "Number" }
    ]
  },
  {
    id: "legal-services",
    name: "Legal Services Pipeline",
    industry: "Service Provider",
    description: "Track legal cases from intake to resolution",
    openStages: [
      { name: "Initial Consultation", color: "#a855f7" },
      { name: "Case Assessment", color: "#8b5cf6" },
      { name: "Retainer Signed", color: "#6366f1" },
      { name: "Case Preparation", color: "#3b82f6" },
      { name: "Negotiation/Mediation", color: "#0ea5e9" },
      { name: "Litigation", color: "#0891b2" }
    ],
    closeStages: [
      { name: "Case Resolved", color: "#10b981", won: true },
      { name: "Withdrawn", color: "#ef4444", lost: true },
      { name: "Referred Out", color: "#94a3b8", lost: true }
    ],
    customFields: [
      { name: "Case Type", type: "MultiSelect", options: ["Family", "Criminal", "Civil", "Corporate", "Real Estate"] },
      { name: "Opposing Counsel", type: "Text" },
      { name: "Court Date", type: "Date" },
      { name: "Billing Type", type: "MultiSelect", options: ["Hourly", "Flat Fee", "Contingency"] }
    ]
  },
  {
    id: "nonprofit-fundraising",
    name: "Nonprofit Fundraising Pipeline",
    industry: "Service Provider",
    description: "Track donor and grant opportunities for nonprofits",
    openStages: [
      { name: "Prospect Research", color: "#a855f7" },
      { name: "Initial Outreach", color: "#8b5cf6" },
      { name: "Meeting/Presentation", color: "#6366f1" },
      { name: "Proposal Submission", color: "#3b82f6" },
      { name: "Follow-up", color: "#0ea5e9" }
    ],
    closeStages: [
      { name: "Donation Received", color: "#10b981", won: true },
      { name: "Declined", color: "#ef4444", lost: true },
      { name: "Deferred", color: "#f59e0b", lost: true }
    ],
    customFields: [
      { name: "Donor Type", type: "MultiSelect", options: ["Individual", "Foundation", "Corporate", "Government"] },
      { name: "Potential Amount", type: "Number" },
      { name: "Program Area", type: "Text" },
      { name: "Previous Giving", type: "Text" }
    ]
  },
  {
    id: "it-service-delivery",
    name: "IT Service Delivery Pipeline",
    industry: "Technology",
    description: "Track IT service requests from submission to resolution",
    openStages: [
      { name: "Ticket Created", color: "#f97316" },
      { name: "Assessment", color: "#f59e0b" },
      { name: "In Progress", color: "#eab308" },
      { name: "Testing", color: "#84cc16" },
      { name: "Client Review", color: "#22c55e" }
    ],
    closeStages: [
      { name: "Resolved", color: "#14b8a6", won: true },
      { name: "Cancelled", color: "#ef4444", lost: true }
    ],
    customFields: [
      { name: "Priority", type: "MultiSelect", options: ["Low", "Medium", "High", "Critical"] },
      { name: "Issue Type", type: "MultiSelect", options: ["Bug", "Feature Request", "Support", "Maintenance"] },
      { name: "Environment", type: "Text" },
      { name: "Affected Systems", type: "Text" }
    ]
  },
  {
    id: "event-management",
    name: "Event Management Pipeline",
    industry: "Service Provider",
    description: "Track event planning from inquiry to execution",
    openStages: [
      { name: "Initial Inquiry", color: "#a855f7" },
      { name: "Concept Development", color: "#8b5cf6" },
      { name: "Proposal/Budget", color: "#6366f1" },
      { name: "Contract", color: "#3b82f6" },
      { name: "Planning & Logistics", color: "#0ea5e9" },
      { name: "Final Preparations", color: "#0891b2" }
    ],
    closeStages: [
      { name: "Event Executed", color: "#10b981", won: true },
      { name: "Cancelled", color: "#ef4444", lost: true },
      { name: "Postponed", color: "#f59e0b", lost: true }
    ],
    customFields: [
      { name: "Event Type", type: "MultiSelect", options: ["Conference", "Tradeshow", "Wedding", "Corporate", "Fundraiser"] },
      { name: "Attendee Count", type: "Number" },
      { name: "Date", type: "Date" },
      { name: "Venue", type: "Text" },
      { name: "Budget", type: "Number" }
    ]
  }
];

export default function PipelineTemplates() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string>("");
  const [viewTemplateId, setViewTemplateId] = useState<string | null>(null);
  const [copyTemplateId, setCopyTemplateId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Get the template being viewed or copied
  const viewTemplate = viewTemplateId 
    ? PIPELINE_TEMPLATES.find(t => t.id === viewTemplateId) 
    : null;
  
  const copyTemplate = copyTemplateId 
    ? PIPELINE_TEMPLATES.find(t => t.id === copyTemplateId) 
    : null;

  // Filter templates based on search and industry
  const filteredTemplates = PIPELINE_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = !industryFilter || template.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  // Get unique industries for filtering
  const industries = Array.from(new Set(PIPELINE_TEMPLATES.map(t => t.industry)));

  // Copy template to user's pipelines
  const handleCopyTemplate = async () => {
    if (!copyTemplate) return;
    
    setIsCreating(true);
    try {
      // Create pipeline from template
      await axios.post('/api/pipelines', {
        name: copyTemplate.name,
        openStages: copyTemplate.openStages,
        closeStages: copyTemplate.closeStages,
        customFields: copyTemplate.customFields
      });
      
      toast({
        title: "Success!",
        description: `"${copyTemplate.name}" pipeline has been created.`,
      });
      
      // Close dialog and reset state
      setCopyTemplateId(null);
    } catch (error) {
      console.error("Failed to create pipeline from template:", error);
      toast({
        title: "Error",
        description: "Failed to create pipeline. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-muted/30">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Pipeline Templates
          </CardTitle>
          <CardDescription>Ready-to-use pipeline templates for various industries</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Filter className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            </div>
            
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
            >
              <option value="">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0">
                <TableRow>
                  <TableHead>Pipeline Template</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No templates match your search criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTemplates.map((template, index) => (
                    <motion.tr
                      key={template.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/10">
                          {template.industry}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {template.description}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setViewTemplateId(template.id)}
                                  className="h-8 w-8 text-blue-500"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View template</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setCopyTemplateId(template.id)}
                                  className="h-8 w-8 text-green-500"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Use this template</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </CardContent>

      {/* View Template Dialog */}
      <Dialog open={!!viewTemplateId} onOpenChange={(open) => !open && setViewTemplateId(null)}>
        <DialogContent className="max-w-3xl z-[100]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {viewTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              <Badge className="mt-1">{viewTemplate?.industry}</Badge>
              <p className="mt-2">{viewTemplate?.description}</p>
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h3 className="font-medium mb-2">Open Stages</h3>
              <div className="space-y-2">
                {viewTemplate?.openStages.map((stage, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: stage.color }}
                    />
                    <span>{stage.name}</span>
                  </div>
                ))}
              </div>
              
              <h3 className="font-medium mb-2 mt-4">Close Stages</h3>
              <div className="space-y-2">
                {viewTemplate?.closeStages.map((stage, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: stage.color }}
                    />
                    <span>{stage.name}</span>
                    {stage.won && <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs">Won</Badge>}
                    {stage.lost && <Badge variant="outline" className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs">Lost</Badge>}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Custom Fields</h3>
              <div className="space-y-2">
                {viewTemplate?.customFields.map((field, i) => (
                  <div key={i} className="border rounded-md p-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        {field.type}
                      </Badge>
                      <span className="font-medium">{field.name}</span>
                    </div>
                    {field.options && field.options.length > 0 && (
                      <div className="mt-1 text-xs text-muted-foreground flex flex-wrap gap-1">
                        {field.options.map((option, j) => (
                          <Badge key={j} variant="secondary" className="text-xs">
                            {option}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setViewTemplateId(null)}>
              Close
            </Button>
            <Button onClick={() => {
              setCopyTemplateId(viewTemplateId);
              setViewTemplateId(null);
            }}>
              Use This Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Copy Confirmation Dialog */}
      <Dialog open={!!copyTemplateId} onOpenChange={(open) => !open && setCopyTemplateId(null)}>
        <DialogContent className='z-[100]'>
          <DialogHeader>
            <DialogTitle>Create Pipeline from Template</DialogTitle>
            <DialogDescription>
              This will create a new pipeline based on the "{copyTemplate?.name}" template with all its stages and custom fields.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 flex flex-col gap-1 text-sm">
            <p className="font-medium">This template includes:</p>
            <ul className="list-disc list-inside ml-2 space-y-1 text-muted-foreground">
              <li>{copyTemplate?.openStages.length} open stages</li>
              <li>{copyTemplate?.closeStages.length} close stages</li>
              <li>{copyTemplate?.customFields.length} custom fields</li>
            </ul>
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setCopyTemplateId(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCopyTemplate} 
              disabled={isCreating}
              className="flex gap-2 items-center"
            >
              {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
              {isCreating ? 'Creating...' : 'Create Pipeline'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}