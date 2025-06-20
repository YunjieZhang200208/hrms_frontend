'use client'

import {
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useEffect, useState } from 'react'
import { useUser } from '@/lib/UserContext'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc' // ✅ import
dayjs.extend(utc) // ✅ activate UTC plugin

export default function ManagerProfilePage() {
  const user = useUser()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (user && user.role !== 'manager') {
      router.push('/unauthorized')
    }
  }, [user])

  const fetchProfile = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
      credentials: 'include',
    })
    const json = await res.json()
    setProfile(json.user)
    setForm({
      username: json.user.username || '',
      address: json.user.address || '',
      dob: json.user.dob ? dayjs(json.user.dob).utc().format('YYYY-MM-DD') : '',
      sin: json.user.sin || '',
    })
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${profile.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: form.username,
        address: form.address,
        sin: form.sin,
        dob: new Date(`${form.dob}T00:00:00.000Z`), // Force UTC midnight
      }),
    })
    setIsEditing(false)
    fetchProfile()
  }

  if (!profile) return null

  return (
    <Container size="sm" mt="xl">
      <Title order={2} mb="md">My Profile</Title>
      <Paper withBorder p="md">
        <Stack>
          <Text><b>Email:</b> {profile.email}</Text>
          <Text><b>Role:</b> {profile.role}</Text>
          <Text><b>Restaurant:</b> {profile.restaurant?.name || 'N/A'}</Text>

          {isEditing ? (
            <>
              <TextInput
                label="Username"
                value={form.username}
                onChange={(e) => handleChange('username', e.currentTarget.value)}
              />
              <TextInput
                label="SIN"
                value={form.sin}
                onChange={(e) => handleChange('sin', e.currentTarget.value)}
              />
              <TextInput
                label="Date of Birth"
                type="date"
                value={form.dob}
                onChange={(e) => handleChange('dob', e.currentTarget.value)}
              />
              <TextInput
                label="Address"
                value={form.address}
                onChange={(e) => handleChange('address', e.currentTarget.value)}
              />
              <Group mt="sm">
                <Button color="green" onClick={handleSave}>Save</Button>
                <Button variant="outline" color="red" onClick={() => setIsEditing(false)}>Cancel</Button>
              </Group>
            </>
          ) : (
            <>
              <Text><b>Username:</b> {profile.username}</Text>
              <Text><b>SIN:</b> {profile.sin}</Text>
              <Text><b>DOB:</b> {dayjs(profile.dob).utc().format('YYYY-MM-DD')}</Text>
              <Text><b>Address:</b> {profile.address}</Text>
              <Button mt="sm" variant="light" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            </>
          )}
        </Stack>
      </Paper>
    </Container>
  )
}
