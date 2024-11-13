import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className='flex justify-center items-center h-screen bg-[radial-gradient(ellipse_200%_100%_at_bottom_center,#2B72E3,#000000_66%)]'><SignIn/></div>
  )
}