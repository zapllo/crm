'use client'

import CRMSidebar from '@/components/sidebar/crmSidebar'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

type Props = { children: React.ReactNode }

const Layout = (props: Props) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    return (
        <div className='h-[calc(100vh-3rem)] mt-12 overflow-hidden flex'>
            {/* Sidebar */}
            <div className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-16' : 'w-64'
                } flex-shrink-0`}>
                <CRMSidebar collapsed={sidebarCollapsed} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Toggle Button */}
                <div className=" absolute -ml-5 mt-2 p-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="h-8 w-8"
                    >
                        {sidebarCollapsed ? (
                            <PanelLeftOpen className="h-4 w-4" />
                        ) : (
                            <PanelLeftClose className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {/* Page Content */}
                <div className="flex-1 overflow-auto">
                    {props.children}
                </div>
            </div>
        </div>
    )
}

export default Layout