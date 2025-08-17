'use client'

import CRMSidebar from '@/components/sidebar/crmSidebar'
import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { QuickActions } from '@/components/ui/quick-actions'
import AddContact from '@/components/modals/contacts/addContact'
import AddCompany from '@/components/modals/companies/AddCompany'
import AddProduct from '@/components/modals/products/addProduct'
import { AddFollowupWrapper, type AddFollowupRef } from '@/components/modals/wrappers/AddFollowupWrapper'
import { AddLeadWrapper, type AddLeadRef } from '@/components/modals/wrappers/AddLeadWrapper'

type Props = { children: React.ReactNode }

const Layout = (props: Props) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    
    // Modal states for components that don't have built-in triggers
    const [isContactModalOpen, setIsContactModalOpen] = useState(false)
    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false)
    const [isProductModalOpen, setIsProductModalOpen] = useState(false)

    // Refs for components with built-in DialogTriggers
    const followupRef = useRef<AddFollowupRef>(null)
    const leadRef = useRef<AddLeadRef>(null)

    // Refresh handlers
    const handleContactCreated = () => {
        console.log('Contact created successfully')
        // You can add refresh logic here if needed
    }

    const handleCompanyCreated = () => {
        console.log('Company created successfully')
        // You can add refresh logic here if needed
    }

    const handleFollowupAdded = () => {
        console.log('Followup added successfully')
        // You can add refresh logic here if needed
    }

    const handleProductCreated = () => {
        console.log('Product created successfully')
        // You can add refresh logic here if needed
    }

    const handleLeadCreated = () => {
        console.log('Lead created successfully')
        // You can add refresh logic here if needed
    }

    return (
        <div className='h-[calc(100vh-3rem)] mt-12 overflow-hidden flex'>
            {/* Sidebar */}
            <div className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-16' : 'w-64'
                } flex-shrink-0`}>
                <CRMSidebar collapsed={sidebarCollapsed} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Toggle Button */}
                <div className="absolute -ml-5 mt-2 p-2 z-20">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="h-7 z- border shadow-sm  border-primary rounded-full dark:text-black bg-white dark:hover:text-white mt-2  w-7"
                    >
                        {sidebarCollapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <ChevronLeft className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {/* Page Content */}
                <div className="flex-1 overflow-auto">
                    {props.children}
                </div>

                {/* Quick Actions FAB */}
                <QuickActions
                    onAddLead={() => leadRef.current?.open()}
                    onAddContact={() => setIsContactModalOpen(true)}
                    onAddCompany={() => setIsCompanyModalOpen(true)}
                    onAddFollowup={() => followupRef.current?.open()}
                    onAddProduct={() => setIsProductModalOpen(true)}
                />
            </div>

            {/* Modal Components */}
            <AddContact
                isOpen={isContactModalOpen}
                setIsOpen={setIsContactModalOpen}
                onContactCreated={handleContactCreated}
            />

            <AddCompany
                isOpen={isCompanyModalOpen}
                setIsOpen={setIsCompanyModalOpen}
                onCompanyCreated={handleCompanyCreated}
            />

            <AddProduct
                isOpen={isProductModalOpen}
                setIsOpen={setIsProductModalOpen}
                onProductCreated={handleProductCreated}
            />

            {/* Wrapper Components with Refs */}
            <AddFollowupWrapper
                ref={followupRef}
                onFollowupAdded={handleFollowupAdded}
            />

            <AddLeadWrapper
                ref={leadRef}
                onLeadCreated={handleLeadCreated}
            />
        </div>
    )
}

export default Layout