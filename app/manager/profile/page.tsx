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
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

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
        dob: new Date(`${form.dob}T00:00:00.000Z`),
      }),
    })
    setIsEditing(false)
    fetchProfile()
  }

  if (!profile) return null

  return (
    <Container size="sm" mt="xl">
      <Title order={2} mb="md">我的资料</Title>
      <Paper withBorder p="md">
        <Stack>
          <Text><b>邮箱：</b>{profile.email}</Text>
          <Text><b>类型：</b> {profile.role}</Text>
          <Text><b>所属餐厅：</b>{profile.restaurant?.name || '无'}</Text>

          {isEditing ? (
            <>
              <TextInput
                label="用户名"
                value={form.username}
                onChange={(e) => handleChange('username', e.currentTarget.value)}
              />
              <TextInput
                label="社保号（SIN）"
                value={form.sin}
                onChange={(e) => handleChange('sin', e.currentTarget.value)}
              />
              <TextInput
                label="出生日期"
                type="date"
                value={form.dob}
                onChange={(e) => handleChange('dob', e.currentTarget.value)}
              />
              <TextInput
                label="住址"
                value={form.address}
                onChange={(e) => handleChange('address', e.currentTarget.value)}
              />
              <Group mt="sm">
                <Button color="green" onClick={handleSave}>保存</Button>
                <Button variant="outline" color="red" onClick={() => setIsEditing(false)}>取消</Button>
              </Group>
            </>
          ) : (
            <>
              <Text><b>用户名：</b>{profile.username}</Text>
              <Text><b>社保号：</b>{profile.sin}</Text>
              <Text><b>出生日期：</b>{dayjs(profile.dob).utc().format('YYYY-MM-DD')}</Text>
              <Text><b>住址：</b>{profile.address}</Text>
              <Button mt="sm" variant="light" onClick={() => setIsEditing(true)}>
                编辑
              </Button>
            </>
          )}
        </Stack>
      </Paper>
    </Container>
  )
}
