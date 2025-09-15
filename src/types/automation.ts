export interface QuestionOption {
  value: number;
  label: string;
}

export interface Question {
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

export interface ImprovementArea {
  area: string;
  product: string;
  score: number;
  feedback: string;
  solution: string;
}

export type AutomationLevel = "Low" | "Basic" | "Moderate";
