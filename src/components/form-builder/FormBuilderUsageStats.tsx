import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { AlertCircle, BarChart3, FileBox, Info, TrendingUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface FormBuilderUsageStatsProps {
  stats: {
    totalForms: number;
    publishedForms: number;
    draftForms: number;
    maxForms: number;
    currentMonthSubmissions: number;
    totalSubmissions?: number;
    todaySubmissions?: number;
    weekSubmissions?: number;
    monthSubmissions?: number;
    maxSubmissionsPerMonth: number;
    submissionsResetDate: Date;
    planName: string;
  };
}

export default function FormBuilderUsageStats({ stats }: FormBuilderUsageStatsProps) {
  const router = useRouter();

  // Calculate percentages
  const formUsagePercent = stats.maxForms > 0
    ? Math.min(100, (stats.publishedForms / stats.maxForms) * 100)
    : 0;

  // Make sure we use the tracked currentMonthSubmissions value, not the calculated one
  const submissionUsagePercent = stats.maxSubmissionsPerMonth > 0
    ? Math.min(100, (stats.currentMonthSubmissions / stats.maxSubmissionsPerMonth) * 100)
    : 0;

  // Format the reset date
  const resetDateFormatted = new Date(stats.submissionsResetDate).toLocaleDateString(
    undefined,
    { month: 'short', day: 'numeric', year: 'numeric' }
  );

  // Calculate days remaining until reset
  const today = new Date();
  const resetDate = new Date(stats.submissionsResetDate);
  resetDate.setMonth(resetDate.getMonth() + 1); // Next month
  const daysRemaining = Math.ceil((resetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  console.log('Usage stats component:', {
    currentMonthSubmissions: stats.currentMonthSubmissions,
    maxSubmissionsPerMonth: stats.maxSubmissionsPerMonth,
    submissionUsagePercent,
    resetDate: resetDateFormatted
  });

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Form Builder Usage</CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {stats.planName} Plan
          </Badge>
        </div>
        <CardDescription>
          Track your form and submission usage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="forms" className="space-y-4">
          <TabsList className="grid grid-cols-2 gap-4 bg-accent h-9">
            <TabsTrigger value="forms" className="text-xs border-none">
              <FileBox className="h-3.5 w-3.5 mr-1" />
              Forms
            </TabsTrigger>
            <TabsTrigger value="submissions" className="text-xs border-none">
              <BarChart3 className="h-3.5 w-3.5 mr-1" />
              Submissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="forms" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm items-center">
                <div className="flex items-center">
                  <span>Published Forms</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-xs">
                          Only published forms count toward your plan limit. You can have unlimited draft forms.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center">
                  <span className={`font-medium ${formUsagePercent > 90 ? 'text-destructive' : ''}`}>
                    {stats.publishedForms} / {stats.maxForms === 0 ? '∞' : stats.maxForms}
                  </span>
                  {formUsagePercent > 90 && stats.maxForms > 0 && (
                    <AlertCircle className="h-3.5 w-3.5 ml-1 text-destructive" />
                  )}
                </div>
              </div>

              {stats.maxForms > 0 ? (
                <Progress
                  value={formUsagePercent}
                  className="h-2"
                />
              ) : (
                <div className="h-2 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-[9px] text-muted-foreground">UNLIMITED</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-accent/50 rounded-md p-2">
                  <div className="text-xs text-muted-foreground">Total Forms</div>
                  <div className="text-lg font-medium">{stats.totalForms}</div>
                </div>
                <div className="bg-accent/50 rounded-md p-2">
                  <div className="text-xs text-muted-foreground">Draft Forms</div>
                  <div className="text-lg font-medium">{stats.draftForms}</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm items-center">
                <div className="flex items-center">
                  <span>Monthly Submissions</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-xs">
                          Submission count resets monthly. Next reset will be on {resetDateFormatted}.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center">
                  <span className={`font-medium ${submissionUsagePercent > 90 ? 'text-destructive' : ''}`}>
                    {stats.currentMonthSubmissions.toLocaleString()} / {stats.maxSubmissionsPerMonth === 0 ? '∞' : stats.maxSubmissionsPerMonth.toLocaleString()}
                  </span>
                  {submissionUsagePercent > 90 && stats.maxSubmissionsPerMonth > 0 && (
                    <AlertCircle className="h-3.5 w-3.5 ml-1 text-destructive" />
                  )}
                </div>
              </div>

              {stats.maxSubmissionsPerMonth > 0 ? (
                <Progress
                  value={submissionUsagePercent}
                  className="h-2"
                />
              ) : (
                <div className="h-2 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-[9px] text-muted-foreground">UNLIMITED</span>
                </div>
              )}

              <div className="flex justify-between bg-accent/50 rounded-md p-2 mt-2">
                <div>
                  <div className="text-xs text-muted-foreground">Days until reset</div>
                  <div className="text-lg font-medium">{daysRemaining}</div>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Add this section to show actual submissions from database */}
              {stats.monthSubmissions !== undefined && (
                <div className="flex justify-between bg-accent/50 rounded-md p-2 mt-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Actual this month</div>
                    <div className="text-lg font-medium">{stats.monthSubmissions}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Today</div>
                    <div className="text-lg font-medium">{stats.todaySubmissions || 0}</div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {(formUsagePercent > 90 || submissionUsagePercent > 90) && stats.planName !== 'enterprise' && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => router.push('/settings/billing?product=formBuilder')}
            >
              Upgrade Plan
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
