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
import { DateInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { useEffect, useState } from 'react'
import { useUser } from '@/lib/UserContext'
import { notifications } from '@mantine/notifications'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

export default function EmployeeProfilePage() {
  const user = useUser()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)

  const form = useForm({
    initialValues: {
      username: '',
      sin: '',
      dob: '',
      address: '',
    },
  })

  useEffect(() => {
    if (user) {
      form.setValues({
        username: user.username || '',
        sin: user.sin || '',
        dob: user.dob ? dayjs(user.dob).utc().format('YYYY-MM-DD') : '',
        address: user.address || '',
      })
    }
  }, [user])

  const handleSubmit = async () => {
    setLoading(true)

    const payload = {
      username: form.values.username,
      sin: form.values.sin,
      address: form.values.address,
      dob: form.values.dob
        ? new Date(`${form.values.dob}T00:00:00.000Z`) // Force UTC midnight
        : null,
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      notifications.show({
        title: 'Success',
        message: 'Profile updated successfully',
        color: 'green',
      })
      setEditing(false)
    } else {
      const err = await res.json()
      notifications.show({
        title: 'Error',
        message: 'Failed to update profile',
        color: 'red',
      })
      console.error('Failed to update profile:', err)
    }

    setLoading(false)
  }

  const handleCancel = () => {
    setEditing(false)
    if (user) {
      form.setValues({
        username: user.username || '',
        sin: user.sin || '',
        dob: user.dob ? dayjs(user.dob).utc().format('YYYY-MM-DD') : '',
        address: user.address || '',
      })
    }
  }

  if (!user) return null

  return (
    <Container size="sm" mt="xl">
      <Title order={2} mb="md">My Profile</Title>
      <Paper withBorder p="md" radius="md">
        <Stack>
          <Text><b>Email:</b> {user.email}</Text>
          <Text><b>Role:</b> {user.role}</Text>
          <Text><b>Level:</b> {user.level}</Text>
          <Text><b>Base Hourly Rate (Norm):</b> ${user.baseRate}</Text>
          {user.level === 'II' && (
            <>
              <Text><b>Base Hourly Rate (Server):</b> ${user.baseRateWithTips}</Text>
              <Text><b>Tip Rate Multiplier:</b> {user.tipRate}</Text>
            </>
          )}
          <Text><b>Restaurant:</b> {typeof user.restaurant === 'object' ? user.restaurant.name : user.restaurant}</Text>

          {editing ? (
            <>
              <TextInput
                label="Username"
                {...form.getInputProps('username')}
              />
              <TextInput
                label="Social Insurance Number (SIN)"
                {...form.getInputProps('sin')}
              />
              <DateInput
                label="Date of Birth"
                value={form.values.dob ? dayjs(form.values.dob).toDate() : null}
                onChange={(date) =>
                  form.setFieldValue('dob', date ? dayjs(date).format('YYYY-MM-DD') : '')
                }
              />
              <TextInput
                label="Address"
                {...form.getInputProps('address')}
              />
              <Group justify="flex-end">
                <Button onClick={handleCancel} variant="outline">Cancel</Button>
                <Button onClick={handleSubmit} loading={loading} color="green">Save</Button>
              </Group>
            </>
          ) : (
            <>
              <Text><b>Username:</b> {form.values.username}</Text>
              <Text><b>SIN:</b> {form.values.sin}</Text>
              <Text><b>DOB:</b> {form.values.dob}</Text>
              <Text><b>Address:</b> {form.values.address}</Text>
              <Group justify="flex-end">
                <Button onClick={() => setEditing(true)}>Edit</Button>
              </Group>
            </>
          )}
        </Stack>
      </Paper>
    </Container>
  )
}
