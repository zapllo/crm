'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Plus,
  RefreshCw,
  XCircle
} from 'lucide-react'

// Component imports
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from '@/hooks/use-toast'

// Demo ticket data
const DEMO_TICKETS = [
  {
    id: 'TKT-1001',
    subject: 'Cannot import contacts from CSV file',
    status: 'open',
    priority: 'high',
    category: 'technical',
    createdAt: '2023-04-15T10:30:00Z',
    updatedAt: '2023-04-15T14:45:00Z',
    messages: [
      {
        sender: 'user',
        content: 'I\'m trying to import contacts from a CSV file, but I keep getting an error saying "Invalid format". I\'ve checked my CSV file and it seems to follow the template format.',
        timestamp: '2023-04-15T10:30:00Z'
      },
      {
        sender: 'agent',
        content: 'Hello! I\'d be happy to help you with this issue. Could you please share a screenshot of the error message you\'re seeing? Also, can you confirm that all required columns in the CSV template are present in your file?',
        timestamp: '2023-04-15T11:15:00Z',
        agent: 'Sarah Thompson'
      },
      {
        sender: 'user',
        content: 'Here\'s a screenshot of the error. Yes, I\'ve included all the required columns as per the template.',
        timestamp: '2023-04-15T12:05:00Z',
        attachments: [
          { name: 'error_screenshot.png', url: '#' }
        ]
      },
      {
        sender: 'agent',
        content: 'Thank you for sharing the screenshot. I can see the issue now. It appears that there might be some special characters in your CSV that are causing the import to fail. I\'d recommend trying these steps:\n\n1. Open your CSV in a text editor\n2. Save it with UTF-8 encoding\n3. Make sure there are no quotation marks around the data\n\nPlease try these steps and let me know if the issue persists.',
        timestamp: '2023-04-15T14:45:00Z',
        agent: 'Sarah Thompson'
      },
    ]
  },

];

export default function TicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<any[]>([])
  const [filteredTickets, setFilteredTickets] = useState<any[]>([])
  const [activeTicket, setActiveTicket] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [replyContent, setReplyContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [newTicketDialog, setNewTicketDialog] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // New ticket form state
  const [newTicketSubject, setNewTicketSubject] = useState('')
  const [newTicketCategory, setNewTicketCategory] = useState('')
  const [newTicketPriority, setNewTicketPriority] = useState('')
  const [newTicketMessage, setNewTicketMessage] = useState('')
  const [isSubmittingNewTicket, setIsSubmittingNewTicket] = useState(false)

  // Fetch tickets from API
  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // In a real implementation, replace this with a call to your API
        const response = await fetch('/api/help/tickets')

        if (!response.ok) {
          throw new Error('Failed to fetch tickets')
        }

        const data = await response.json()
        setTickets(data.tickets || [])
        setFilteredTickets(data.tickets || [])
      } catch (err) {
        console.error('Error fetching tickets:', err)
        // For demo purposes, use dummy data
        setTickets(DEMO_TICKETS)
        setFilteredTickets(DEMO_TICKETS)
        setError('Could not connect to ticket system. Using demo data.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTickets()
  }, [])

  // Filter tickets based on active tab and search query
  useEffect(() => {
    if (!tickets.length) return

    let result = [...tickets]

    // Filter by tab
    if (activeTab !== 'all') {
      result = result.filter(ticket => {
        if (activeTab === 'open') return ticket.status === 'open' || ticket.status === 'pending'
        if (activeTab === 'closed') return ticket.status === 'closed'
        return true
      })
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        ticket => ticket.subject.toLowerCase().includes(query) ||
          ticket.id.toLowerCase().includes(query)
      )
    }

    setFilteredTickets(result)
  }, [activeTab, searchQuery, tickets])


  // Add this function near other handler functions
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      // Check file size (limit to 5MB per file)
      const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024)

      if (oversizedFiles.length > 0) {
        toast({
          title: "Files too large",
          description: "Some files exceed the 5MB size limit and were not added.",
          variant: "destructive"
        })

        // Filter out oversized files
        const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024)
        setSelectedFiles(prev => [...prev, ...validFiles])
      } else {
        setSelectedFiles(prev => [...prev, ...files])
      }
    }
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Update the handleSubmitReply function to include file uploads
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!replyContent.trim() && selectedFiles.length === 0 || !activeTicket) {
      return
    }

    setIsSending(true)

    try {
      // Upload files first if any
      let fileUrls: string[] = []

      if (selectedFiles.length > 0) {
        const formData = new FormData()
        selectedFiles.forEach(file => {
          formData.append('files', file)
        })

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload attachments')
        }

        const uploadData = await uploadResponse.json()
        fileUrls = uploadData.fileUrls || []
      }

      // In a real implementation, replace this with a call to your API
      const response = await fetch(`/api/help/tickets/${activeTicket.ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyContent,
          attachments: fileUrls.map(url => ({
            name: selectedFiles.find(file => url.includes(encodeURIComponent(file.name)))?.name || 'attachment',
            url
          }))
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit reply')
      }

      // For demo purposes, update the UI directly
      const now = new Date().toISOString()
      const attachments = fileUrls.map(url => ({
        name: selectedFiles.find(file => url.includes(encodeURIComponent(file.name)))?.name || 'attachment',
        url
      }))

      const updatedTickets = tickets.map(ticket => {
        if (ticket.id === activeTicket.id) {
          return {
            ...ticket,
            updatedAt: now,
            messages: [
              ...ticket.messages,
              {
                sender: 'user',
                content: replyContent,
                timestamp: now,
                attachments: attachments.length > 0 ? attachments : undefined
              }
            ]
          }
        }
        return ticket
      })

      setTickets(updatedTickets)
      setActiveTicket({
        ...activeTicket,
        updatedAt: now,
        messages: [
          ...activeTicket.messages,
          {
            sender: 'user',
            content: replyContent,
            timestamp: now,
            attachments: attachments.length > 0 ? attachments : undefined
          }
        ]
      })

      setReplyContent('')
      setSelectedFiles([])

      toast({
        title: "Reply sent",
        description: "Your reply has been sent successfully."
      })
    } catch (err) {
      console.error('Error submitting reply:', err)
      toast({
        title: "Error",
        description: "Failed to send your reply. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

  // Create new ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newTicketSubject.trim() || !newTicketMessage.trim() || !newTicketCategory || !newTicketPriority) {
      // Show validation error
      return
    }

    setIsSubmittingNewTicket(true)

    try {
      // In a real implementation, replace this with a call to your API
      const response = await fetch('/api/help/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: newTicketSubject,
          message: newTicketMessage,
          category: newTicketCategory,
          priority: newTicketPriority,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create ticket')
      }

      const data = await response.json()

      // For demo purposes, update the UI directly
      const newTicket = {
        id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        subject: newTicketSubject,
        status: 'open',
        priority: newTicketPriority,
        category: newTicketCategory,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            sender: 'user',
            content: newTicketMessage,
            timestamp: new Date().toISOString(),
          }
        ]
      }

      setTickets([newTicket, ...tickets])
      setFilteredTickets([newTicket, ...filteredTickets])

      // Reset form
      setNewTicketSubject('')
      setNewTicketCategory('')
      setNewTicketPriority('')
      setNewTicketMessage('')
      setNewTicketDialog(false)

      // Show success notification
    } catch (err) {
      console.error('Error creating ticket:', err)
      // Show error notification
    } finally {
      setIsSubmittingNewTicket(false)
    }
  }

  // Handle ticket selection
  const selectTicket = (ticket: any) => {
    setActiveTicket(ticket)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-amber-500" />
      case 'closed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-blue-500" />
    }
  }

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900">{status}</Badge>
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900">{status}</Badge>
      case 'closed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900">{status}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-900">{priority}</Badge>
      case 'medium':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900">{priority}</Badge>
      case 'high':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900">{priority}</Badge>
      case 'critical':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900">{priority}</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tickets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mt-12 h-full max-h-screen overflow-y-scroll mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/help')}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Help Center</span>
        </Button>
        <h1 className="text-2xl font-bold ml-auto">Support Tickets</h1>

        <Dialog open={newTicketDialog} onOpenChange={setNewTicketDialog}>
          <DialogTrigger asChild>
            <Button className="ml-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] z-[100]">
            <DialogHeader>
              <DialogTitle>Create New Support Ticket</DialogTitle>
              <DialogDescription>
                Submit a new ticket to our support team for assistance.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateTicket} className="space-y-6 py-4">
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={newTicketSubject}
                  onChange={e => setNewTicketSubject(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category
                  </label>
                  <Select
                    value={newTicketCategory}
                    onValueChange={setNewTicketCategory}
                    required
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className='z-[100]'>
                      <SelectItem className='hover:bg-accent' value="account">Account</SelectItem>
                      <SelectItem className='hover:bg-accent' value="billing">Billing</SelectItem>
                      <SelectItem className='hover:bg-accent' value="technical">Technical Issue</SelectItem>
                      <SelectItem className='hover:bg-accent' value="feature_request">Feature Request</SelectItem>
                      <SelectItem className='hover:bg-accent' value="inquiry">General Inquiry</SelectItem>
                      <SelectItem className='hover:bg-accent' value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="priority" className="text-sm font-medium">
                    Priority
                  </label>
                  <Select
                    value={newTicketPriority}
                    onValueChange={setNewTicketPriority}
                    required
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className='z-[100]'>
                      <SelectItem className='hover:bg-accent' value="low">Low - General question</SelectItem>
                      <SelectItem className='hover:bg-accent' value="medium">Medium - Need assistance</SelectItem>
                      <SelectItem className='hover:bg-accent' value="high">High - System issue</SelectItem>
                      <SelectItem className='hover:bg-accent' value="critical">Critical - System down</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  value={newTicketMessage}
                  onChange={e => setNewTicketMessage(e.target.value)}
                  required
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewTicketDialog(false)}
                  disabled={isSubmittingNewTicket}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingNewTicket}
                >
                  {isSubmittingNewTicket ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Ticket"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 text-amber-600" />
          <div>
            <p className="font-medium">Note</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 bg-accent gap-2 w-full mb-4">
              <TabsTrigger className='border-none' value="all">All</TabsTrigger>
              <TabsTrigger className='border-none' value="open">Open</TabsTrigger>
              <TabsTrigger className='border-none' value="closed">Closed</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="border rounded-md overflow-hidden">
            {filteredTickets.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <h3 className="font-medium">No tickets found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery
                    ? "Try changing your search terms"
                    : "Create a new ticket to get help from our support team"}
                </p>
                {!searchQuery && (
                  <Button
                    className="mt-4"
                    size="sm"
                    onClick={() => setNewTicketDialog(true)}
                  >
                    Create Ticket
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {filteredTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${activeTicket?.id === ticket.id ? 'bg-muted' : ''
                      }`}
                    onClick={() => selectTicket(ticket)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(ticket.status)}
                        <div>
                          <h3 className="font-medium text-sm line-clamp-1">{ticket.subject}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {ticket.ticketId} • {formatDate(ticket.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {!activeTicket ? (
            <div className="border rounded-md h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No ticket selected</h3>
                <p className="text-muted-foreground mt-2 mb-6">
                  Select a ticket from the list to view its details, or create a new ticket to get help from our support team.
                </p>
                <Button onClick={() => setNewTicketDialog(true)}>
                  Create New Ticket
                </Button>
              </div>
            </div>
          ) : (
            <Card className="h-full flex max-h-screen  overflow-y-scroll flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex gap-2 items-center">
                      <h2 className="text-xl font-bold">{activeTicket.subject}</h2>
                      {getStatusBadge(activeTicket.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activeTicket.id} • Created {formatDate(activeTicket.createdAt)}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ticket Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => { }}>
                        <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                      </DropdownMenuItem>
                      {activeTicket.status !== 'closed' && (
                        <>
                          <DropdownMenuItem onClick={() => { }}>
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Closed
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => { }} className="text-red-600">
                            <XCircle className="h-4 w-4 mr-2" /> Close Ticket
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex gap-2 mt-4">
                  <div className="text-sm px-2 py-1 bg-muted rounded-md flex items-center">
                    <span className="text-muted-foreground mr-1">Category:</span>
                    <span className="font-medium capitalize">{activeTicket.category.replace('_', ' ')}</span>
                  </div>
                  <div className="text-sm px-2 py-1 bg-muted rounded-md flex items-center">
                    <span className="text-muted-foreground mr-1">Priority:</span>
                    <span className="font-medium capitalize">{activeTicket.priority}</span>
                  </div>
                </div>
              </CardHeader>

              <Separator />

              <CardContent className="pt-4 overflow-y-auto flex-grow">
                <div className="space-y-6">
                  {activeTicket.messages.map((message: any, index: number) => (
                    <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : ''}`}>
                      <div className={`max-w-[85%] ${message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                        } rounded-lg p-4`}>
                        {message.sender === 'agent' && (
                          <div className="mb-2 pb-2 border-b border-muted-foreground/20 flex justify-between items-center">
                            <span className="font-medium">{message.agent || 'Support Agent'}</span>
                            <span className="text-xs text-primary-foreground/70">{formatDate(message.timestamp)}</span>
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-muted-foreground/20">
                            <p className="text-sm font-medium mb-2">Attachments:</p>
                            <div className="flex flex-wrap gap-2">
                              {message.attachments.map((attachment: any, i: number) => (
                                <a
                                  key={i}
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={attachment.name}
                                  className="inline-flex items-center justify-center h-8 py-1 px-3 text-xs font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                                >
                                  {attachment.name}
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 ml-1">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                  </svg>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        {message.sender === 'user' && (
                          <div className="mt-1 text-right">
                            <span className="text-xs text-primary-foreground/70">{formatDate(message.timestamp)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>


              {activeTicket.status !== 'closed' && (
                <>
                  <Separator />
                  <CardFooter className="pt-4 pb-4">
                    <form onSubmit={handleSubmitReply} className="w-full">
                      <div className="space-y-2">
                        <textarea
                          rows={4}
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Type your reply..."
                          value={replyContent}
                          onChange={e => setReplyContent(e.target.value)}
                        />

                        {selectedFiles.length > 0 && (
                          <div className="border rounded-md p-3 bg-muted/50">
                            <p className="text-sm font-medium mb-2">Selected Files:</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedFiles.map((file, index) => (
                                <div key={index} className="text-xs flex items-center gap-1 bg-background border rounded-md px-2 py-1">
                                  <span className="max-w-[120px] truncate">{file.name}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 rounded-full"
                                    onClick={() => removeSelectedFile(index)}
                                  >
                                    <XCircle className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            onChange={handleFileSelection}
                            className="hidden"
                            accept="image/*,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                          />
                          <Button
                            variant="outline"
                            type="button"
                            className="text-xs h-8"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="17 8 12 3 7 8"></polyline>
                              <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            Attach Files
                          </Button>
                          <Button
                            type="submit"
                            disabled={(!replyContent.trim() && selectedFiles.length === 0) || isSending}
                          >
                            {isSending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              "Send Reply"
                            )}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </CardFooter>
                </>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
