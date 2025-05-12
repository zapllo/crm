"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Filter,
  Users,
  BarChart3,
  Target,
  MessagesSquare,
  CheckCircle2,
  ArrowRight,
  Clock,
  Award,
  UserCheck,
  BadgePercent,
  FileCheck,
  Share2,
  BarChart4,
  Shuffle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import AIAutomationForm from "./aiautomation";

export default function LeadQualificationDemo() {
  const [activeTab, setActiveTab] = useState("demo");
  const [selectedScore, setSelectedScore] = useState<number | null>(null);

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Sample lead qualification criteria
  const qualificationCriteria = [
    { name: "Budget", weight: 25 },
    { name: "Authority", weight: 20 },
    { name: "Need", weight: 30 },
    { name: "Timeline", weight: 15 },
    { name: "Fit", weight: 10 }
  ];

  // Sample leads for visualization
  const sampleLeads = [
    { name: "Acme Corporation", score: 92, status: "Hot Lead", department: "Technology", source: "Website" },
    { name: "Summit Enterprises", score: 78, status: "Qualified", department: "Manufacturing", source: "LinkedIn" },
    { name: "Horizon Group", score: 45, status: "Nurturing", department: "Retail", source: "Trade Show" },
    { name: "Stellar Solutions", score: 83, status: "Qualified", department: "Healthcare", source: "Referral" },
    { name: "Global Ventures", score: 67, status: "Warm Lead", department: "Finance", source: "Webinar" }
  ];

  // Lead details component for interactive visualization
  const LeadDetails = ({ lead }: { lead: typeof sampleLeads[0] }) => (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
          {lead.name.charAt(0)}
        </div>
        <div className="ml-3">
          <h3 className="font-semibold">{lead.name}</h3>
          <p className="text-sm text-muted-foreground">{lead.department}</p>
        </div>
        <Badge
          className="ml-auto"
          variant={lead.score > 80 ? "default" : lead.score > 60 ? "outline" : "secondary"}
        >
          {lead.status}
        </Badge>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Lead Score</span>
          <span className="font-medium">{lead.score}/100</span>
        </div>
        <Progress value={lead.score} className="h-2" />
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-muted-foreground" />
          <span>Sales Rep: <span className="font-medium">Alex Wong</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-muted-foreground" />
          <span>Source: <span className="font-medium">{lead.source}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>Follow-up: <span className="font-medium">1 day</span></span>
        </div>
        <div className="flex items-center gap-2">
          <BadgePercent className="h-4 w-4 text-muted-foreground" />
          <span>Close Probability: <span className="font-medium">{Math.round(lead.score * 0.8)}%</span></span>
        </div>
      </div>
    </div>
  );

  // Benefits data
  const benefits = [
    {
      icon: <Filter className="h-10 w-10 text-primary" />,
      title: "Intelligent Lead Scoring",
      description: "Automatically evaluate leads based on customizable qualification criteria and scoring models."
    },
    {
      icon: <MessagesSquare className="h-10 w-10 text-primary" />,
      title: "Conversational Qualification",
      description: "Natural conversations that collect vital information without feeling like a form or survey."
    },
    {
      icon: <Shuffle className="h-10 w-10 text-primary" />,
      title: "Smart Lead Routing",
      description: "Automatically direct qualified leads to the right sales representatives based on territory, specialty, or capacity."
    },
    {
      icon: <BarChart4 className="h-10 w-10 text-primary" />,
      title: "Actionable Insights",
      description: "Detailed analytics on lead quality, qualification patterns, and conversion opportunities."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      {/* Hero Section */}
      <section className="container px-4 py-20 mx-auto">
        <motion.div
          className="flex flex-col items-center text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/50">
            LEAD QUALIFICATION
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-amber-500">
            Qualify Leads at Scale with AI
          </h1>

          <p className="text-xl max-w-3xl text-muted-foreground mb-8">
            Our AI lead qualification agent engages with prospects, asks the right questions,
            scores leads instantly, and routes them to your sales team - all without human intervention.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="gap-2 group"
              onClick={() => setActiveTab("demo")}
            >
              See It In Action <Filter className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={() => window.open("https://calendly.com/zapllo/lead-qualification-demo", "_blank")}
            >
              Talk to Sales <Users className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Interactive Tabs */}
        <Tabs
          defaultValue="demo"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-w-5xl mx-auto"
        >
          <TabsList className="grid w-full grid-cols-3 mb-12 bg-accent ">
            <TabsTrigger className='border-none' value="demo">Get Demo</TabsTrigger>
            <TabsTrigger className='border-none' value="features">How It Works</TabsTrigger>
            <TabsTrigger className='border-none' value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="demo">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="backdrop-blur-sm bg-card/90 border border-primary/10 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Filter className="h-6 w-6 text-primary" />
                    Experience Our Lead Qualification AI
                  </CardTitle>
                  <CardDescription>
                    Get a personalized demo of our AI lead qualification agent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AIAutomationForm agentType="lead-qualification" />
                </CardContent>
                <CardFooter className="border-t border-border/40 pt-4 text-sm text-muted-foreground">
                  Our AI agent will contact you to demonstrate the lead qualification process
                </CardFooter>
              </Card>

              <div className="space-y-6">
                <motion.div
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                >
                  <Card className="bg-primary/5 border-primary/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Interactive Lead Scoring Model</CardTitle>
                      <CardDescription>Click a category to see how leads are scored</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {qualificationCriteria.map((criteria, index) => (
                          <Button
                            key={index}
                            variant={selectedScore === index ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedScore(index)}
                            className="group"
                          >
                            {criteria.name}
                            <Badge variant="outline" className="ml-2 bg-background group-hover:bg-primary/10">
                              {criteria.weight}%
                            </Badge>
                          </Button>
                        ))}
                      </div>

                      {selectedScore !== null && (
                        <div className="p-4 border rounded-md bg-background text-sm">
                          <h3 className="font-medium mb-2">
                            {qualificationCriteria[selectedScore].name} Assessment
                          </h3>
                          <p className="text-muted-foreground mb-3">
                            {selectedScore === 0 && "Evaluates if the prospect has the financial resources to purchase your product/service."}
                            {selectedScore === 1 && "Determines if the contact has decision-making power or influence in the buying process."}
                            {selectedScore === 2 && "Assesses how urgently the prospect requires your solution to solve their problems."}
                            {selectedScore === 3 && "Identifies when the prospect plans to make a purchase decision."}
                            {selectedScore === 4 && "Evaluates how well your solution matches the prospect's specific requirements."}
                          </p>

                          <div className="space-y-2">
                            <p className="font-medium">Sample Questions:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                              {selectedScore === 0 && (
                                <>
                                  <li>What budget have you allocated for this project?</li>
                                  <li>What's your typical investment for solutions like this?</li>
                                  <li>Are you currently investing in similar solutions?</li>
                                </>
                              )}
                              {selectedScore === 1 && (
                                <>
                                  <li>Who else is involved in making this decision?</li>
                                  <li>What's your role in the selection process?</li>
                                  <li>Who would need to approve the final purchase?</li>
                                </>
                              )}
                              {selectedScore === 2 && (
                                <>
                                  <li>What challenges are you trying to solve?</li>
                                  <li>How is this issue affecting your business?</li>
                                  <li>What happens if you don't address this problem?</li>
                                </>
                              )}
                              {selectedScore === 3 && (
                                <>
                                  <li>When are you looking to implement this solution?</li>
                                  <li>Is there a specific event driving your timeline?</li>
                                  <li>What's your decision-making timeframe?</li>
                                </>
                              )}
                              {selectedScore === 4 && (
                                <>
                                  <li>What specific features are most important to you?</li>
                                  <li>How many users/employees would be using this solution?</li>
                                  <li>What integrations would you require?</li>
                                </>
                              )}
                            </ul>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Sample Lead Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <LeadDetails lead={sampleLeads[0]} />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features">
            <motion.div
              className="grid md:grid-cols-2 gap-6 mb-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className="group"
                >
                  <Card className="h-full hover:shadow-md transition-all duration-300 border border-primary/10 group-hover:border-primary/30">
                    <CardHeader>
                      <div className="mb-4 group-hover:scale-110 transition-transform duration-300">{benefit.icon}</div>
                      <CardTitle>{benefit.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="grid md:grid-cols-5 gap-8 mb-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.div variants={fadeIn} className="md:col-span-3">
                <Card className="h-full border-primary/10">
                  <CardHeader>
                    <CardTitle className="text-xl">The Lead Qualification Process</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {[
                        {
                          step: 1,
                          title: "Initial Engagement",
                          description: "AI agent engages with prospects across channels (web, email, social) in natural conversation.",
                          icon: <MessagesSquare className="h-6 w-6 text-primary" />
                        },
                        {
                          step: 2,
                          title: "Data Collection",
                          description: "Agent asks strategic qualifying questions based on your BANT or custom criteria.",
                          icon: <FileCheck className="h-6 w-6 text-primary" />
                        },
                        {
                          step: 3,
                          title: "Lead Scoring",
                          description: "Responses are analyzed in real-time and leads are scored according to your customized model.",
                          icon: <BarChart3 className="h-6 w-6 text-primary" />
                        },
                        {
                          step: 4,
                          title: "Routing & Handoff",
                          description: "Qualified leads are routed to appropriate sales reps with complete conversation context.",
                          icon: <Shuffle className="h-6 w-6 text-primary" />
                        }
                      ].map((process, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                            {process.step}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {process.icon}
                              <h3 className="font-semibold">{process.title}</h3>
                            </div>
                            <p className="text-muted-foreground">{process.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeIn} className="md:col-span-2">
                <Card className="h-full bg-primary/5 border-primary/10">
                  <CardHeader>
                    <CardTitle className="text-xl">Integration Ecosystem</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">Our AI agent seamlessly connects with your existing tools:</p>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          "Salesforce", "HubSpot", "Pipedrive", "Zendesk",
                          "Microsoft Dynamics", "Zoho CRM", "Marketo", "Intercom"
                        ].map((tool, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 rounded-md border bg-background">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span className="text-sm">{tool}</span>
                          </div>
                        ))}
                      </div>

                      <Separator className="my-4" />

                      <div className="p-3 bg-background rounded-md">
                        <h4 className="font-medium mb-1">Custom Integrations</h4>
                        <p className="text-sm text-muted-foreground">
                          Our open API allows for integration with virtually any CRM or marketing automation platform.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <div className="text-center">
              <Button
                size="lg"
                onClick={() => setActiveTab("demo")}
                className="gap-2"
              >
                Get Started Today <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="results">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <motion.div
                variants={fadeIn}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                <Card className="h-full bg-primary/5 border-primary/10">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Target className="h-6 w-6 text-primary" />
                      Key Performance Improvements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {[
                        { label: "Lead Qualification Rate", value: "3.4x", description: "More leads qualified per day compared to manual processes" },
                        { label: "Response Time", value: "< 10 sec", description: "Instant engagement with new leads, 24/7/365" },
                        { label: "Conversion Rate", value: "+63%", description: "Increase in lead-to-opportunity conversion" },
                        { label: "Sales Productivity", value: "+41%", description: "More time for sales reps to focus on closing deals" }
                      ].map((metric, index) => (
                        <div key={index} className="flex items-start">
                          <div className="w-20 h-20 flex-shrink-0 rounded-full bg-primary/10 border border-primary/20 flex flex-col items-center justify-center mr-4">
                            <span className="text-xl font-bold text-primary">{metric.value}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{metric.label}</h3>
                            <p className="text-muted-foreground">{metric.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={fadeIn}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-2xl">Lead Quality Dashboard</CardTitle>
                    <CardDescription>Sample visualization of qualified leads</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between mb-2">
                      <div className="space-y-1">
                        <div className="text-3xl font-bold">{sampleLeads.length}</div>
                        <div className="text-sm text-muted-foreground">Qualified Today</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-3xl font-bold text-primary">73%</div>
                        <div className="text-sm text-muted-foreground">Avg. Score</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-3xl font-bold text-green-500">89%</div>
                        <div className="text-sm text-muted-foreground">Acceptance Rate</div>
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-3 p-3 bg-muted/50 font-medium text-sm">
                        <div>Lead</div>
                        <div>Score</div>
                        <div>Status</div>
                      </div>
                      <div className="divide-y">
                        {sampleLeads.map((lead, i) => (
                          <div key={i} className="grid grid-cols-3 p-3 text-sm hover:bg-muted/30 transition-colors">
                            <div>{lead.name}</div>
                            <div>
                              <span
                                className={
                                  lead.score > 80 ? "text-green-500" :
                                    lead.score > 60 ? "text-amber-500" :
                                      "text-muted-foreground"
                                }
                              >
                                {lead.score}/100
                              </span>
                            </div>
                            <div>
                              <Badge variant="outline" className="font-normal">
                                {lead.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-dashed border-primary/30 flex items-center gap-3">
                      <Award className="h-8 w-8 text-amber-500" />
                      <div>
                        <p className="font-medium">Your sales team could be working with pre-qualified leads like these</p>
                        <p className="text-sm text-muted-foreground">No more wasting time on prospects who aren't ready to buy</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <Card className="border-primary/10 mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Client Success Stories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    {
                      company: "TechPoint Solutions",
                      industry: "SaaS",
                      quote: "We've increased our sales team efficiency by 47% and shortened our sales cycle by 2 weeks.",
                      stat: "3.1x ROI"
                    },
                    {
                      company: "Summit Financial",
                      industry: "Financial Services",
                      quote: "Our advisors now only speak with high-quality leads, increasing their conversion rate from 12% to 28%.",
                      stat: "133% Increase"
                    },
                    {
                      company: "GrowSmart Agency",
                      industry: "Marketing",
                      quote: "The lead qualification agent has transformed how we manage inbound leads for our clients, delivering a 5:1 ROI.",
                      stat: "500% ROI"
                    }
                  ].map((story, i) => (
                    <Card key={i} className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{story.company}</CardTitle>
                            <CardDescription>{story.industry}</CardDescription>
                          </div>
                          <Badge className="bg-primary/20 hover:bg-primary/30 text-primary border-primary/10">
                            {story.stat}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm italic">&ldquo;{story.quote}&rdquo;</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-6">
                <Button
                  onClick={() => setActiveTab("demo")}
                  className="gap-2"
                >
                  Join Our Success Stories <ArrowRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
