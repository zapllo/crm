"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter, useSearchParams } from 'next/navigation'

export default function DashboardHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [timeRange, setTimeRange] = useState(searchParams.get('timeRange') || 'this-month')
  
  const timeRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this-week', label: 'This Week' },
    { value: 'last-week', label: 'Last Week' },
    { value: 'this-month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'this-year', label: 'This Year' },
    { value: 'all-time', label: 'All Time' },
    { value: 'custom', label: 'Custom' },
  ]
  
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
    
    const params = new URLSearchParams(searchParams)
    params.set('timeRange', value)
    
    router.push(`?${params.toString()}`)
  }
  
  const handleClearFilter = () => {
    setTimeRange('this-month')
    router.push('?timeRange=this-month')
  }
  
  return (
    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="flex space-x-2">
        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            {timeRangeOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Additional filter selects for Pipeline, Source, Sales Person, Company */}
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pipeline" />
          </SelectTrigger>
          <SelectContent>
            {/* Pipeline options */}
          </SelectContent>
        </Select>
        
        {/* Add more Select components */}
      </div>
      
      <Button variant="outline" onClick={handleClearFilter}>
        Clear Filter
      </Button>
    </div>
  )
}