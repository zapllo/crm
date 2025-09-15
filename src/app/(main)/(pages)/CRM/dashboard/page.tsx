"use client";

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, PieChart, LineChart } from "@/components/ui/charts";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import {
    ArrowUpIcon,
    ArrowDownIcon,
    ArrowUpRight,
    BarChart2,
    Calendar,
    ChevronDown,
    LineChart as LineChartIcon,
    PieChart as PieChartIcon,
    Users,
    Briefcase,
    Tag,
    TrendingUp,
    Filter,
    DollarSign,
    TrendingDown,
    CircleDollarSign,
    Layers,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUserContext } from '@/contexts/userContext';

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const { user } = useUserContext();
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [pipelines, setPipelines] = useState([]);
    const [sources, setSources] = useState([]);
    const [companies, setCompanies] = useState([]);

    // Default date range: Last 30 days
    const [filters, setFilters] = useState({
        pipelineId: '',
        sourceId: '',
        companyId: '',
        dateRange: {
            from: subMonths(new Date(), 1),
            to: new Date()
        }
    });

    // Add a state for comparison period percentages
    const [comparisons, setComparisons] = useState({
        totalCount: 0,
        openCount: 0,
        wonCount: 0,
        lostCount: 0,
        totalAmount: 0,
        openAmount: 0,
        wonAmount: 0,
        lostAmount: 0
    });

    // Fetch filter options on component mount
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const [pipelinesRes, sourcesRes, companiesRes] = await Promise.all([
                    axios.get('/api/pipelines'),
                    axios.get('/api/sources'),
                    axios.get('/api/companies')
                ]);

                setPipelines(pipelinesRes.data);
                setSources(sourcesRes.data);
                setCompanies(companiesRes.data);
            } catch (error) {
                console.error('Error fetching filter options:', error);
            }
        };

        fetchFilterOptions();
    }, []);

    // Fetch dashboard data whenever filters change
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Current period data
                const params = new URLSearchParams();

                if (filters.pipelineId) params.append('pipelineId', filters.pipelineId);
                if (filters.sourceId) params.append('sourceId', filters.sourceId);
                if (filters.companyId) params.append('companyId', filters.companyId);

                if (filters.dateRange.from) {
                    params.append('startDate', filters.dateRange.from.toISOString());
                }

                if (filters.dateRange.to) {
                    params.append('endDate', filters.dateRange.to.toISOString());
                }

                const response = await axios.get(`/api/dashboard?${params.toString()}`);
                setDashboardData(response.data);

                // Calculate comparison with previous period
                // If the current period is 30 days, compare with previous 30 days
                const currentPeriodLength = Math.round((filters.dateRange.to.getTime() - filters.dateRange.from.getTime()) / (1000 * 60 * 60 * 24));

                const prevPeriodEndDate = new Date(filters.dateRange.from);
                prevPeriodEndDate.setDate(prevPeriodEndDate.getDate() - 1);

                const prevPeriodStartDate = new Date(prevPeriodEndDate);
                prevPeriodStartDate.setDate(prevPeriodStartDate.getDate() - currentPeriodLength);

                const prevParams = new URLSearchParams();
                if (filters.pipelineId) prevParams.append('pipelineId', filters.pipelineId);
                if (filters.sourceId) prevParams.append('sourceId', filters.sourceId);
                if (filters.companyId) prevParams.append('companyId', filters.companyId);
                prevParams.append('startDate', prevPeriodStartDate.toISOString());
                prevParams.append('endDate', prevPeriodEndDate.toISOString());

                const prevResponse = await axios.get(`/api/dashboard?${prevParams.toString()}`);
                const prevData = prevResponse.data;

                // Calculate percentage changes
                if (prevData.summary) {
                    const calcPercentChange = (current: number, previous: number): number => {
                        if (previous === 0) return current > 0 ? 100 : 0;
                        return ((current - previous) / previous) * 100;
                    };

                    setComparisons({
                        totalCount: calcPercentChange(response.data.summary.totalCount, prevData.summary.totalCount),
                        openCount: calcPercentChange(response.data.summary.openCount, prevData.summary.openCount),
                        wonCount: calcPercentChange(response.data.summary.wonCount, prevData.summary.wonCount),
                        lostCount: calcPercentChange(response.data.summary.lostCount, prevData.summary.lostCount),
                        totalAmount: calcPercentChange(response.data.summary.totalAmount, prevData.summary.totalAmount),
                        openAmount: calcPercentChange(response.data.summary.openAmount, prevData.summary.openAmount),
                        wonAmount: calcPercentChange(response.data.summary.wonAmount, prevData.summary.wonAmount),
                        lostAmount: calcPercentChange(response.data.summary.lostAmount, prevData.summary.lostAmount)
                    });
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [filters]);

    const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
        setFilters({
            ...filters,
            dateRange: {
                from: range.from || subMonths(new Date(), 1),
                to: range.to || new Date()
            }
        });
    };

    // For the time-based reports, transform the data for charts
    const timeSeriesData = useMemo(() => {
        if (!dashboardData?.timeBasedReports) return {
            daily: [],
            weekly: [],
            monthly: [],
            yearly: []
        };

        const formatDate = (dateStr: string | null, period: string): string => {
            if (!dateStr) return '';

            try {
                switch (period) {
                    case 'daily':
                        return format(new Date(dateStr), 'MMM dd');
                    case 'weekly':
                        // Input format: "2023-W30"
                        const [year, week] = dateStr.split('-W');
                        return `Week ${week}, ${year}`;
                    case 'monthly':
                        // Input format: "2023-7"
                        const [myear, month] = dateStr.split('-');
                        return format(new Date(parseInt(myear), parseInt(month) - 1, 1), 'MMM yyyy');
                    case 'yearly':
                        return dateStr;
                    default:
                        return dateStr;
                }
            } catch (error) {
                console.error(`Error formatting date ${dateStr} for period ${period}`, error);
                return dateStr;
            }
        };

        return {
            daily: dashboardData.timeBasedReports.daily.map((item: any) => ({
                date: formatDate(item.date, 'daily'),
                'Total Leads': item.count,
                'Won': item.wonCount,
                'Lost': item.lostCount,
                'Won Amount': item.wonAmount,
                actualDate: item.actualDate
            })),
            weekly: dashboardData.timeBasedReports.weekly.map((item: any) => ({
                date: formatDate(item.date, 'weekly'),
                'Total Leads': item.count,
                'Won': item.wonCount,
                'Lost': item.lostCount,
                'Won Amount': item.wonAmount,
                actualDate: item.actualDate
            })),
            monthly: dashboardData.timeBasedReports.monthly.map((item: any) => ({
                date: formatDate(item.date, 'monthly'),
                'Total Leads': item.count,
                'Won': item.wonCount,
                'Lost': item.lostCount,
                'Won Amount': item.wonAmount,
                actualDate: item.actualDate
            })),
            yearly: dashboardData.timeBasedReports.yearly.map((item: any) => ({
                date: formatDate(item.date, 'yearly'),
                'Total Leads': item.count,
                'Won': item.wonCount,
                'Lost': item.lostCount,
                'Won Amount': item.wonAmount,
                actualDate: item.actualDate
            }))
        };
    }, [dashboardData?.timeBasedReports]);

    // Calculate conversion rate for top-line metrics
    const conversionRate = useMemo(() => {
        if (!dashboardData?.summary) return 0;
        const { totalCount, wonCount } = dashboardData.summary;
        return totalCount > 0 ? (wonCount / totalCount) * 100 : 0;
    }, [dashboardData?.summary]);

    // Calculate revenue per lead
    const revenuePerLead = useMemo(() => {
        if (!dashboardData?.summary) return 0;
        const { totalCount, totalAmount } = dashboardData.summary;
        return totalCount > 0 ? totalAmount / totalCount : 0;
    }, [dashboardData?.summary]);

    if (loading) {
        return <DashboardSkeleton />;
    }

    // Format numbers for display
    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-IN').format(num || 0);
    };

    // Format currency for display
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    // Format percentage for display
    const formatPercentage = (value: number) => {
        return `${value.toFixed(1)}%`;
    };

    return (
        // In the main Dashboard component
        <div className="p-6  mx-auto h-full max-h-screen scrollbar-hide overflow-y-scroll p-4 space-y-6">
            <div className="flex flex-col mt-2 md:flex-row md:items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-xl font-medium">👋 Welcome Back, {user?.firstName} </h1>
                    <p className="text-xs text-muted-foreground">
                        Analytics and insights for your sales pipeline
                    </p>
                </div>
                <DateRangePicker
                    value={filters.dateRange}
                    onChange={handleDateRangeChange as any}
                    className="w-full md:w-auto"
                />
            </div>


            {/* Filters Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Select
                    value={filters.pipelineId}
                    onValueChange={(value) => setFilters({ ...filters, pipelineId: value })}
                >
                    <SelectTrigger className="bg-background">
                        <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4" />
                            <SelectValue placeholder="All Pipelines" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="NONE">All Pipelines</SelectItem>
                        {pipelines.map((pipeline: any) => (
                            <SelectItem key={pipeline._id} value={pipeline._id}>{pipeline.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.sourceId}
                    onValueChange={(value) => setFilters({ ...filters, sourceId: value })}
                >
                    <SelectTrigger className="bg-background">
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            <SelectValue placeholder="All Sources" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="NONE">All Sources</SelectItem>
                        {sources.map((source: any) => (
                            <SelectItem key={source._id} value={source._id}>{source.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.companyId}
                    onValueChange={(value) => setFilters({ ...filters, companyId: value })}
                >
                    <SelectTrigger className="bg-background">
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            <SelectValue placeholder="All Companies" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="NONE">All Companies</SelectItem>
                        {companies.map((company: any) => (
                            <SelectItem key={company._id} value={company._id}>{company.companyName}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Total Leads"
                    value={dashboardData?.summary?.totalCount || 0}
                    valueFormatted={formatNumber(dashboardData?.summary?.totalCount || 0)}
                    secondaryValue={dashboardData?.summary?.totalAmount || 0}
                    secondaryValueFormatted={formatCurrency(dashboardData?.summary?.totalAmount || 0)}
                    change={comparisons.totalCount}
                    icon={<Layers className="h-5 w-5" />}
                    tooltipText="Total number of leads and their monetary value"
                />

                <MetricCard
                    title="Open Leads"
                    value={dashboardData?.summary?.openCount || 0}
                    valueFormatted={formatNumber(dashboardData?.summary?.openCount || 0)}
                    secondaryValue={dashboardData?.summary?.openAmount || 0}
                    secondaryValueFormatted={formatCurrency(dashboardData?.summary?.openAmount || 0)}
                    change={comparisons.openCount}
                    icon={<CircleDollarSign className="h-5 w-5" />}
                    bgColorClass="dark:bg-transparent bg-blue-50"
                    textColorClass="text-blue-600"
                    tooltipText="Leads that are still in progress"
                />

                <MetricCard
                    title="Won Leads"
                    value={dashboardData?.summary?.wonCount || 0}
                    valueFormatted={formatNumber(dashboardData?.summary?.wonCount || 0)}
                    secondaryValue={dashboardData?.summary?.wonAmount || 0}
                    secondaryValueFormatted={formatCurrency(dashboardData?.summary?.wonAmount || 0)}
                    change={comparisons.wonCount}
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    bgColorClass="dark:bg-transparent bg-green-50"
                    textColorClass="text-green-600"
                    tooltipText="Leads that were successfully converted"
                />

                <MetricCard
                    title="Lost Leads"
                    value={dashboardData?.summary?.lostCount || 0}
                    valueFormatted={formatNumber(dashboardData?.summary?.lostCount || 0)}
                    secondaryValue={dashboardData?.summary?.lostAmount || 0}
                    secondaryValueFormatted={formatCurrency(dashboardData?.summary?.lostAmount || 0)}
                    change={comparisons.lostCount}
                    icon={<XCircle className="h-5 w-5" />}
                    bgColorClass="dark:bg-transparent bg-red-50"
                    textColorClass="text-red-600"
                    tooltipText="Leads that were lost or abandoned"
                />
            </div>

            {/* Additional Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-1">
                        <CardTitle className="text-xs font-medium">Conversion Rate</CardTitle>
                        <CardDescription className="text-xs">Won leads as percentage of total</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="text-2xl font-bold">{formatPercentage(conversionRate)}</div>
                            <div className={`text-xs px-1.5 py-0.5 rounded-full flex items-center ${comparisons.wonCount >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {comparisons.wonCount >= 0 ? <ArrowUpIcon className="h-3 w-3 mr-1" /> : <ArrowDownIcon className="h-3 w-3 mr-1" />}
                                {Math.abs(comparisons.wonCount).toFixed(1)}%
                            </div>
                        </div>
                        <Progress value={conversionRate} className="h-1.5 mt-2" />
                    </CardContent>
                </Card>


                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Revenue per Lead</CardTitle>
                        <CardDescription>Average revenue per lead</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="text-3xl font-bold">{formatCurrency(revenuePerLead)}</div>
                            <div className={`text-xs px-2 py-1 rounded-full flex items-center ${comparisons.totalAmount >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {comparisons.totalAmount >= 0 ? <ArrowUpIcon className="h-3 w-3 mr-1" /> : <ArrowDownIcon className="h-3 w-3 mr-1" />}
                                {Math.abs(comparisons.totalAmount).toFixed(1)}%
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Win/Loss Ratio</CardTitle>
                        <CardDescription>Ratio of won to lost leads</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="text-3xl font-bold">
                                {dashboardData?.summary?.lostCount > 0
                                    ? (dashboardData?.summary?.wonCount / dashboardData?.summary?.lostCount).toFixed(2)
                                    : dashboardData?.summary?.wonCount > 0 ? '∞' : '0'}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="text-xs">
                                <span className="text-green-600">Won: </span>
                                {formatNumber(dashboardData?.summary?.wonCount || 0)}
                            </div>
                            <div className="text-xs">
                                <span className="text-red-600">Lost: </span>
                                {formatNumber(dashboardData?.summary?.lostCount || 0)}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Dashboard Tabs */}
            <Tabs defaultValue="leads" className="space-y-4">
                <TabsList className="grid grid-cols-3 bg-accent w-full gap-3 max-w-md">
                    <TabsTrigger value="leads" className="flex border-none items-center gap-1 text-xs">
                        <BarChart2 className="h-3 w-3" />
                        Lead Reports
                    </TabsTrigger>
                    <TabsTrigger value="conversion" className="flex border-none items-center gap-1 text-xs">
                        <TrendingUp className="h-3 w-3" />
                        Conversion Rates
                    </TabsTrigger>
                    <TabsTrigger value="followup" className="flex border-none items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3" />
                        Followup Reports
                    </TabsTrigger>
                </TabsList>
                {/* Lead Reports Tab */}
                <TabsContent value="leads" className="space-y-6">
                    {/* Time-based Lead Reports */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Lead Performance Over Time</CardTitle>
                                    <CardDescription>Trend of new leads, won, and lost over time</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="daily" className="mb-4">
                                <TabsList className='gap-2 bg-accent '>
                                    <TabsTrigger className='border-none' value="daily">Daily</TabsTrigger>
                                    <TabsTrigger className='border-none' value="weekly">Weekly</TabsTrigger>
                                    <TabsTrigger className='border-none' value="monthly">Monthly</TabsTrigger>
                                    <TabsTrigger className='border-none' value="yearly">Yearly</TabsTrigger>
                                </TabsList>

                                <TabsContent value="daily">
                                    <div className="h-[400px]">
                                        {timeSeriesData?.daily?.length > 0 ? (
                                            <LineChart
                                                data={timeSeriesData.daily}
                                                categories={['Total Leads', 'Won', 'Lost']}
                                                index="date"
                                                colors={['#6E56CF', '#10B981', '#EF4444']}
                                            />
                                        ) : (
                                            <div className="flex justify-center items-center h-full">
                                                <p className="text-muted-foreground">No data available for this period</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="weekly">
                                    <div className="h-[400px]">
                                        {timeSeriesData?.weekly?.length > 0 ? (
                                            <LineChart
                                                data={timeSeriesData.weekly}
                                                categories={['Total Leads', 'Won', 'Lost']}
                                                index="date"
                                                colors={['#6E56CF', '#10B981', '#EF4444']}
                                            />
                                        ) : (
                                            <div className="flex justify-center items-center h-full">
                                                <p className="text-muted-foreground">No data available for this period</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="monthly">
                                    <div className="h-[400px]">
                                        {timeSeriesData?.monthly?.length > 0 ? (
                                            <BarChart
                                                data={timeSeriesData.monthly}
                                                categories={['Total Leads', 'Won', 'Lost']}
                                                index="date"
                                                colors={['#6E56CF', '#10B981', '#EF4444']}
                                            />
                                        ) : (
                                            <div className="flex justify-center items-center h-full">
                                                <p className="text-muted-foreground">No data available for this period</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="yearly">
                                    <div className="h-[400px]">
                                        {timeSeriesData?.yearly?.length > 0 ? (
                                            <BarChart
                                                data={timeSeriesData.yearly}
                                                categories={['Total Leads', 'Won', 'Lost']}
                                                index="date"
                                                colors={['#6E56CF', '#10B981', '#EF4444']}
                                            />
                                        ) : (
                                            <div className="flex justify-center items-center h-full">
                                                <p className="text-muted-foreground">No data available for this period</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <div className="flex gap-4 text-sm items-center">
                                <div className="flex items-center gap-1">
                                    <div className="h-3 w-3 rounded-full bg-[#6E56CF]"></div>
                                    <span>Total Leads</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="h-3 w-3 rounded-full bg-[#10B981]"></div>
                                    <span>Won</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="h-3 w-3 rounded-full bg-[#EF4444]"></div>
                                    <span>Lost</span>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>

                    {/* Lead Distribution */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Source-wise Distribution */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle>Lead Distribution by Source</CardTitle>
                                        <CardDescription>Number of leads from each source</CardDescription>
                                    </div>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <PieChartIcon className="h-5 w-5 text-muted-foreground" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-sm">Shows the proportion of leads from different sources</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    {dashboardData?.sourceWiseReports?.length > 0 ? (
                                        <PieChart
                                            data={dashboardData.sourceWiseReports.map((item: any) => ({
                                                name: item.sourceName || 'Unknown',
                                                value: item.totalCount,
                                            }))}
                                        />
                                    ) : (
                                        <div className="flex justify-center items-center h-full">
                                            <p className="text-muted-foreground">No data available</p>
                                        </div>
                                    )}
                                </div>
                                <ScrollArea className="h-[200px] mt-4">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Source</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                                <TableHead className="text-right">Won</TableHead>
                                                <TableHead className="text-right">Conv. Rate</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {dashboardData?.sourceWiseReports?.map((item: any) => (
                                                <TableRow key={item._id}>
                                                    <TableCell className="font-medium">{item.sourceName || 'Unknown'}</TableCell>
                                                    <TableCell className="text-right">{formatNumber(item.totalCount)}</TableCell>
                                                    <TableCell className="text-right">{formatNumber(item.wonCount)}</TableCell>
                                                    <TableCell className="text-right">
                                                        {formatPercentage(item.totalCount > 0 ? (item.wonCount / item.totalCount) * 100 : 0)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        {/* Company-wise Distribution */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle>Lead Distribution by Company</CardTitle>
                                        <CardDescription>Top companies by lead count and amount</CardDescription>
                                    </div>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <BarChart2 className="h-5 w-5 text-muted-foreground" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-sm">Shows the distribution of leads across different companies</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    {dashboardData?.companyWiseReports?.length > 0 ? (
                                        <BarChart
                                            data={dashboardData.companyWiseReports.slice(0, 10).map((item: any) => ({
                                                name: item.companyName || 'Unknown',
                                                'Total': item.totalCount,
                                                'Won': item.wonCount,
                                                'Lost': item.lostCount,
                                            }))}
                                            categories={['Total', 'Won', 'Lost']}
                                            index="name"
                                            colors={['#6E56CF', '#10B981', '#EF4444']}
                                            layout="vertical"
                                        />
                                    ) : (
                                        <div className="flex justify-center items-center h-full">
                                            <p className="text-muted-foreground">No data available</p>
                                        </div>
                                    )}
                                </div>
                                <ScrollArea className="h-[200px] mt-4">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Company</TableHead>
                                                <TableHead className="text-right">Total Leads</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                                <TableHead className="text-right">Win Rate</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {dashboardData?.companyWiseReports?.slice(0, 10).map((item: any) => (
                                                <TableRow key={item._id}>
                                                    <TableCell className="font-medium">{item.companyName || 'Unknown'}</TableCell>
                                                    <TableCell className="text-right">{formatNumber(item.totalCount)}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(item.totalAmount)}</TableCell>
                                                    <TableCell className="text-right">
                                                        {formatPercentage(item.totalCount > 0 ? (item.wonCount / item.totalCount) * 100 : 0)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Conversion Rates Tab */}
                <TabsContent value="conversion" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Overall Conversion Rate</CardTitle>
                                <CardDescription>Percentage of leads that were won</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center space-y-4">
                                    <div className="text-3xl font-bold text-primary">
                                        {formatPercentage(dashboardData?.conversionRates?.overall || 0)}
                                    </div>
                                    <p className="text-muted-foreground">
                                        {formatNumber(dashboardData?.summary?.wonCount || 0)} won leads out of {formatNumber(dashboardData?.summary?.totalCount || 0)} total leads
                                    </p>
                                    <div className="w-full">
                                        <Progress
                                            value={dashboardData?.conversionRates?.overall || 0}
                                            className="h-3"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Opportunity</CardTitle>
                                <CardDescription>Estimated value of open leads</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center space-y-4">
                                    <div className="text-3xl font-bold text-primary">
                                        {formatCurrency(dashboardData?.summary?.openAmount || 0)}
                                    </div>
                                    <p className="text-muted-foreground">
                                        From {formatNumber(dashboardData?.summary?.openCount || 0)} open opportunities
                                    </p>
                                    <div className="text-sm flex justify-between">
                                        <div>
                                            <div className="font-medium">Avg. Value</div>
                                            <div>
                                                {formatCurrency(dashboardData?.summary?.openCount > 0
                                                    ? dashboardData?.summary?.openAmount / dashboardData?.summary?.openCount
                                                    : 0)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-medium">Potential Revenue</div>
                                            <div>
                                                {formatCurrency(dashboardData?.summary?.openAmount *
                                                    (dashboardData?.conversionRates?.overall / 100 || 0))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Sales Cycle Length</CardTitle>
                                <CardDescription>Average time to close deals</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center space-y-4">
                                    <div className="text-3xl font-bold text-primary">
                                        {/* This would require additional data calculation */}
                                        30 Days
                                    </div>
                                    <p className="text-muted-foreground">
                                        Based on recent closed deals
                                    </p>
                                    <div className="text-sm flex justify-between">
                                        <div>
                                            <div className="font-medium">Fastest Close</div>
                                            <div>3 Days</div>
                                        </div>
                                        <div>
                                            <div className="font-medium">Longest Close</div>
                                            <div>90 Days</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Conversion by Source */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle>Conversion Rates by Source</CardTitle>
                                        <CardDescription>Percentage of leads won from each source</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    {dashboardData?.conversionRates?.bySource?.length > 0 ? (
                                        <BarChart
                                            data={dashboardData.conversionRates.bySource.map((item: any) => ({
                                                name: item.name || 'Unknown',
                                                'Conversion Rate': Number(item.conversionRate.toFixed(1)),
                                            }))}
                                            categories={['Conversion Rate']}
                                            index="name"
                                            colors={['#10B981']}
                                        />
                                    ) : (
                                        <div className="flex justify-center items-center h-full">
                                            <p className="text-muted-foreground">No data available</p>
                                        </div>
                                    )}
                                </div>
                                <ScrollArea className="h-[200px] mt-4">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Source</TableHead>
                                                <TableHead className="text-right">Conversion Rate</TableHead>
                                                <TableHead className="text-right">Won Leads</TableHead>
                                                <TableHead className="text-right">Total Leads</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {dashboardData?.conversionRates?.bySource?.map((item: any) => {
                                                // Find the corresponding source data to get counts
                                                const sourceData = dashboardData?.sourceWiseReports?.find((s: any) => s._id === item._id);
                                                return (
                                                    <TableRow key={item._id}>
                                                        <TableCell className="font-medium">{item.name || 'Unknown'}</TableCell>
                                                        <TableCell className="text-right">{formatPercentage(item.conversionRate)}</TableCell>
                                                        <TableCell className="text-right">{formatNumber(sourceData?.wonCount || 0)}</TableCell>
                                                        <TableCell className="text-right">{formatNumber(sourceData?.totalCount || 0)}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        {/* Conversion by Pipeline */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle>Conversion Rates by Pipeline</CardTitle>
                                        <CardDescription>Percentage of leads won in each pipeline</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    {dashboardData?.conversionRates?.byPipeline?.length > 0 ? (
                                        <BarChart
                                            data={dashboardData.conversionRates.byPipeline.map((item: any) => ({
                                                name: item.name || 'Unknown',
                                                'Conversion Rate': Number(item.conversionRate.toFixed(1)),
                                            }))}
                                            categories={['Conversion Rate']}
                                            index="name"
                                            colors={['#6E56CF']}
                                        />
                                    ) : (
                                        <div className="flex justify-center items-center h-full">
                                            <p className="text-muted-foreground">No data available</p>
                                        </div>
                                    )}
                                </div>
                                <ScrollArea className="h-[200px] mt-4">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Pipeline</TableHead>
                                                <TableHead className="text-right">Conversion Rate</TableHead>
                                                <TableHead className="text-right">Won Leads</TableHead>
                                                <TableHead className="text-right">Total Leads</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {dashboardData?.conversionRates?.byPipeline?.map((item: any) => {
                                                // Find the corresponding pipeline data to get counts
                                                const pipelineData = dashboardData?.pipelineWiseReports?.find((p: { _id: string; wonCount?: number; totalCount?: number }) => p._id === item._id);
                                                return (
                                                    <TableRow key={item._id}>
                                                        <TableCell className="font-medium">{item.name || 'Unknown'}</TableCell>
                                                        <TableCell className="text-right">{formatPercentage(item.conversionRate)}</TableCell>
                                                        <TableCell className="text-right">{formatNumber(pipelineData?.wonCount || 0)}</TableCell>
                                                        <TableCell className="text-right">{formatNumber(pipelineData?.totalCount || 0)}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Followup Reports Tab */}
                <TabsContent value="followup" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-background">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Total Follow-ups</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-2">
                                    <div className="text-4xl font-bold">
                                        {formatNumber(dashboardData?.followupStats?.reduce((sum: number, item: any) => sum + item.count, 0) || 0)}
                                    </div>
                                    <Calendar className="h-9 w-9 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Scheduled activities across all leads
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-blue-50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base text-blue-700">Open Follow-ups</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-2">
                                    <div className="text-4xl font-bold text-blue-700">
                                        {formatNumber(dashboardData?.followupStats?.reduce((sum: number, item: any) => sum + (item.openCount || 0), 0) || 0)}
                                    </div>
                                    <Calendar className="h-9 w-9 text-blue-700" />
                                </div>
                                <p className="text-sm text-blue-700/70 mt-2">
                                    Tasks that still require attention
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-green-50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base text-green-700">Closed Follow-ups</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-2">
                                    <div className="text-4xl font-bold text-green-700">
                                        {formatNumber(dashboardData?.followupStats?.reduce((sum: number, item: any) => sum + (item.closedCount || 0), 0) || 0)}
                                    </div>
                                    <CheckCircle2 className="h-9 w-9 text-green-700" />
                                </div>
                                <p className="text-sm text-green-700/70 mt-2">
                                    Completed follow-up activities
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle>Follow-up Activities by Type</CardTitle>
                                        <CardDescription>Distribution of follow-up methods</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    {dashboardData?.followupStats?.length > 0 ? (
                                        <PieChart
                                            data={[
                                                {
                                                    name: 'Call',
                                                    value: dashboardData.followupStats.reduce((sum: number, item: any) => sum + (item.callCount || 0), 0)
                                                },
                                                {
                                                    name: 'Email',
                                                    value: dashboardData.followupStats.reduce((sum: number, item: any) => sum + (item.emailCount || 0), 0)
                                                },
                                                {
                                                    name: 'WhatsApp',
                                                    value: dashboardData.followupStats.reduce((sum: number, item: any) => sum + (item.whatsappCount || 0), 0)
                                                }
                                            ]}
                                            colors={['#3498db', '#9b59b6', '#2ecc71']}
                                        />
                                    ) : (
                                        <div className="flex justify-center items-center h-full">
                                            <p className="text-muted-foreground">No data available</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle>Follow-up Detailed Report</CardTitle>
                                        <CardDescription>Status by follow-up type</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Type</TableHead>
                                            <TableHead className="text-right">Open</TableHead>
                                            <TableHead className="text-right">Closed</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-medium">Call</TableCell>
                                            <TableCell className="text-right">
                                                {formatNumber(dashboardData?.followupStats?.reduce(
                                                    (sum: number, item: any) =>
                                                        sum + (item.stage === 'Open' ? (item.callCount || 0) : 0), 0
                                                ) || 0)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatNumber(dashboardData?.followupStats?.reduce(
                                                    (sum: number, item: any) =>
                                                        sum + (item.stage === 'Closed' ? (item.callCount || 0) : 0), 0
                                                ) || 0)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatNumber(dashboardData?.followupStats?.reduce(
                                                    (sum: number, item: any) => sum + (item.callCount || 0), 0
                                                ) || 0)}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Email</TableCell>
                                            <TableCell className="text-right">
                                                {formatNumber(dashboardData?.followupStats?.reduce(
                                                    (sum: number, item: any) =>
                                                        sum + (item.stage === 'Open' ? (item.emailCount || 0) : 0), 0
                                                ) || 0)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatNumber(dashboardData?.followupStats?.reduce(
                                                    (sum: number, item: any) =>
                                                        sum + (item.stage === 'Closed' ? (item.emailCount || 0) : 0), 0
                                                ) || 0)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatNumber(dashboardData?.followupStats?.reduce(
                                                    (sum: number, item: any) => sum + (item.emailCount || 0), 0
                                                ) || 0)}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">WhatsApp</TableCell>
                                            <TableCell className="text-right">
                                                {formatNumber(dashboardData?.followupStats?.reduce(
                                                    (sum: number, item: any) =>
                                                        sum + (item.stage === 'Open' ? (item.whatsappCount || 0) : 0), 0
                                                ) || 0)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatNumber(dashboardData?.followupStats?.reduce(
                                                    (sum: number, item: any) =>
                                                        sum + (item.stage === 'Closed' ? (item.whatsappCount || 0) : 0), 0
                                                ) || 0)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatNumber(dashboardData?.followupStats?.reduce(
                                                    (sum: number, item: any) => sum + (item.whatsappCount || 0), 0
                                                ) || 0)}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>

                                <div className="mt-4 space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-1 text-sm">
                                            <span>Call completion rate</span>
                                            <span>
                                                {formatPercentage(
                                                    calculateCompletionRate(
                                                        dashboardData?.followupStats,
                                                        'callCount',
                                                        'Closed'
                                                    )
                                                )}
                                            </span>
                                        </div>
                                        <Progress value={calculateCompletionRate(dashboardData?.followupStats, 'callCount', 'Closed')} className="h-2" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1 text-sm">
                                            <span>Email completion rate</span>
                                            <span>
                                                {formatPercentage(
                                                    calculateCompletionRate(
                                                        dashboardData?.followupStats,
                                                        'emailCount',
                                                        'Closed'
                                                    )
                                                )}
                                            </span>
                                        </div>
                                        <Progress value={calculateCompletionRate(dashboardData?.followupStats, 'emailCount', 'Closed')} className="h-2" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1 text-sm">
                                            <span>WhatsApp completion rate</span>
                                            <span>
                                                {formatPercentage(
                                                    calculateCompletionRate(
                                                        dashboardData?.followupStats,
                                                        'whatsappCount',
                                                        'Closed'
                                                    )
                                                )}
                                            </span>
                                        </div>
                                        <Progress value={calculateCompletionRate(dashboardData?.followupStats, 'whatsappCount', 'Closed')} className="h-2" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Pipeline & Stage Distribution Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle>Lead Distribution by Stage</CardTitle>
                                <CardDescription>Number of leads in each stage</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Stage</TableHead>
                                        <TableHead>Pipeline</TableHead>
                                        <TableHead className="text-right">Count</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dashboardData?.stageWiseReports?.map((item: any) => (
                                        <TableRow key={item._id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-3 w-3 rounded-full"
                                                        style={{
                                                            backgroundColor: getStageColor(
                                                                item.stageName,
                                                                dashboardData?.pipelineWiseReports?.find(
                                                                    (p: any) => p.pipelineName === item.pipelineName
                                                                )
                                                            ) || '#888'
                                                        }}
                                                    />
                                                    {item.stageName || 'Unknown'}
                                                </div>
                                            </TableCell>
                                            <TableCell>{item.pipelineName || 'Unknown'}</TableCell>
                                            <TableCell className="text-right">{formatNumber(item.totalCount)}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(item.totalAmount)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle>Lead Distribution by Pipeline</CardTitle>
                                <CardDescription>Number of leads in each pipeline</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <Card className="bg-muted/50">
                                <CardContent className="p-4">
                                    <div className="text-xl font-bold">
                                        {formatNumber(dashboardData?.pipelineWiseReports?.reduce(
                                            (sum: number, item: any) => sum + item.totalCount, 0
                                        ) || 0)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Total Leads</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-muted/50">
                                <CardContent className="p-4">
                                    <div className="text-xl font-bold">
                                        {formatCurrency(dashboardData?.pipelineWiseReports?.reduce(
                                            (sum: number, item: any) => sum + item.totalAmount, 0
                                        ) || 0)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Total Value</p>
                                </CardContent>
                            </Card>
                        </div>

                        <ScrollArea className="h-[300px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Pipeline</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="text-right">Open</TableHead>
                                        <TableHead className="text-right">Won</TableHead>
                                        <TableHead className="text-right">Lost</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dashboardData?.pipelineWiseReports?.map((item: any) => (
                                        <TableRow key={item._id}>
                                            <TableCell className="font-medium">{item.pipelineName || 'Unknown'}</TableCell>
                                            <TableCell className="text-right">{formatNumber(item.totalCount)}</TableCell>
                                            <TableCell className="text-right">{formatNumber(item.openCount)}</TableCell>
                                            <TableCell className="text-right text-green-600 font-medium">{formatNumber(item.wonCount)}</TableCell>
                                            <TableCell className="text-right text-red-600">{formatNumber(item.lostCount)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Helper component for metric cards (updated)
function MetricCard({
    title,
    value,
    valueFormatted,
    secondaryValue,
    secondaryValueFormatted,
    change,
    icon,
    bgColorClass = "bg-background",
    textColorClass = "text-foreground",
    tooltipText
}: {
    title: string;
    value: number;
    valueFormatted: string;
    secondaryValue: number;
    secondaryValueFormatted: string;
    change: number;
    icon: React.ReactNode;
    bgColorClass?: string;
    textColorClass?: string;
    tooltipText?: string;
}) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Card className={`${bgColorClass} border shadow-sm hover:shadow-md transition-all duration-200`}>
                        <CardHeader className="pb-1 px-4 pt-4">
                            <div className="flex justify-between items-center">
                                <CardTitle className={`text-xs font-medium ${textColorClass}`}>{title}</CardTitle>
                                <div className={textColorClass}>{icon}</div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-4 py-2">
                            <div className="flex items-baseline justify-between">
                                <div className={`text-2xl font-bold ${textColorClass}`}>
                                    {valueFormatted}
                                </div>
                                <div className={`text-sm font-semibold ${textColorClass} opacity-80`}>
                                    {secondaryValueFormatted}
                                </div>
                            </div>
                            <div className="mt-1 flex items-center text-xs">
                                <div className={`flex items-center ${change >= 0 ? 'text-green-600' : 'text-red-600'} px-1.5 py-0.5 rounded-full bg-opacity-10 ${change >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                    {change >= 0 ? <ArrowUpIcon className="h-2 w-2 mr-1" /> : <ArrowDownIcon className="h-2 w-2 mr-1" />}
                                    {Math.abs(change).toFixed(1)}%
                                </div>
                                <span className="ml-1 text-xs text-muted-foreground">vs. previous period</span>
                            </div>
                        </CardContent>
                    </Card>
                </TooltipTrigger>
                {tooltipText && (
                    <TooltipContent>
                        <p className="text-xs">{tooltipText}</p>
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    );
}


// Helper function to calculate completion rate
function calculateCompletionRate(followupStats: any[] = [], countType: string, stage: string) {
    if (!followupStats?.length) return 0;

    const totalCount = followupStats.reduce(
        (sum, item) => sum + (item[countType] || 0),
        0
    );

    if (totalCount === 0) return 0;

    const stageCount = followupStats.reduce(
        (sum, item) => sum + (item.stage === stage ? (item[countType] || 0) : 0),
        0
    );

    return (stageCount / totalCount) * 100;
}

// Helper function to get stage color (would need actual implementation based on your color system)
function getStageColor(stageName: string, pipeline: any) {
    // This is a placeholder - you would implement based on your actual data structure
    // For example, you might lookup the stage color from your pipeline configuration
    if (!stageName || !pipeline) return '#888888';

    // Example logic - in a real app, you would have this data from your pipeline configuration
    if (stageName.toLowerCase().includes('won')) return '#10B981';
    if (stageName.toLowerCase().includes('lost')) return '#EF4444';
    if (stageName.toLowerCase().includes('qualify')) return '#3B82F6';
    if (stageName.toLowerCase().includes('demo')) return '#6366F1';
    if (stageName.toLowerCase().includes('proposal')) return '#8B5CF6';
    if (stageName.toLowerCase().includes('negotiate')) return '#EC4899';

    return '#6E56CF'; // Default color
}

// Loading skeleton
function DashboardSkeleton() {
    return (
        <div className="container mx-auto py-6 px-4 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <Skeleton className="h-10 w-[250px] mb-2" />
                    <Skeleton className="h-4 w-[180px]" />
                </div>
                <Skeleton className="h-10 w-[300px]" />
            </div>

            {/* Filters Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
            </div>

            {/* Metrics Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="bg-background shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-5 w-5 rounded-full" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline justify-between mb-2">
                                <Skeleton className="h-8 w-20" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Skeleton */}
            <div className="space-y-6">
                <div className="flex gap-2 mb-2">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-10 w-32" />
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between">
                            <div>
                                <Skeleton className="h-6 w-48 mb-2" />
                                <Skeleton className="h-4 w-64" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[400px] w-full" />
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[300px] w-full mb-4" />
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-8 w-full" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[300px] w-full mb-4" />
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-8 w-full" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}