import { UserButton } from '@clerk/nextjs'
import React from 'react'

function Header() {
  return (
    <div className='p-5'>
      <UserButton />
    </div>
  )
}

export default Header