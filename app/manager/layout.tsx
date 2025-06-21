import { getUser } from '@/lib/getUser'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar/Sidebar'
import UserContextClientWrapper from '@/components/UserContextClientWrapper/UserContextClientWrapper'
import styles from './manager-layout.module.css'

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
      <div className={styles.wrapper}>
        <Sidebar userRole="manager" />
        <div className={styles.content}>{children}</div>
      </div>
    </UserContextClientWrapper>
  )
}
