import React from 'react'
import CreateNote from './_components/CreateNote'
import Sidenav from './_components/Sidenav'

function Dashboard() {
  return (
    <div className="flex items-center h-screen bg-[radial-gradient(ellipse_200%_100%_at_bottom_center,#2B72E3,#000000_66%)]">
      <Sidenav/>
      <div className='border border-white w-full h-full flex justify-center items-center'>
      <CreateNote/>
      </div>
    </div>
  )
}

export default Dashboard