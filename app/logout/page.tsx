'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const logout = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, {
          method: 'POST',
          credentials: 'include',
        })
      } catch (e) {
        console.error('Logout failed:', e)
      }

      // Clear token from browser (client side)
      document.cookie = 'payload-token=; Max-Age=0; path=/;'

      // Redirect to login page
      router.push('/login')
    }

    logout()
  }, [router])

  return <p>Logging you out...</p>
}
