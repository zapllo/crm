'use client'
import React from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import TeamsSidebar from '@/components/sidebar/teamsSidebar'

type Props = { children: React.ReactNode }

const Layout = (props: Props) => {
    return (
        <div className='h-[calc(100vh-3rem)] mt-12 overflow-hidden'>
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={20} minSize={20} maxSize={30}>
                    <TeamsSidebar />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={75}>
                    <div className="h-full overflow-auto">
                        {props.children}
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}

export default Layout