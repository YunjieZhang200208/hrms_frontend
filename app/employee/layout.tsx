import { getUser } from '@/lib/getUser'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar/Sidebar'
import UserContextClientWrapper from '@/components/UserContextClientWrapper/UserContextClientWrapper'
import styles from './employee-layout.module.css'

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user || user.role !== 'employee') {
    redirect('/login')
  }

  return (
    <UserContextClientWrapper user={user}>
      <div className={styles.wrapper}>
        <Sidebar userRole="employee" />
        <div className={styles.content}>{children}</div>
      </div>
    </UserContextClientWrapper>
  )
}
