import clsx from 'clsx'
import React from 'react'

type Props = { selected: boolean }

const Ticket = ({ selected }: Props) => {
  return (
    <img src='/icons/ticket.png' className='h-3 '/>
  )
}

export default Ticket
