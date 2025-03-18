
'use client'


import TeamsSidebar from '@/components/sidebar/teamsSidebar'
import React from 'react'

type Props = { children: React.ReactNode }

const Layout = (props: Props) => {

    return (
        <div className='flex overflow-hidden mt-12 scrollbar-hide h-full '>
            <TeamsSidebar />
            <div className='w-full '>
                {/* <InfoBar /> */}
                {props.children}
            </div>
        </div>
    )
}

export default Layout