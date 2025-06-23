'use client'

import {
  Button,
  Card,
  Container,
  Group,
  Stack,
  Title,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import '@mantine/dates/styles.css'
import { useUser } from '@/lib/UserContext'
import { useState } from 'react'
import dayjs from 'dayjs'
import DailyDetailsTable from '@/components/DailyDetailsTable/DailyDetailsTable'

export default function EmployeeDashboardPage() {
  const user = useUser()

  const [range, setRange] = useState<[string | null, string | null]>([null, null])
  const [summaryData, setSummaryData] = useState<any>(null)

  const fetchMySummary = async () => {
    const [start, end] = range
    if (!start || !end || !user?.id) {
      return
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/employee-daily-summary-range?employee=${user.id}&start=${dayjs(start).format('YYYY-MM-DD')}&end=${dayjs(end).format('YYYY-MM-DD')}`,
      { credentials: 'include' }
    )
    const data = await res.json()
    setSummaryData(data)
  }

  return (
    <Container>
      <Title order={2} mt="md">My Work Summary</Title>

      <Stack mt="lg">
        <Card withBorder>
          <Title order={4}>📆 Select Date Range</Title>
          <Group mt="sm">
            <DatePickerInput
              type="range"
              label="Pick date range"
              value={range}
              onChange={setRange}
            />
            <Button onClick={fetchMySummary}>Load</Button>
          </Group>

          {summaryData && <DailyDetailsTable data={summaryData} />}
        </Card>
      </Stack>
    </Container>
  )
}
