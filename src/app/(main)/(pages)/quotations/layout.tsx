'use client'

import QuotationSidebar from '@/components/sidebar/quotationSidebar'
import React, { useEffect, useState } from 'react'
import { Separator } from "@/components/ui/separator"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { Lock, FileText, Sparkles, CheckCircle2, Gift } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

type Props = { children: React.ReactNode }

const QuotationLayout = (props: Props) => {
    const [hasAccess, setHasAccess] = useState<boolean | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        // Check if user has access to Quotations
        const checkAccess = async () => {
            try {
                const response = await fetch('/api/check-quotation-access')
                const data = await response.json()

                setHasAccess(data.hasAccess)
                setLoading(false)
            } catch (error) {
                console.error('Failed to check quotation access:', error)
                setHasAccess(false)
                setLoading(false)
            }
        }

        checkAccess()
    }, [])

    const handlePurchase = () => {
        router.push('/settings/billing?product=quotation')
    }

    if (loading) {
        return (
            <div className="h-[calc(100vh-3rem)] mt-12 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!hasAccess) {
        return (
            <div className="h-full max-h-screen m-auto mt-12  overflow-y-scroll bg-gradient-to-b from-background to-muted">
                <div className="container h-full flex items-center justify-center px-4 py-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-3xl w-full"
                    >
                        <Card className="border-2 border-primary/20 overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-purple-600/10 to-orange-500/10 text-center pb-6">
                                <div className="mx-auto mb-2 bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center">
                                    <FileText className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle className="text-2xl md:text-3xl">Unlock Zapllo Quotations</CardTitle>
                                <CardDescription className="text-base md:text-lg">
                                    Streamline your quotation process and close deals faster
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-4 flex items-center">
                                            <Sparkles className="h-5 w-5 mr-2 text-primary" />
                                            Key Features
                                        </h3>
                                        <ul className="space-y-3">
                                            {[
                                                "Customizable Templates",
                                                "Product Catalog",
                                                "Automated Calculations",
                                                "Digital Signatures",
                                                "PDF Export",
                                                "Quotation Tracking",
                                                "Integration with CRM"
                                            ].map((feature, i) => (
                                                <motion.li
                                                    key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="flex items-start"
                                                >
                                                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <div className="bg-muted rounded-lg p-5 h-full">
                                            <h3 className="font-semibold text-lg mb-4 flex items-center">
                                                <Gift className="h-5 w-5 mr-2 text-primary" />
                                                Why Upgrade?
                                            </h3>
                                            <ul className="space-y-3">
                                                <li className="flex items-start">
                                                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                                    <span>Save up to 5 hours per week on manual quotation tasks</span>
                                                </li>
                                                <li className="flex items-start">
                                                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                                    <span>Increase conversion rates with professional quotes</span>
                                                </li>
                                                <li className="flex items-start">
                                                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                                    <span>Reduce errors with automated calculations</span>
                                                </li>
                                            </ul>

                                            <div className="mt-5 text-center">
                                                <Badge className="bg-gradient-to-r from-purple-600 to-orange-500 mb-2">
                                                    <Sparkles className="h-4 w-4 mr-1" /> New
                                                </Badge>
                                                <div className="text-xl font-bold">
                                                    ₹2,999 <span className="text-sm font-normal text-muted-foreground">per user / year</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <motion.div
                                    className="mt-8 text-center"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        onClick={handlePurchase}
                                        className="w-full md:w-2/3 lg:w-1/2 py-6 text-lg bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
                                    >
                                        Unlock Quotations
                                    </Button>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Get started instantly after purchase
                                    </p>
                                </motion.div>
                            </CardContent>
                            <CardFooter className="text-center justify-center bg-muted/50 py-4">
                                <Button
                                    variant="link"
                                    onClick={() => {
                                        toast({
                                            title: "Need help?",
                                            description: "Our team is available to answer your questions about Zapllo Quotations.",
                                        })
                                    }}
                                >
                                    Want to learn more? Contact us: support@zapllo.com
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className='h-[calc(100vh-3rem)] mt-12 overflow-hidden'>
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={20} minSize={20} maxSize={30}>
                    <QuotationSidebar />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={75}>
                    <div className="h-full overflow-auto scrollbar-hide p-6">
                        <div className="mx-auto max">
                            {props.children}
                        </div>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}

export default QuotationLayout
