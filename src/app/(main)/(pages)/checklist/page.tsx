'use client'

import { useState, useEffect } from 'react'
import { useToast } from "@/hooks/use-toast"
import confetti from 'canvas-confetti'
import { Progress } from "@/components/ui/progress"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  Trophy,
  UserPlus,
  Settings,
  Mail,
  Phone,
  Users,
  Building,
  FileText,
  CalendarClock,
  Briefcase,
  HeartHandshake,
  Megaphone,
  BarChart3,
  BadgeCheck,
  Gift,
  CheckCheck,
  AlertTriangle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from 'next/link'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

// Define the task type
interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: 'setup' | 'data' | 'connect' | 'advanced';
  iconName: string; // Changed from icon React.ReactNode to iconName string
  action: {
    text: string;
    link: string;
  }
}

// Function to get icon component by name
const getIconByName = (iconName: string) => {
  switch (iconName) {
    case 'Users': return <Users className="h-5 w-5 text-blue-500" />;
    case 'Building': return <Building className="h-5 w-5 text-blue-500" />;
    case 'UserPlus': return <UserPlus className="h-5 w-5 text-green-500" />;
    case 'Briefcase': return <Briefcase className="h-5 w-5 text-green-500" />;
    case 'Mail': return <Mail className="h-5 w-5 text-purple-500" />;
    case 'Settings': return <Settings className="h-5 w-5 text-amber-500" />;
    case 'FileText': return <FileText className="h-5 w-5 text-green-500" />;
    case 'BarChart3': return <BarChart3 className="h-5 w-5 text-amber-500" />;
    case 'HeartHandshake': return <HeartHandshake className="h-5 w-5 text-purple-500" />;
    case 'Megaphone': return <Megaphone className="h-5 w-5 text-amber-500" />;
    case 'CalendarClock': return <CalendarClock className="h-5 w-5 text-purple-500" />;
    default: return <Circle className="h-5 w-5 text-blue-500" />;
  }
};

export default function ChecklistPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'setup' | 'data' | 'connect' | 'advanced'>('all');
  const [recentlyCompleted, setRecentlyCompleted] = useState<string | null>(null);

  // Load tasks from localStorage or initialize with default tasks
  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);

      // Simulate fetching from API
      await new Promise(resolve => setTimeout(resolve, 800));

      const savedTasks = localStorage.getItem('onboarding_tasks');

      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        // Default tasks
        setTasks([
          {
            id: 'profile',
            title: 'Complete your profile',
            description: 'Add your details to personalize your account and help your team identify you.',
            completed: false,
            category: 'setup',
            iconName: 'Users',
            action: {
              text: 'Update Profile',
              link: '/overview/profile'
            }
          },
          {
            id: 'company',
            title: 'Add company information',
            description: 'Set up your company details, business hours, and branding.',
            completed: false,
            category: 'setup',
            iconName: 'Building',
            action: {
              text: 'Add Company',
              link: '/CRM/companies'
            }
          },
          {
            id: 'firstContact',
            title: 'Add your first contact',
            description: 'Start building your customer database by adding your first contact.',
            completed: false,
            category: 'data',
            iconName: 'UserPlus',
            action: {
              text: 'Add Contact',
              link: '/CRM/contacts'
            }
          },
          {
            id: 'firstDeal',
            title: 'Create your first lead',
            description: 'Set up a sales opportunity to start tracking your pipeline.',
            completed: false,
            category: 'data',
            iconName: 'Briefcase',
            action: {
              text: 'Create Lead',
              link: '/CRM/leads'
            }
          },
          {
            id: 'emailSetup',
            title: 'Configure email integration',
            description: 'Connect your email account to send and track emails directly from the CRM.',
            completed: false,
            category: 'connect',
            iconName: 'Mail',
            action: {
              text: 'Setup Email',
              link: '/settings/channels'
            }
          },
          {
            id: 'inviteTeam',
            title: 'Invite your team members',
            description: 'Collaborate with your team by inviting them to your CRM workspace.',
            completed: false,
            category: 'setup',
            iconName: "Settings",
            action: {
              text: 'Invite Team',
              link: '/teams/members'
            }
          },
          {
            id: 'customFields',
            title: 'Set up custom fields',
            description: 'Customize your CRM by adding fields specific to your business needs.',
            completed: false,
            category: 'advanced',
            iconName: 'FileText',
            action: {
              text: 'Add Fields',
              link: '/settings/customize'
            }
          },
          {
            id: 'importContacts',
            title: 'Import your contacts',
            description: 'Bulk import your existing contacts from a CSV file or other sources.',
            completed: false,
            category: 'data',
            iconName: 'FileText',
            action: {
              text: 'Import',
              link: '/CRM/contacts'
            }
          },
          {
            id: 'setupPipeline',
            title: 'Customize your sales pipeline',
            description: 'Configure your deal stages to match your sales process.',
            completed: false,
            category: 'advanced',
            iconName: 'BarChart3',
            action: {
              text: 'Setup Pipeline',
              link: '/settings/customize'
            }
          },
          {
            id: 'apiIntegration',
            title: 'Set up an API integration',
            description: 'Connect with third-party apps using our API or Zapier integration.',
            completed: false,
            category: 'connect',
            iconName: 'HeartHandshake',
            action: {
              text: 'Integrate',
              link: '/settings/api'
            }
          },
          //   {
          //     id: 'emailTemplate',
          //     title: 'Create an email template',
          //     description: 'Save time by creating reusable email templates for common scenarios.',
          //     completed: false,
          //     category: 'advanced',
          //     iconName: <Megaphone className="h-5 w-5 text-amber-500" />,
          //     action: {
          //       text: 'Create Template',
          //       link: '/settings/email-templates'
          //     }
          //   },
          //   {
          //     id: 'scheduleDemo',
          //     title: 'Schedule your first meeting',
          //     description: 'Set up a meeting or demo with a contact using our calendar integration.',
          //     completed: false,
          //     category: 'connect',
          //     iconName: <CalendarClock className="h-5 w-5 text-purple-500" />,
          //     action: {
          //       text: 'Schedule',
          //       link: '/calendar'
          //     }
          //   },
        ]);
      }

      setLoading(false);
    };

    loadTasks();
  }, []);

  const handleReset = () => {
    setTasks(prevTasks => prevTasks.map(task => ({ ...task, completed: false })));
    toast({
      title: "Progress reset",
      description: "Your onboarding progress has been reset.",
    });
  };

  // Calculate progress and save to localStorage whenever tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      const completedCount = tasks.filter(task => task.completed).length;
      const newProgress = Math.round((completedCount / tasks.length) * 100);
      setProgress(newProgress);

      // Save tasks to localStorage
      localStorage.setItem('onboarding_tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  // Trigger confetti when certain progress milestones are reached
  useEffect(() => {
    if (progress === 100 && tasks.length > 0) {
      triggerConfetti();
      toast({
        title: "🎉 All tasks completed!",
        description: "Congratulations! You've successfully set up your CRM.",
      });
    } else if (progress > 0 && progress % 25 === 0 && tasks.length > 0) {
      triggerConfetti();
      const milestone = progress === 25 ? "25%" : progress === 50 ? "50%" : "75%";
      toast({
        title: `🎉 ${milestone} Complete!`,
        description: `You're making great progress on your CRM setup!`,
      });
    }
  }, [progress, tasks.length, toast]);

  // Trigger the confetti animation
  const triggerConfetti = () => {
    setShowConfetti(true);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      setShowConfetti(false);
    }, 4000);
  };

  // Toggle task completion
  const toggleTask = (id: string) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => {
        if (task.id === id) {
          const newCompleted = !task.completed;

          // If newly completed, trigger animation and notification
          if (newCompleted) {
            setRecentlyCompleted(id);
            setTimeout(() => setRecentlyCompleted(null), 3000);

            toast({
              title: "✅ Task completed!",
              description: `You've completed: ${task.title}`,
            });

            // Small confetti for individual task completion
            confetti({
              particleCount: 30,
              spread: 50,
              origin: { y: 0.8 }
            });
          }

          return { ...task, completed: newCompleted };
        }
        return task;
      });

      return updatedTasks;
    });
  };

  // Filter tasks by category
  const filteredTasks = activeCategory === 'all'
    ? tasks
    : tasks.filter(task => task.category === activeCategory);

  // Count tasks in each category
  const categoryCounts = {
    setup: tasks.filter(t => t.category === 'setup').length,
    data: tasks.filter(t => t.category === 'data').length,
    connect: tasks.filter(t => t.category === 'connect').length,
    advanced: tasks.filter(t => t.category === 'advanced').length
  };

  // Count completed tasks in each category
  const categoryCompletedCounts = {
    setup: tasks.filter(t => t.category === 'setup' && t.completed).length,
    data: tasks.filter(t => t.category === 'data' && t.completed).length,
    connect: tasks.filter(t => t.category === 'connect' && t.completed).length,
    advanced: tasks.filter(t => t.category === 'advanced' && t.completed).length
  };

  return (
    <div className="w-full pt-12 pb-16 px-4 mt-12 h-full overflow-y-auto scrollbar-hide md:px-6 lg:px-8"
      style={{
        maxHeight: 'calc(100vh - 16px)', // Adjust based on your layout
        scrollBehavior: 'auto' // Prevent smooth scrolling which can interfere
      }}>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Getting Started</h2>
        <p className="text-muted-foreground">
          Complete these tasks to set up your CRM and get the most out of Zapllo.
        </p>
      </div>

      <Card className="relative mt-6 overflow-hidden">
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            <Sparkles className="h-16 w-16 text-yellow-500 animate-bounce" />
          </div>
        )}

        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                Your Onboarding Progress
                {progress === 100 && (
                  <Badge className="ml-2 bg-gradient-to-r from-yellow-500 to-amber-500 border-none">
                    <Trophy className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {progress < 25 ? "Let's start setting up your CRM! Complete these tasks to get started." :
                  progress < 50 ? "Good start! Keep going to customize your CRM further." :
                    progress < 75 ? "You're making great progress! Just a few more tasks to go." :
                      progress < 100 ? "Almost there! Complete the remaining tasks to finish your setup." :
                        "Congratulations! You've completed all the recommended tasks."}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {progress}%
              </div>
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${progress < 25 ? 'bg-blue-500' :
                    progress < 50 ? 'bg-indigo-500' :
                      progress < 75 ? 'bg-purple-500' :
                        progress < 100 ? 'bg-pink-500' :
                          'bg-gradient-to-r from-yellow-500 to-amber-500'
                    }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
            <Button
              variant={activeCategory === 'all' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory('all')}
              className="rounded-full"
            >
              All Tasks ({tasks.filter(t => t.completed).length}/{tasks.length})
            </Button>
            <Button
              variant={activeCategory === 'setup' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory('setup')}
              className={`rounded-full ${activeCategory !== 'setup' && categoryCompletedCounts.setup === categoryCounts.setup ? 'border-green-200 text-green-700 dark:border-green-800 dark:text-green-400' : ''}`}
            >
              {activeCategory !== 'setup' && categoryCompletedCounts.setup === categoryCounts.setup ? (
                <CheckCheck className="mr-1 h-3 w-3" />
              ) : null}
              Setup ({categoryCompletedCounts.setup}/{categoryCounts.setup})
            </Button>
            <Button
              variant={activeCategory === 'data' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory('data')}
              className={`rounded-full ${activeCategory !== 'data' && categoryCompletedCounts.data === categoryCounts.data ? 'border-green-200 text-green-700 dark:border-green-800 dark:text-green-400' : ''}`}
            >
              {activeCategory !== 'data' && categoryCompletedCounts.data === categoryCounts.data ? (
                <CheckCheck className="mr-1 h-3 w-3" />
              ) : null}
              Data Entry ({categoryCompletedCounts.data}/{categoryCounts.data})
            </Button>
            <Button
              variant={activeCategory === 'connect' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory('connect')}
              className={`rounded-full ${activeCategory !== 'connect' && categoryCompletedCounts.connect === categoryCounts.connect ? 'border-green-200 text-green-700 dark:border-green-800 dark:text-green-400' : ''}`}
            >
              {activeCategory !== 'connect' && categoryCompletedCounts.connect === categoryCounts.connect ? (
                <CheckCheck className="mr-1 h-3 w-3" />
              ) : null}
              Connections ({categoryCompletedCounts.connect}/{categoryCounts.connect})
            </Button>
            <Button
              variant={activeCategory === 'advanced' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory('advanced')}
              className={`rounded-full ${activeCategory !== 'advanced' && categoryCompletedCounts.advanced === categoryCounts.advanced ? 'border-green-200 text-green-700 dark:border-green-800 dark:text-green-400' : ''}`}
            >
              {activeCategory !== 'advanced' && categoryCompletedCounts.advanced === categoryCounts.advanced ? (
                <CheckCheck className="mr-1 h-3 w-3" />
              ) : null}
              Advanced ({categoryCompletedCounts.advanced}/{categoryCounts.advanced})
            </Button>
          </div>

          {loading ? (
            // Loading state
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 border rounded-lg animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="h-5 w-5 rounded-full bg-muted"></div>
                    <div className="flex-1">
                      <div className="h-5 w-48 bg-muted rounded mb-2"></div>
                      <div className="h-4 w-96 bg-muted rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 border rounded-lg transition-all duration-300 ${task.completed
                    ? 'bg-muted/40 border-muted'
                    : 'hover:border-primary/50 hover:bg-accent cursor-pointer'
                    } ${recentlyCompleted === task.id ? 'animate-pulse border-green-500 bg-green-50 dark:bg-green-900/20' : ''}`}
                  onClick={() => {
                    if (!task.completed) {
                      toggleTask(task.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-4">
                    <button
                      className="mt-0.5 flex-shrink-0 focus:outline-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTask(task.id);
                      }}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 transition-transform duration-300 hover:scale-110" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground transition-transform duration-300 hover:scale-110 hover:text-primary" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full p-1.5 bg-muted">{getIconByName(task.iconName)}</div>
                          <h3 className={`font-medium ${task.completed ? 'text-muted-foreground' : ''}`}>
                            {task.title}
                          </h3>
                          {task.completed && (
                            <Badge variant="outline" className="ml-2 text-xs text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                              <CheckCheck className="mr-1 h-3 w-3" />
                              Completed
                            </Badge>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = task.action.link;
                          }}
                        >
                          {task.action.text}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                      <p className={`mt-1 text-sm ${task.completed ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                        {task.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredTasks.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tasks in this category.</p>
            </div>
          )}
        </CardContent>

        {progress === 100 && (
          <CardFooter className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-t border-yellow-200 dark:border-yellow-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-medium">Setup Complete!</h3>
                  <p className="text-sm text-muted-foreground">Congratulations on setting up your CRM!</p>
                </div>
              </div>
              <div>
                <Button onClick={() => toast({
                  title: "Thanks for completing the onboarding!",
                  description: "If you need any help, our support team is just a click away.",
                })}>
                  <Gift className="h-4 w-4 mr-2" />
                  Get Started with Zapllo CRM
                </Button>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Pro Tips Card */}
      <Card className='mt-4'>
        <CardHeader>
          <CardTitle>Pro Tips</CardTitle>
          <CardDescription>
            Make the most of Zapllo CRM with these expert recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <BadgeCheck className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="font-medium">Use Tags</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Organize your contacts and deals with tags for easy filtering and segmentation.
              </p>
              {/* <Button variant="link" className="p-0 h-auto mt-2">
                Learn about tags <ArrowRight className="h-3 w-3 ml-1" />
              </Button> */}
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                  <CalendarClock className="h-4 w-4 text-purple-600" />
                </div>
                <h3 className="font-medium">Schedule Follow-ups</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Never miss a follow-up by scheduling tasks and reminders for your deals.
              </p>
              {/* <Button variant="link" className="p-0 h-auto mt-2">
                View calendar <ArrowRight className="h-3 w-3 ml-1" />
              </Button> */}
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="font-medium">Review Reports</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Check your weekly reports to gain insights into your sales pipeline and activities.
              </p>
              {/* <Button variant="link" className="p-0 h-auto mt-2">
                Go to reports <ArrowRight className="h-3 w-3 ml-1" />
              </Button> */}
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Reset Button at the bottom */}
      {tasks.some(task => task.completed) && (
        <div className="flex justify-center pt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-muted-foreground text-xs"
              >
                Reset Onboarding Progress
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Reset Onboarding Progress
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to reset all your onboarding progress? This action cannot be undone and will mark all completed tasks as incomplete.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReset}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Reset Progress
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}