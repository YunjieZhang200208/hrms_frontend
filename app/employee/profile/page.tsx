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
import timezone from 'dayjs/plugin/timezone'
import { IconEdit } from '@tabler/icons-react'
import ChangePasswordForm from '@/components/ChangePasswordForm/ChangePasswordForm'

dayjs.extend(utc)
dayjs.extend(timezone)
const TORONTO = 'America/Toronto'

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
        dob: user.dob
          ? dayjs(user.dob).tz(TORONTO).format('YYYY-MM-DD')
          : '',
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
        ? dayjs.tz(form.values.dob, 'YYYY-MM-DD', TORONTO).toDate()
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
        dob: user.dob
          ? dayjs(user.dob).tz(TORONTO).format('YYYY-MM-DD')
          : '',
        address: user.address || '',
      })
    }
  }

  if (!user) {
    return null
  }

  return (
    <Container size="sm" mt="xl">
      <Title order={2} mb="md">个人资料 (My Profile)</Title>
      <Paper withBorder p="md" radius="md">
        <Stack>
          <Text><b>邮箱 (Email)：</b> {user.email}</Text>
          <Text><b>类型 (Role)：</b> {user.role}</Text>
          <Text><b>级别 (Level)：</b> {user.level}</Text>
          <Text><b>餐厅 (Restaurant)：</b> {typeof user.restaurant === 'object' ? user.restaurant.name : user.restaurant}</Text>

          {editing ? (
            <>
              <TextInput label="用户名 (Username)" {...form.getInputProps('username')} />
              <TextInput label="社保号 (SIN)" {...form.getInputProps('sin')} />
              <DateInput
                label="出生日期 (DOB)"
                value={form.values.dob ? dayjs(form.values.dob).toDate() : null}
                onChange={(date) =>
                  form.setFieldValue('dob', date ? dayjs(date).format('YYYY-MM-DD') : '')
                }
              />
              <TextInput label="个人地址 (Address)" {...form.getInputProps('address')} />
              <Group justify="flex-end">
                <Button onClick={handleCancel} variant="outline">Cancel</Button>
                <Button onClick={handleSubmit} loading={loading} color="green">Save</Button>
              </Group>
            </>
          ) : (
            <>
              <Text><b>用户名 (Username)：</b> {form.values.username}</Text>
              <Text><b>社保号 (SIN)：</b> {form.values.sin}</Text>
              <Text><b>出生日期 (DOB)：</b> {form.values.dob}</Text>
              <Text><b>个人地址 (Address)：</b> {form.values.address}</Text>
              <Group justify="flex-end">
                <Button
                  onClick={() => setEditing(true)}
                  leftSection={<IconEdit size={16} />}
                >编辑</Button>
              </Group>
            </>
          )}
        </Stack>
      </Paper>

      <ChangePasswordForm />
    </Container>
  )
}
