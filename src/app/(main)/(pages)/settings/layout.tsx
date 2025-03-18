
'use client'

import InfoBar from '@/components/infobar'
import SettingsOptions from '@/components/sidebar/settingsSidebar'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

type Props = { children: React.ReactNode }

const Layout = (props: Props) => {

   

    return (
        <div className='flex overflow-hidden mt-12 scrollbar-hide h-full '>
            <SettingsOptions />
            <div className='w-full '>
                {/* <InfoBar /> */}
                {props.children}
            </div>
        </div>
    )
}

export default Layout