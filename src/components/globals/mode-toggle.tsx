"use client"

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <Button 
      className='rounded-full h-10 w-10 bg-[#815BF5]' 
      size="icon" 
      onClick={toggleTheme}
    >
      {theme === 'light' ? (
        <>
          <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
          <span className="sr-only">Light mode</span>
        </>
      ) : (
        <>
          <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
          <span className="sr-only">Dark mode</span>
        </>
      )}
    </Button>
  )
}
