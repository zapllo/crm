'use client'
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowUpRight,
  BarChart3,
  RefreshCw,
  Download,
  Share2,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { AutomationAnswers } from "@/types/automation";
import Link from "next/link";

interface AutomationReportProps {
  answers: AutomationAnswers;
  onReset: () => void;
}

interface ImprovementArea {
  area: string;
  product: string;
  score: number;
  feedback: string;
  solution: string;
  link: string;
}

type AutomationLevel = "Low" | "Basic" | "Moderate";

const AutomationReport: React.FC<AutomationReportProps> = ({ answers, onReset }) => {
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Calculate the score, but ensure it's never "excellent"
  const calculateScore = (): number => {
    const total = Object.values(answers).reduce((sum, value) => sum + value, 0);
    const max = Object.keys(answers).length * 3;
    const rawPercentage = (total / max) * 100;

    // Cap the score at 65% to ensure there's always room for improvement
    return Math.min(rawPercentage, 65);
  };

  const score: number = calculateScore();

  // Determine the automation level based on score
  const getAutomationLevel = (): AutomationLevel => {
    if (score < 30) return "Low";
    if (score < 50) return "Basic";
    return "Moderate"; // Never return "High" or "Advanced"
  };

  const automationLevel: AutomationLevel = getAutomationLevel();

  // Areas for improvement - always include at least 3 areas
  const improvementAreas: ImprovementArea[] = [
    {
      area: "Task Management",
      product: "Task Delegation App",
      score: answers.taskManagement,
      feedback: answers.taskManagement < 3 ?
        "Your current task management approach could lead to missed deadlines, poor accountability, and inefficient resource allocation." :
        "While you have some task management in place, there's opportunity to further streamline delegation and track task completion more effectively.",
      solution: "Zapllo's Task Delegation App centralizes all assignments with automatic reminders, progress tracking, and performance analytics to boost productivity by up to 35%.",
      link: "https://zapllo.com/products/zapllo-teams"
    },
    {
      area: "Payroll Processing",
      product: "Payroll App",
      score: answers.payroll,
      feedback: answers.payroll < 3 ?
        "Manual payroll processes are error-prone, time-consuming, and can lead to compliance issues and employee dissatisfaction." :
        "Your payroll system still requires significant oversight and may not be fully integrated with other HR functions.",
      solution: "Our Payroll App automates calculations, tax deductions, and payments while ensuring compliance with regulations, reducing payroll processing time by 80%.",
      link: "https://zapllo.com/products/zapllo-payroll"
    },
    {
      area: "Customer Relationship Management",
      product: "CRM App",
      score: answers.customerRelations,
      feedback: answers.customerRelations < 3 ?
        "Without a robust CRM, you're likely missing sales opportunities, struggling with customer retention, and lacking actionable insights." :
        "Your customer data isn't fully leveraged for marketing, sales, and service optimization.",
      solution: "Zapllo's CRM App tracks all customer interactions, automates follow-ups, and provides analytics to increase conversion rates and customer retention.",
      link: "https://zapllo.com/products/zapllo-teams"
    },
    {
      area: "Quotations & Proposals",
      product: "Quotations App",
      score: answers.quotations,
      feedback: answers.quotations < 3 ?
        "Creating quotations manually leads to inconsistent pricing, delays in sending proposals, and difficulty tracking acceptance rates." :
        "Your quotation process still requires significant manual input and isn't fully integrated with your sales pipeline.",
      solution: "Our Quotations App provides professionally designed templates, automated pricing calculations, and integration with your CRM to accelerate your sales cycle.",
      link: "https://crm.zapllo.com"
    },
    {
      area: "Employee Management",
      product: "Payslip App",
      score: answers.employeeManagement,
      feedback: answers.employeeManagement < 3 ?
        "Paper-based or basic digital employee management increases administrative burden and reduces transparency for employees." :
        "Your employee information system lacks self-service features that could reduce HR workload and improve employee satisfaction.",
      solution: "Zapllo's Payslip App offers digital payslips, tax documents, and a self-service portal for employees to access their information securely anytime.",
      link: "https://zapllo.com/products/zapllo-payroll"
    }
  ];

  // Always ensure at least 3 key recommendations
  const getRecommendations = (): ImprovementArea[] => {
    // Sort by lowest scores first
    const sortedAreas = [...improvementAreas].sort((a, b) => a.score - b.score);

    // Always include at least 3 recommendations
    return sortedAreas.slice(0, Math.max(3, sortedAreas.filter(area => area.score < 3).length));
  };

  const keyRecommendations: ImprovementArea[] = getRecommendations();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Your Automation Assessment Results</CardTitle>
          <CardDescription>
            Based on your responses, we've analyzed your current business automation level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="col-span-1 flex flex-col items-center justify-center">
              <div className="relative h-36 w-36">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold">{Math.round(score)}%</span>
                </div>
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={score < 30 ? "#ef4444" : score < 50 ? "#f97316" : "#3b82f6"}
                    strokeWidth="10"
                    strokeDasharray={`${score * 2.83} ${283 - score * 2.83}`}
                    strokeDashoffset="70.75"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mt-4">{automationLevel} Automation</h3>
              <p className="text-muted-foreground text-center">
                {automationLevel === "Low" ? "Significant improvement needed" :
                  automationLevel === "Basic" ? "Several areas need attention" :
                    "Room for substantial improvement"}
              </p>
            </div>

            <div className="col-span-1 md:col-span-2">
              <h3 className="text-xl font-bold mb-3">Key Findings</h3>
              <p className="mb-4">
                Your business is operating at a <span className="font-semibold">{automationLevel.toLowerCase()} level of automation</span>, which means you're missing out on significant efficiency gains and cost savings. Our analysis shows specific opportunities to streamline operations and reduce manual workload.
              </p>

              <div className="flex items-center space-x-2 text-sm">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span>
                  Businesses with your automation level typically spend 30-45% more time on administrative tasks.
                </span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="mt-6" onValueChange={setActiveTab}>
            <TabsList className="grid w-full bg-accent grid-cols-3">
              <TabsTrigger className='border-none' value="overview">Overview</TabsTrigger>
              <TabsTrigger className='border-none' value="detailed">Detailed Analysis</TabsTrigger>
              <TabsTrigger className='border-none' value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 pt-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Automation Gap Analysis</h3>
                <div className="space-y-3">
                  {Object.entries(answers).map(([key, value]) => {
                    const area = improvementAreas.find(area => area.area.toLowerCase().includes(key.replace(/([A-Z])/g, ' $1').toLowerCase()));
                    if (!area) return null;

                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{area.area}</span>
                          <span className="text-sm">
                            {value === 0 ? "Manual" :
                              value === 1 ? "Basic" :
                                value === 2 ? "Partial" : "Automated"}
                          </span>
                        </div>
                        <Progress value={(value / 3) * 100} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Top Improvement Opportunities</h3>
                <ul className="space-y-3">
                  {keyRecommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-3 mt-0.5">
                        <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
                          <span className="text-amber-600 text-xs font-bold">{index + 1}</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">{recommendation.area}</p>
                        <p className="text-sm text-muted-foreground">{recommendation.feedback}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="detailed" className="space-y-6 pt-4">
              {improvementAreas.map((area, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 pb-4">
                    <CardTitle className="text-lg">{area.area}</CardTitle>
                    <CardDescription>
                      Current level: {
                        area.score === 0 ? "Manual" :
                          area.score === 1 ? "Basic" :
                            area.score === 2 ? "Partial" : "Semi-Automated"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold flex items-center text-amber-600">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Business Impact
                        </h4>
                        <p className="text-sm mt-1">{area.feedback}</p>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-semibold flex items-center text-blue-600">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Zapllo Solution
                        </h4>
                        <p className="text-sm mt-1">{area.solution}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6 pt-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Your Personalized Action Plan</h3>
                <p className="text-muted-foreground">
                  Based on your responses, we recommend the following Zapllo products to significantly improve your business automation:
                </p>
              </div>

              {keyRecommendations.map((recommendation, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <span className="mr-2">{recommendation.product}</span>
                      <span className="text-xs py-0.5 px-2 bg-blue-100 text-blue-800 rounded-full">Recommended</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-3">
                      <p className="text-sm">{recommendation.solution}</p>
                      <div className="flex flex-wrap gap-2">
                        <div className="text-xs py-1 px-2 bg-green-100 text-green-800 rounded-full flex items-center">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Reduce manual work
                        </div>
                        <div className="text-xs py-1 px-2 bg-green-100 text-green-800 rounded-full flex items-center">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Minimize errors
                        </div>
                        <div className="text-xs py-1 px-2 bg-green-100 text-green-800 rounded-full flex items-center">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Improve efficiency
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 pt-3">
                  <Link href={recommendation.link}>
                    <Button className="w-full">
                      Learn more about {recommendation.product}
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}

              <div className="mt-6 p-5 border rounded-lg bg-blue-50 border-blue-200">
                <h3 className="text-lg font-semibold mb-2 text-blue-800">Complete Business Automation Suite</h3>
                <p className="text-sm text-blue-800 mb-4">
                  For maximum efficiency, consider Zapllo's integrated suite of apps that work seamlessly together to automate your entire business workflow.
                </p>
                <Button className="bg-blue-700 hover:bg-blue-800">
                  Schedule a Demo
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between border-t pt-6 bg-muted/20">
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={onReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retake Assessment
            </Button>
            {/* <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button> */}
          </div>
          {/* <Button size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share with Team
          </Button> */}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default AutomationReport;
