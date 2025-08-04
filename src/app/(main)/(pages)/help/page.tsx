'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ChevronRight,
  LifeBuoy,
  Search,
  Info,
  FileText,
  Code,
  MessageSquare,
  BookOpen,
  CheckCircle,
  ArrowRight,
  Users,
  Layers,
  Megaphone,
  PieChart,
  Mail,
  Loader2,
  ThumbsUp,
  X,
  Sparkles,
  Calendar,
  LucideIcon
} from 'lucide-react'

// Component imports
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
} from '@/components/ui/command'

function HelpPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('getting-started')
  const [isLoading, setIsLoading] = useState(false)

  // Get the category from URL params if present
  useEffect(() => {
    const category = searchParams.get('category')
    if (category) {
      setActiveTab(category)
    }
  }, [searchParams])

  // Enable keyboard shortcut for search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // In a real app, you would search your documentation here
    setIsLoading(true)
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
  }

  return (
    <div className="w-full pt-16 pb-16 px-4 mt-8 p-10 h-full overflow-y-auto scrollbar-hide md:px-6 lg:px-8"
        style={{
            maxHeight: 'calc(100vh - 16px)', // Adjust based on your layout
            scrollBehavior: 'auto' // Prevent smooth scrolling which can interfere
        }}>
      <HelpHeader setSearchOpen={setSearchOpen} />

      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="mt-10">
        <div className="flex justify-between items-center mb-8">
          <TabsList className=" bg-accent gap-2 p-1">
            <TabsTrigger value="getting-started" className="rounded-md border-none data-[state=active]:bg-background">
              Getting Started
            </TabsTrigger>

            <TabsTrigger value="contact" className="rounded-md border-none data-[state=active]:bg-background">
              Contact Support
            </TabsTrigger>
          </TabsList>


        </div>

        <TabsContent value="getting-started" className="border-none p-0">
          <GettingStartedTab />
        </TabsContent>

        <TabsContent value="user-guides" className="border-none p-0">
          <UserGuidesTab />
        </TabsContent>

        <TabsContent value="api" className="border-none p-0">
          <ApiDocsTab />
        </TabsContent>

        <TabsContent value="faq" className="border-none p-0">
          <FaqTab />
        </TabsContent>

        <TabsContent value="contact" className="border-none p-0">
          <ContactSupportTab />
        </TabsContent>
      </Tabs>


    </div>
  )
}

// Header Component
function HelpHeader({ setSearchOpen }: { setSearchOpen: (open: boolean) => void }) {
  return (
    <div className="relative overflow-hidden rounded-lg border shadow-sm">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent absolute inset-0" />
      <div className="relative z-10 px-6 py-12 md:py-20 md:px-10">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <LifeBuoy className="mr-1 h-3.5 w-3.5" />
              <span>Help Center</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              How can we help?
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Search our documentation, guides, and FAQs to find answers to your questions about using our CRM platform.
            </p>
            <div className="relative mt-6 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search documentation..."
                className="w-full pl-10 py-6 rounded-md border border-input"
                onClick={() => setSearchOpen(true)}
                onFocus={() => setSearchOpen(true)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                  <span>⌘</span><span>K</span>
                </kbd>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-end">
            <div className="grid grid-cols-2 gap-4">

              <QuickLink
                title="Video Tutorials"
                href="https://zapllo.com/tutorials-zapllo"
                description="Watch step-by-step guides"
                icon={BookOpen}
              />

              <QuickLink
                title="Contact Support"
                href="/help?category=contact"
                description="Get help from our team"
                icon={MessageSquare}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Quick Link Component
function QuickLink({
  title,
  href,
  description,
  icon: Icon
}: {
  title: string
  href: string
  description: string
  icon: LucideIcon
}) {
  const router = useRouter()

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30"
      onClick={() => router.push(href)}
    >
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <Icon className="h-5 w-5 text-primary" />
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

// Getting Started Tab
function GettingStartedTab() {
  const router = useRouter()

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-1 gap-8">
        <div className="col-span-2">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Getting Started with Zapllo CRM</h2>
              <p className="text-muted-foreground mt-2">
                Welcome to Zapllo CRM! This guide will help you set up your account and learn the basics.
              </p>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <div className="bg-primary/10 rounded-full p-2 w-fit mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <CardTitle>Quick Start Guide</CardTitle>
                <CardDescription>Get up and running in 10 minutes or less</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-primary/20 border-2 text-center font-semibold text-primary text-xs">1</div>
                    <div className="ml-3">
                      <h4 className="font-semibold">Create your organization</h4>
                      <p className="text-sm text-muted-foreground">Set up your organization profile and invite team members</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-primary/20 border-2 text-center font-semibold text-primary text-xs">2</div>
                    <div className="ml-3">
                      <h4 className="font-semibold">Import your contacts</h4>
                      <p className="text-sm text-muted-foreground">Import existing contacts or create new ones</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-primary/20 border-2 text-center font-semibold text-primary text-xs">3</div>
                    <div className="ml-3">
                      <h4 className="font-semibold">Set up your pipeline</h4>
                      <p className="text-sm text-muted-foreground">Configure your sales pipeline stages</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-primary/20 border-2 text-center font-semibold text-primary text-xs">4</div>
                    <div className="ml-3">
                      <h4 className="font-semibold">Create your first lead</h4>
                      <p className="text-sm text-muted-foreground">Add leads and start managing your sales process</p>
                    </div>
                  </div>
                </div>
                {/* <Button
                  className="mt-4 w-full"
                  onClick={() => router.push('/help/articles/quick-start-guide')}
                >
                  Read Full Guide
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button> */}
              </CardContent>
            </Card>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <OnboardingCard
                icon={Users}
                title="Setting Up Your Account"
                description="Learn how to set up your user profile, organization, and team members."
                href="/help/articles/setting-up-your-account"
              />
              <OnboardingCard
                icon={Layers}
                title="Building Your Pipeline"
                description="Configure your sales pipeline to match your business process."
                href="/help/articles/building-your-pipeline"
              />
              <OnboardingCard
                icon={Calendar}
                title="Managing Your Calendar"
                description="Connect your calendar and manage appointments with contacts."
                href="/help/articles/calendar-integration"
              />
              <OnboardingCard
                icon={PieChart}
                title="Your First Reports"
                description="Set up your first dashboard and reports to track performance."
                href="/help/articles/creating-reports"
              />
            </div> */}

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                  Complete Onboarding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Follow our guided checklist to set up your CRM completely. Our step-by-step process ensures you get the most from Zapllo CRM.
                </p>
                <Button className="mt-4" variant="outline" onClick={() => router.push('/checklist')}>
                  View Onboarding Checklist
                </Button>
            </CardContent>
            </Card>
          </div>
        </div>

        <div>

        </div>
      </div>
    </div>
  )
}

function OnboardingCard({
  icon: Icon,
  title,
  description,
  href
}: {
  icon: LucideIcon
  title: string
  description: string
  href: string
}) {
  const router = useRouter()

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all"
      onClick={() => router.push(href)}
    >
      <CardHeader className="pb-2">
        <div className="bg-primary/10 rounded-full p-2 w-fit mb-3">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="ghost" className="p-0 h-auto">
          Learn more <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  )
}

// User Guides Tab
function UserGuidesTab() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const categories = [
    { id: 'all', name: 'All Guides' },
    { id: 'contacts', name: 'Contacts & Companies' },
    { id: 'leads', name: 'Leads & Deals' },
    { id: 'email', name: 'Email & Marketing' },
    { id: 'reporting', name: 'Reporting & Analytics' },
    { id: 'settings', name: 'Settings & Admin' },
    { id: 'integrations', name: 'Integrations' },
  ]

  const guides = [
    {
      id: 1,
      title: 'Managing Contacts',
      description: 'Learn how to create, import, and organize your contacts effectively.',
      category: 'contacts',
      icon: Users,
      href: '/help/articles/managing-contacts',
      popular: true,
    },
    {
      id: 2,
      title: 'Sales Pipeline Management',
      description: 'Track and manage your deals through customizable pipeline stages.',
      category: 'leads',
      icon: Layers,
      href: '/help/articles/sales-pipeline',
      popular: true,
    },
    {
      id: 3,
      title: 'Email Campaigns',
      description: 'Create and schedule email campaigns to engage with your customers.',
      category: 'email',
      icon: Mail,
      href: '/help/articles/email-campaigns',
      popular: true,
    },
    {
      id: 4,
      title: 'Performance Analytics',
      description: 'Analyze your sales performance and team productivity.',
      category: 'reporting',
      icon: PieChart,
      href: '/help/articles/performance-analytics',
      popular: false,
    },
    {
      id: 5,
      title: 'User & Team Management',
      description: 'Add users and configure permissions for your team.',
      category: 'settings',
      icon: Users,
      href: '/help/articles/user-management',
      popular: false,
    },
    {
      id: 6,
      title: 'Custom Fields & Properties',
      description: 'Configure custom fields to store your specific business data.',
      category: 'settings',
      icon: FileText,
      href: '/help/articles/custom-fields',
      popular: false,
    },
    {
      id: 7,
      title: 'API & Webhooks',
      description: 'Integrate your CRM with other systems using our API.',
      category: 'integrations',
      icon: Code,
      href: '/help/articles/api-webhooks',
      popular: true,
    },
    {
      id: 8,
      title: 'Zapier Integration',
      description: 'Connect your CRM with 3000+ apps without coding.',
      category: 'integrations',
      icon: Code,
      href: '/help/articles/zapier-integration',
      popular: false,
    },
  ]

  const filteredGuides = activeCategory === 'all'
    ? guides
    : guides.filter(guide => guide.category === activeCategory)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">User Guides</h2>
        <p className="text-muted-foreground mt-2">
          Detailed documentation on how to use every feature of Zapllo CRM.
        </p>
      </div>

      <div className="flex overflow-auto pb-2 hide-scrollbar">
        <div className="flex gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category.id)}
              className="whitespace-nowrap"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuides.map((guide) => (
          <Card
            key={guide.id}
            className="cursor-pointer hover:shadow-md transition-all"
            onClick={() => router.push(guide.href)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="bg-primary/10 rounded-full p-2 w-fit">
                  <guide.icon className="h-4 w-4 text-primary" />
                </div>
                {guide.popular && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    Popular
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg mt-3">{guide.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{guide.description}</p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="ghost" className="p-0 h-auto" onClick={(e) => {
                e.stopPropagation();
                router.push(guide.href);
              }}>
                Read guide <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredGuides.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Info className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No guides found</h3>
          <p className="text-muted-foreground mt-2 mb-6">
            We couldn't find any guides in this category. Please try another category.
          </p>
          <Button onClick={() => setActiveCategory('all')}>
            View all guides
          </Button>
        </div>
      )}

      <Separator className="my-10" />

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-0">
          <div className="p-6 flex flex-col justify-center">
            <h3 className="text-xl font-bold mb-2">Can't find what you're looking for?</h3>
            <p className="text-muted-foreground">
              Our support team is here to help you with any questions or issues you might have.
            </p>
            <Button className="mt-6 w-fit" onClick={() => router.push('/help?category=contact')}>
              Contact Support
            </Button>
          </div>
          <div className="bg-muted/50 p-6 border-t lg:border-t-0 lg:border-l">
            <h4 className="font-medium mb-3">Related Resources</h4>
            <ul className="space-y-3">
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary"
                  onClick={() => router.push('/help/articles')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Browse all documentation articles
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary"
                  onClick={() => router.push('/help/videos')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Watch video tutorials
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary"
                  onClick={() => router.push('/help?category=faq')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Check frequently asked questions
                </Button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// API Docs Tab
function ApiDocsTab() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<string>('overview')

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">API Documentation</h2>
        <p className="text-muted-foreground mt-2">
          Integrate with Zapllo CRM using our robust RESTful API.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-1">
          <Button
              variant={activeSection === 'overview' ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setActiveSection('overview')}
            >
              Overview
            </Button>

            <Button
              variant={activeSection === 'authentication' ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setActiveSection('authentication')}
            >
              Authentication
            </Button>

            <Button
              variant={activeSection === 'endpoints' ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setActiveSection('endpoints')}
            >
              API Endpoints
            </Button>

            <Button
              variant={activeSection === 'webhooks' ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setActiveSection('webhooks')}
            >
              Webhooks
            </Button>

            <Button
              variant={activeSection === 'sdks' ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setActiveSection('sdks')}
            >
              SDKs & Libraries
            </Button>

            <Button
              variant={activeSection === 'rate-limits' ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setActiveSection('rate-limits')}
            >
              Rate Limits
            </Button>

            <Button
              variant={activeSection === 'pagination' ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setActiveSection('pagination')}
            >
              Pagination
            </Button>

            <Button
              variant={activeSection === 'errors' ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setActiveSection('errors')}
            >
              Error Handling
            </Button>

            <Separator className="my-4" />

            <div className="p-4 bg-muted/50 rounded-lg border">
              <h4 className="font-medium text-sm">Need help with API?</h4>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                Contact our developer support team for assistance with API integration.
              </p>
              <Button size="sm" className="w-full" variant="outline" onClick={() => router.push('/help?category=contact')}>
                Developer Support
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Overview</CardTitle>
                  <CardDescription>
                    The Zapllo CRM API enables you to access and manipulate CRM data programmatically.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium">Base URL</h3>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm mt-2">
                      https://api.zapllo.com/v1
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium">What You Can Do</h3>
                    <ul className="mt-2 space-y-2">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                        <span>Manage contacts, companies, and deals</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                        <span>Create and track activities</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                        <span>Send emails and manage templates</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                        <span>Access reporting and analytics data</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                        <span>Manage users and permissions</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium">Getting Started</h3>
                    <ol className="mt-2 space-y-2 ml-5 list-decimal">
                      <li className="pl-1">
                        <span className="font-medium">Get API Keys</span>
                        <p className="text-sm text-muted-foreground mt-1">
                          Generate API keys in your account settings.
                        </p>
                      </li>
                      <li className="pl-1">
                        <span className="font-medium">Authenticate Requests</span>
                        <p className="text-sm text-muted-foreground mt-1">
                          Use your API key to authenticate API requests.
                        </p>
                      </li>
                      <li className="pl-1">
                        <span className="font-medium">Make API Calls</span>
                        <p className="text-sm text-muted-foreground mt-1">
                          Start making API calls to manage your CRM data.
                        </p>
                      </li>
                    </ol>
                  </div>

                  <Button onClick={() => setActiveSection('authentication')}>
                    Get Started with API
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Example API Request</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md overflow-hidden">
                    <div className="bg-muted text-sm font-mono p-3 flex justify-between items-center border-b">
                      <span>Request</span>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                        >
                          <path
                            d="M1 9.50006C1 10.3285 1.67157 11.0001 2.5 11.0001H4L4 10.0001H2.5C2.22386 10.0001 2 9.7762 2 9.50006L2 2.50006C2 2.22392 2.22386 2.00006 2.5 2.00006L9.5 2.00006C9.77614 2.00006 10 2.22392 10 2.50006V4.00002H5.5C4.67157 4.00002 4 4.67159 4 5.50002V12.5001C4 13.3285 4.67157 14.0001 5.5 14.0001H12.5C13.3284 14.0001 14 13.3285 14 12.5001V5.50002C14 4.67159 13.3284 4.00002 12.5 4.00002H11V2.50006C11 1.67163 10.3284 1.00006 9.5 1.00006H2.5C1.67157 1.00006 1 1.67163 1 2.50006V9.50006ZM5 5.50002C5 5.22388 5.22386 5.00002 5.5 5.00002H12.5C12.7761 5.00002 13 5.22388 13 5.50002V12.5001C13 12.7762 12.7761 13.0001 12.5 13.0001H5.5C5.22386 13.0001 5 12.7762 5 12.5001V5.50002Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </Button>
                    </div>
                    <div className="bg-black text-white p-4 text-sm font-mono overflow-x-auto">
                      <pre>{`curl -X GET "https://api.zapllo.com/v1/contacts" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</pre>
                    </div>
                  </div>

                  <div className="rounded-md overflow-hidden mt-4">
                    <div className="bg-muted text-sm font-mono p-3 flex justify-between items-center border-b">
                      <span>Response</span>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                        >
                          <path
                            d="M1 9.50006C1 10.3285 1.67157 11.0001 2.5 11.0001H4L4 10.0001H2.5C2.22386 10.0001 2 9.7762 2 9.50006L2 2.50006C2 2.22392 2.22386 2.00006 2.5 2.00006L9.5 2.00006C9.77614 2.00006 10 2.22392 10 2.50006V4.00002H5.5C4.67157 4.00002 4 4.67159 4 5.50002V12.5001C4 13.3285 4.67157 14.0001 5.5 14.0001H12.5C13.3284 14.0001 14 13.3285 14 12.5001V5.50002C14 4.67159 13.3284 4.00002 12.5 4.00002H11V2.50006C11 1.67163 10.3284 1.00006 9.5 1.00006H2.5C1.67157 1.00006 1 1.67163 1 2.50006V9.50006ZM5 5.50002C5 5.22388 5.22386 5.00002 5.5 5.00002H12.5C12.7761 5.00002 13 5.22388 13 5.50002V12.5001C13 12.7762 12.7761 13.0001 12.5 13.0001H5.5C5.22386 13.0001 5 12.7762 5 12.5001V5.50002Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </Button>
                    </div>
                    <div className="bg-black text-white p-4 text-sm font-mono overflow-x-auto">
                      <pre>{`{
  "data": [
    {
      "id": "cnt_12345",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "whatsappNumber": "+1234567890",
      "company": {
        "id": "cmp_67890",
        "name": "Acme Inc."
      },
      "createdAt": "2023-04-12T10:23:15Z",
      "updatedAt": "2023-04-12T10:23:15Z"
    },
    // More contacts...
  ],
  "pagination": {
    "totalCount": 125,
    "page": 1,
    "pageSize": 10,
    "totalPages": 13
  }
}`}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'authentication' && (
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>
                  Learn how to authenticate your API requests to access Zapllo CRM data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium">API Key Authentication</h3>
                  <p className="text-muted-foreground mt-2">
                    All API requests must include your API key for authentication. You can get your API key from the Settings / API section in your Zapllo CRM account.
                  </p>

                  <div className="mt-4 bg-muted p-4 rounded-md">
                    <h4 className="text-sm font-medium">API Key in Header</h4>
                    <div className="bg-black text-white p-3 rounded-md mt-2 font-mono text-sm overflow-x-auto">
                      <pre>Authorization: Bearer YOUR_API_KEY</pre>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">Getting Your API Key</h3>
                  <ol className="mt-2 space-y-3 ml-5 list-decimal">
                    <li className="pl-1">Go to Settings / API in your Zapllo CRM dashboard</li>
                    <li className="pl-1">Click on "Generate API Key" button</li>
                    <li className="pl-1">Give your key a name and select appropriate permissions</li>
                    <li className="pl-1">Copy and securely store your API key</li>
                  </ol>
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-4 mt-4">
                    <div className="flex">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 mr-3">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                      <div>
                        <h3 className="font-medium text-amber-800 dark:text-amber-300">Important Security Note</h3>
                        <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                          Your API key provides full access to your CRM data. Never share it publicly or commit it to source code repositories.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">API Key Permissions</h3>
                  <p className="text-muted-foreground mt-2">
                    When creating an API key, you can specify what permissions it has:
                  </p>
                  <div className="mt-3 space-y-3">
                    <div className="flex p-3 border rounded-md">
                      <div className="w-24 font-medium">Read</div>
                      <div className="flex-1 text-sm text-muted-foreground">Can only view data, cannot make changes</div>
                    </div>
                    <div className="flex p-3 border rounded-md">
                      <div className="w-24 font-medium">Write</div>
                      <div className="flex-1 text-sm text-muted-foreground">Can create, update and delete records</div>
                    </div>
                    <div className="flex p-3 border rounded-md">
                      <div className="w-24 font-medium">Admin</div>
                      <div className="flex-1 text-sm text-muted-foreground">Full access to all resources including user management</div>
                    </div>
                  </div>
                </div>

                <Button onClick={() => setActiveSection('endpoints')}>
                  Next: API Endpoints
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {activeSection === 'endpoints' && (
            <Card>
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
                <CardDescription>
                  Overview of available API endpoints to interact with your CRM data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-6">
                    <ApiEndpointSection
                      title="Contacts"
                      description="Manage your contact information"
                      endpoints={[
                        { method: "GET", path: "/contacts", description: "List all contacts" },
                        { method: "GET", path: "/contacts/{id}", description: "Retrieve a single contact" },
                        { method: "POST", path: "/contacts", description: "Create a new contact" },
                        { method: "PUT", path: "/contacts/{id}", description: "Update a contact" },
                        { method: "DELETE", path: "/contacts/{id}", description: "Delete a contact" },
                      ]}
                    />

                    <ApiEndpointSection
                      title="Companies"
                      description="Manage company information"
                      endpoints={[
                        { method: "GET", path: "/companies", description: "List all companies" },
                        { method: "GET", path: "/companies/{id}", description: "Retrieve a single company" },
                        { method: "POST", path: "/companies", description: "Create a new company" },
                        { method: "PUT", path: "/companies/{id}", description: "Update a company" },
                        { method: "DELETE", path: "/companies/{id}", description: "Delete a company" },
                      ]}
                    />

                    <ApiEndpointSection
                      title="Leads"
                      description="Manage leads and deals"
                      endpoints={[
                        { method: "GET", path: "/leads", description: "List all leads" },
                        { method: "GET", path: "/leads/{id}", description: "Retrieve a single lead" },
                        { method: "POST", path: "/leads", description: "Create a new lead" },
                        { method: "PUT", path: "/leads/{id}", description: "Update a lead" },
                        { method: "DELETE", path: "/leads/{id}", description: "Delete a lead" },
                        { method: "GET", path: "/leads/{id}/timeline", description: "Get lead timeline" },
                      ]}
                    />

                    <ApiEndpointSection
                      title="Activities"
                      description="Track calls, emails, and tasks"
                      endpoints={[
                        { method: "GET", path: "/activities", description: "List all activities" },
                        { method: "GET", path: "/activities/{id}", description: "Retrieve a single activity" },
                        { method: "POST", path: "/activities", description: "Create a new activity" },
                        { method: "PUT", path: "/activities/{id}", description: "Update an activity" },
                        { method: "DELETE", path: "/activities/{id}", description: "Delete an activity" },
                      ]}
                    />

                    <ApiEndpointSection
                      title="Users"
                      description="Manage users and permissions"
                      endpoints={[
                        { method: "GET", path: "/users", description: "List all users" },
                        { method: "GET", path: "/users/{id}", description: "Retrieve a single user" },
                        { method: "POST", path: "/users", description: "Create a new user" },
                        { method: "PUT", path: "/users/{id}", description: "Update a user" },
                        { method: "DELETE", path: "/users/{id}", description: "Delete a user" },
                      ]}
                    />

                    <ApiEndpointSection
                      title="Webhooks"
                      description="Manage webhooks for real-time notifications"
                      endpoints={[
                        { method: "GET", path: "/webhooks", description: "List all webhooks" },
                        { method: "GET", path: "/webhooks/{id}", description: "Retrieve a single webhook" },
                        { method: "POST", path: "/webhooks", description: "Create a new webhook" },
                        { method: "PUT", path: "/webhooks/{id}", description: "Update a webhook" },
                        { method: "DELETE", path: "/webhooks/{id}", description: "Delete a webhook" },
                      ]}
                    />
                  </div>
                </ScrollArea>

                <div className="py-4 flex justify-between">
                  <Button variant="outline" onClick={() => setActiveSection('authentication')}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                      <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Authentication
                  </Button>
                  <Button onClick={() => setActiveSection('webhooks')}>
                    Webhooks
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional sections for webhooks, sdks, rate-limits would go here */}

        </div>
      </div>
    </div>
  )
}

type EndpointProps = {
  method: string;
  path: string;
  description: string;
}

function ApiEndpointSection({
  title,
  description,
  endpoints
}: {
  title: string;
  description: string;
  endpoints: EndpointProps[];
}) {
  return (
    <div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>

      <div className="mt-3 space-y-2">
        {endpoints.map((endpoint, i) => (
          <div
            key={i}
            className="flex items-center p-3 rounded-md border hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <Badge
              variant="outline"
              className={`mr-3 font-mono ${
                endpoint.method === "GET" ? "text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-900 dark:bg-green-950/30" :
                endpoint.method === "POST" ? "text-blue-600 border-blue-200 bg-blue-50 dark:text-blue-400 dark:border-blue-900 dark:bg-blue-950/30" :
                endpoint.method === "PUT" ? "text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-900 dark:bg-amber-950/30" :
                "text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-900 dark:bg-red-950/30"
              }`}
            >
              {endpoint.method}
            </Badge>
            <code className="font-mono text-sm">{endpoint.path}</code>
            <span className="text-sm text-muted-foreground ml-4">{endpoint.description}</span>
            <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </div>
        ))}
      </div>
    </div>
  )
}

// FAQ Tab
function FaqTab() {
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({0: true})

  const toggleItem = (index: number) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const faqs = [
    {
      question: "How do I import contacts into the CRM?",
      answer: "You can import contacts by going to the Contacts section, clicking on 'Import' and uploading a CSV file with your contact data. Make sure your CSV file matches our template format for a smooth import process."
    },
    {
      question: "Can I customize my sales pipeline stages?",
      answer: "Yes, you can customize your sales pipeline stages to match your business process. Go to Settings > Pipeline Settings, where you can add, edit, or remove stages, and reorder them by dragging and dropping."
    },
    {
      question: "How do I set up email templates?",
      answer: "To create email templates, navigate to Settings > Email Templates and click 'New Template'. You can design your template using our visual editor, add merge tags for personalization, and save it for future use in email campaigns or individual emails."
    },
    {
      question: "How do I integrate with other applications?",
      answer: "You can integrate Zapllo CRM with other applications through our API, webhooks, or using Zapier. Go to Settings > Integrations to set up API keys, configure webhooks, or connect with Zapier to link with 3000+ other apps."
    },
    {
      question: "How do I add team members to my CRM?",
      answer: "To add team members, go to Settings > Users & Teams, click 'Invite User', enter their email address, select their role, and click 'Send Invitation'. They'll receive an email invitation to join your CRM."
    },
    {
      question: "What are the different user roles available?",
      answer: "Zapllo CRM offers several built-in roles: Admin (full access), Manager (can manage team and data), Regular User (standard access), and Viewer (read-only access). You can also create custom roles with specific permissions."
    },
    {
      question: "How do I export my CRM data?",
      answer: "To export data, go to the section you want to export (Contacts, Leads, etc.), click on the 'Export' button, select your preferred file format (CSV or Excel), choose what fields to include, and click 'Export'."
    },
    {
      question: "How secure is my data in Zapllo CRM?",
      answer: "Zapllo CRM implements enterprise-grade security measures including data encryption at rest and in transit, regular security audits, multi-factor authentication, and compliance with major security standards to ensure your data is secure."
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        <p className="text-muted-foreground mt-2">
          Quick answers to common questions about using Zapllo CRM.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-muted/50 p-6 rounded-lg border space-y-2">
          <h3 className="font-medium text-lg">Popular Topics</h3>
          <div className="space-y-1 mt-3">
            {["Getting Started", "Contacts & Companies", "Leads & Deals", "Email Marketing", "Reporting", "Billing & Plans", "Security", "Integrations"].map((topic, i) => (
              <Button key={i} variant="ghost" className="w-full justify-start h-auto py-2">
                {topic}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-muted/50 p-6 rounded-lg border">
          <h3 className="font-medium text-lg mb-3">Can't find an answer?</h3>
          <p className="text-muted-foreground text-sm mb-4">
            If you can't find the answer to your question in our FAQ, please contact our support team.
          </p>
          <Button onClick={() => {}}>Contact Support</Button>
        </div>
      </div>

      <div className="space-y-4 mt-8">
        {faqs.map((faq, i) => (
          <Card key={i} className="overflow-hidden">
            <div
              className="p-6 flex justify-between items-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleItem(i)}
            >
              <h3 className="font-medium">{faq.question}</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {openItems[i] ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
              )}
              </Button>
            </div>
            {openItems[i] && (
              <CardContent className="pt-0 pb-6 px-6">
                <Separator className="my-3" />
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Still need help?</CardTitle>
          <CardDescription>
            If you can't find the answer to your question, our support team is here to help.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-medium mb-2">Contact Support</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our support team is available 24/7 to help you with any questions or issues.
            </p>
            <Button onClick={() => {}}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </div>
          <div>
            <h3 className="font-medium mb-2">Join the Community</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with other Zapllo CRM users to share tips and best practices.
            </p>
            <Button variant="outline" onClick={() => {}}>
              <Users className="mr-2 h-4 w-4" />
              Join Community
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Contact Support Tab
function ContactSupportTab() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [category, setCategory] = useState("")
  const [priorityLevel, setPriorityLevel] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const router =useRouter();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      // Reset form
      setName("")
      setEmail("")
      setSubject("")
      setMessage("")
      setCategory("")
      setPriorityLevel("")
    }, 1500)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-green-100 dark:bg-green-900/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-green-600 dark:text-green-400">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2">Support Request Submitted</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          Thank you for contacting us. We have received your support request and will get back to you shortly.
        </p>
        <div className="p-4 border rounded-md bg-muted/50 max-w-md w-full">
          <h4 className="font-medium mb-2">What happens next?</h4>
          <ul className="space-y-2 text-sm text-muted-foreground text-left">
            <li className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 text-primary shrink-0">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>You'll receive a confirmation email with your ticket number</span>
            </li>
            <li className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 text-primary shrink-0">
                <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"></path>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>A support agent will review your request (typically within 24 hours)</span>
            </li>
            <li className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 text-primary shrink-0">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>A support agent will contact you via email or phone</span>
            </li>
          </ul>
        </div>
        <div className="mt-8">
          <Button variant="outline" onClick={() => setSubmitted(false)}>
            Submit Another Request
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Contact Support</h2>
        <p className="text-muted-foreground mt-2">
          Need help with Zapllo CRM? Our support team is here to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Support Request</CardTitle>
              <CardDescription>
                Fill out this form with details about your issue and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">
                      Issue Category
                    </label>
                    <select
                      id="category"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select category</option>
                      <option value="account">Account</option>
                      <option value="billing">Billing</option>
                      <option value="technical">Technical Issue</option>
                      <option value="feature">Feature Request</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="priority" className="text-sm font-medium">
                      Priority Level
                    </label>
                    <select
                      id="priority"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={priorityLevel}
                      onChange={e => setPriorityLevel(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select priority</option>
                      <option value="low">Low - General question</option>
                      <option value="medium">Medium - Need assistance</option>
                      <option value="high">High - System issue</option>
                      <option value="critical">Critical - System down</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Please provide details about your issue or question"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Please include any error messages, steps to reproduce, and relevant screenshots.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    I understand that my information will be processed as described in the <a href="#" className="text-primary underline">Privacy Policy</a>.
                  </label>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting Request...
                    </>
                  ) : "Submit Support Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-3 text-primary">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <div>
                  <h3 className="font-medium text-sm">Phone Support</h3>
                  <p className="text-sm text-muted-foreground">+91 8910748670</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Monday - Friday, 9:00 AM - 5:00 PM IST
                  </p>
                </div>
              </div>

              <div className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-3 text-primary">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <div>
                  <h3 className="font-medium text-sm">Email Support</h3>
                  <p className="text-sm text-muted-foreground">support@zapllo.com</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    We aim to respond within 24 hours
                  </p>
                </div>
              </div>

              <div className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-3 text-primary">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <div>
                  <h3 className="font-medium text-sm">Live Chat</h3>
                  <p className="text-sm text-muted-foreground">Available in your dashboard</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    24/7 for Premium and Enterprise plans
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Monday - Friday</span>
                  <span className="text-sm font-medium">9:00 AM - 8:00 PM IST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Saturday</span>
                  <span className="text-sm font-medium">10:00 AM - 6:00 PM IST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Sunday</span>
                  <span className="text-sm font-medium">Closed</span>
                </div>
                <Separator className="my-2" />
                <p className="text-xs text-muted-foreground">
                  Premium and Enterprise plans have access to 24/7 emergency support.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>View Your Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Track the status of your existing support requests
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/help/tickets')}
              >
                View Support Tickets
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Main component with Suspense
export default function HelpPage() {
  return (
    <Suspense fallback={
      <div className="container max-w-7xl mx-auto p-10 mt-12 py-8 flex justify-center items-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary/70" />
      </div>
    }>
      <HelpPageContent />
    </Suspense>
  )
}
