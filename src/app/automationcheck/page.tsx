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
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import AutomationReport from "@/components/AutomationReport";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface QuestionOption {
  value: number;
  label: string;
}

interface Question {
  id: keyof AutomationAnswers;
  title: string;
  question: string;
  options: QuestionOption[];
}

export interface AutomationAnswers {
  taskManagement: number;
  payroll: number;
  customerRelations: number;
  quotations: number;
  employeeManagement: number;
}

const AutomationChecker: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<AutomationAnswers>({
    taskManagement: 0,
    payroll: 0,
    customerRelations: 0,
    quotations: 0,
    employeeManagement: 0,
  });
  const [showResults, setShowResults] = useState<boolean>(false);

  const questions: Question[] = [
    {
      id: "taskManagement",
      title: "Task Management & Delegation",
      question: "How do you manage and delegate tasks in your business?",
      options: [
        { value: 0, label: "Mostly manual (emails, meetings, paper)" },
        { value: 1, label: "Basic digital tools (spreadsheets, general task apps)" },
        { value: 2, label: "Some specialized software but not integrated" },
        { value: 3, label: "Fully integrated automated system" },
      ],
    },
    {
      id: "payroll",
      title: "Payroll Processing",
      question: "How automated is your payroll process?",
      options: [
        { value: 0, label: "Manual calculations and transfers" },
        { value: 1, label: "Basic software but requires manual inputs" },
        { value: 2, label: "Semi-automated with some manual verification" },
        { value: 3, label: "Fully automated from time tracking to payments" },
      ],
    },
    {
      id: "customerRelations",
      title: "Customer Relationship Management",
      question: "How do you track and manage customer interactions?",
      options: [
        { value: 0, label: "Ad-hoc approach (notes, emails, memory)" },
        { value: 1, label: "Basic contact list or spreadsheet" },
        { value: 2, label: "CRM system but not fully utilized" },
        { value: 3, label: "Comprehensive CRM with automation and analytics" },
      ],
    },
    {
      id: "quotations",
      title: "Quotations & Proposals",
      question: "How do you prepare and send quotations to clients?",
      options: [
        { value: 0, label: "Manually created each time" },
        { value: 1, label: "Templates but manual customization" },
        { value: 2, label: "Digital system but separate from other business processes" },
        { value: 3, label: "Automated system integrated with CRM and billing" },
      ],
    },
    {
      id: "employeeManagement",
      title: "Employee Information & Payslips",
      question: "How do you manage employee information and distribute payslips?",
      options: [
        { value: 0, label: "Paper-based or basic digital files" },
        { value: 1, label: "Digital but requires manual processing" },
        { value: 2, label: "Employee portal but limited features" },
        { value: 3, label: "Comprehensive HR system with self-service options" },
      ],
    },
  ];

  const handleAnswerSelect = (questionId: keyof AutomationAnswers, value: number): void => {
    setAnswers({
      ...answers,
      [questionId]: value,
    });
  };

  const handleNext = (): void => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = (): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = (): void => {
    setAnswers({
      taskManagement: 0,
      payroll: 0,
      customerRelations: 0,
      quotations: 0,
      employeeManagement: 0,
    });
    setCurrentStep(0);
    setShowResults(false);
  };

  const calculateProgress = (): number => {
    return ((currentStep + 1) / questions.length) * 100;
  };

  const currentQuestion = questions[currentStep];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
          Business Automation Assessment
        </h1>
        <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
          Discover how automated your business processes are and identify opportunities to improve efficiency with Zapllo's integrated solutions.
        </p>

        {!showResults ? (
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <CardTitle className="text-xl">Step {currentStep + 1} of {questions.length}</CardTitle>
                  <CardDescription>Let's assess your current automation level</CardDescription>
                </div>
                <div className="text-sm font-medium">{Math.round(calculateProgress())}% Complete</div>
              </div>
              <Progress value={calculateProgress()} className="h-2" />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold">{currentQuestion.title}</h3>
                  <p className="text-muted-foreground mb-4">{currentQuestion.question}</p>
                </div>

                <div className="space-y-4">
                  {currentQuestion.options.map((option) => (
                    <div key={option.value} className="flex items-start space-x-3">
                      <Button
                        variant={answers[currentQuestion.id] === option.value ? "default" : "outline"}
                        className="w-full justify-start text-left h-auto py-3 px-4"
                        onClick={() => handleAnswerSelect(currentQuestion.id, option.value)}
                      >
                        {answers[currentQuestion.id] === option.value && (
                          <CheckCircle2 className="mr-2 h-5 w-5" />
                        )}
                        <span>{option.label}</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              <Button onClick={handleNext}>
                {currentStep === questions.length - 1 ? "View Results" : "Next"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <AutomationReport answers={answers} onReset={handleReset} />
        )}
      </motion.div>
    </div>
  );
};

export default AutomationChecker;
