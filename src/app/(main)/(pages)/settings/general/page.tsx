import { CloudUpload, ShieldPlus } from 'lucide-react'
import React from 'react'

type Props = {}

export default function GeneralSettings({ }: Props) {
    return (
        <div className='ml-2'>
            <div className=" mt-4 bg-[#0A0D28] p-2 px-4 border rounded-xl ">
                <h1 className="text-sm text-muted-foreground">Settings</h1>
            </div>
            <div className="mb-2  mt-2 flex   px-4 py-4  ' cursor-pointer ' underline-offset-4  m border-b w-full  ">
                <ShieldPlus className="h-4" />
                <h1 className=" text-xs text-start w-full">Roles and Permissions</h1>
            </div>
            <div className="mb-2  mt-2 flex   px-4 py-4  ' cursor-pointer ' underline-offset-4  m border-b w-full  ">
                <CloudUpload className="h-4" />
                <h1 className=" text-xs text-start w-full">Bulk Data Import</h1>
            </div>
        </div>
    )
}