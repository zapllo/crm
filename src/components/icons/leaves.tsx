import clsx from 'clsx'
import { Calendar, CalendarClock, CalendarDays } from 'lucide-react'
import React from 'react'

type Props = {
    selected: boolean
}

const Leaves = ({ selected }: Props) => {
    return (
        <CalendarDays  className='h-3' />

    )
}

export default Leaves
