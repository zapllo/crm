import clsx from 'clsx'
import { Globe } from 'lucide-react'
import React from 'react'

type Props = {
    selected: boolean
}

const Intranet = ({ selected }: Props) => {
    return (
        <Globe className='h-3 text-white' />

  )
}

export default Intranet
