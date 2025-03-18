
'use client'

import InfoBar from '@/components/infobar'
import CRMSidebar from '@/components/sidebar/crmSidebar'
import SettingsOptions from '@/components/sidebar/settingsSidebar'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

type Props = { children: React.ReactNode }

const Layout = (props: Props) => {

    return (
        <div className='flex overflow-hidden mt-12 scrollbar-hide h-full '>
            <div className="flex-shrink-0 w-[250px]">
                <CRMSidebar />
            </div>
            {/* Main content area */}
            <div className="flex-grow overflow-y-scroll scrollbar-hide">
                {/* <InfoBar /> */}
                {props.children}
            </div>
        </div>
    )
}

export default Layout