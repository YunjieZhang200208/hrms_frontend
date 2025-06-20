import { getUser } from '@/lib/getUser'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar/Sidebar'
import UserContextClientWrapper from '@/components/UserContextClientWrapper/UserContextClientWrapper'

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user || user.role !== 'manager') {
    redirect('/login')
  }

  return (
    <UserContextClientWrapper user={user}>
      <div style={{ display: 'flex' }}>
        <Sidebar userRole="manager" />
        <div style={{ padding: '2rem', flex: 1 }}>{children}</div>
      </div>
    </UserContextClientWrapper>
  )
}
