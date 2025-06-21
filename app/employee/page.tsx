import { getUser } from '@/lib/getUser'
import { redirect } from 'next/navigation'

export default async function EmployeePage() {
  const user = await getUser()

  if (!user || user.role !== 'employee') {
    redirect('/login')
  }

  redirect('/employee/new-shift')
}
