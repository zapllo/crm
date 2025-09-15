'use client'

import SettingsOptions from '@/components/sidebar/settingsSidebar'
import React from 'react'
import { Separator } from "@/components/ui/separator"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

type Props = { children: React.ReactNode }

const Layout = (props: Props) => {
    return (
        <div className='h-[calc(100vh-3rem)] mt-12 overflow-hidden'>
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={20} minSize={20} maxSize={30}>
                    <SettingsOptions />
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

export default Layout