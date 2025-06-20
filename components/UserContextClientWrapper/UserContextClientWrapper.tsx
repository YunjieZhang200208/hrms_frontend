'use client'

import { UserProvider, User } from '@/lib/UserContext'

export default function UserContextClientWrapper({
  user,
  children,
}: {
  user: User
  children: React.ReactNode
}) {
  return <UserProvider value={user}>{children}</UserProvider>
}
