'use client'

import {
  Button,
  Card,
  Container,
  Group,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import '@mantine/dates/styles.css'
import { useUser } from '@/lib/UserContext'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'

export default function ManagerDashboardPage() {
  const user = useUser()

  const [range, setRange] = useState<[string | null, string | null]>([null, null])
  const [rangeData, setRangeData] = useState<any>(null)
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null)
  const [expandedEmployeeData, setExpandedEmployeeData] = useState<any>(null)

  if (!user) return <Text>Loading...</Text>

  const restaurantId =
    typeof user.restaurant === 'object' ? user.restaurant.id : user.restaurant

  const fetchRangeSummary = async () => {
    const [start, end] = range
    if (!start || !end || !restaurantId) return

    const base = `${process.env.NEXT_PUBLIC_API_URL}/api`
    const res = await fetch(
      `${base}/range-summary?start=${dayjs(start).format('YYYY-MM-DD')}&end=${dayjs(end).format('YYYY-MM-DD')}&restaurant=${restaurantId}`,
      { credentials: 'include' }
    )
    const data = await res.json()
    setRangeData(data)
    setExpandedEmployeeId(null)
    setExpandedEmployeeData(null)
  }

  const fetchEmployeeDetails = async (employeeId: string) => {
    const [start, end] = range
    if (!start || !end) return

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/employee-daily-summary-range?employee=${employeeId}&start=${dayjs(start).format('YYYY-MM-DD')}&end=${dayjs(end).format('YYYY-MM-DD')}`,
      { credentials: 'include' }
    )
    const data = await res.json()
    setExpandedEmployeeId(employeeId)
    setExpandedEmployeeData(data)
  }

  const exportCSV = () => {
    if (!rangeData) return

    const headers = ['Name', 'Norm Hours', 'Server Hours', 'Total Wage']
    const rows = rangeData.employees.map((emp: any) => [
      emp.username,
      emp.normHours,
      emp.serverHours,
      emp.totalWage,
    ])

    const csvContent =
      [headers, ...rows]
        .map((row) =>
          row
            .map((val) =>
              typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
            )
            .join(',')
        )
        .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `employee_summary_${dayjs(range?.[0]).format('YYYYMMDD')}_${dayjs(range?.[1]).format('YYYYMMDD')}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Container>
      <Title order={2} mt="md">Manager Dashboard</Title>

      <Stack mt="lg">
        <Card withBorder>
          <Title order={4}>📊 Range Summary (Totals)</Title>
          <Group mt="sm">
            <DatePickerInput
              type="range"
              label="Pick date range"
              value={range}
              onChange={setRange}
            />
            <Button onClick={fetchRangeSummary}>Load</Button>
          </Group>

          {rangeData && (
            <>
              <Group justify="space-between" mt="md">
                <Text>Total Wage (All): ${rangeData.totalWage}</Text>
                <Button onClick={exportCSV} size="xs" variant="light">Export CSV</Button>
              </Group>

              <Table mt="sm" highlightOnHover withColumnBorders>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Norm Hours</th>
                    <th>Server Hours</th>
                    <th>Total Wage</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rangeData.employees.map((emp: any) => (
                    <tr key={emp.id}>
                      <td>{emp.username}</td>
                      <td>{emp.normHours}</td>
                      <td>{emp.serverHours}</td>
                      <td>${emp.totalWage}</td>
                      <td>
                        <Button
                          size="xs"
                          variant="light"
                          onClick={() => fetchEmployeeDetails(emp.id)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Card>

        {expandedEmployeeData && (
          <Card withBorder mt="lg">
            <Title order={4}>
              Daily Details for {expandedEmployeeData.employee.username}
            </Title>
            <Table mt="md" highlightOnHover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Norm H</th>
                  <th>Server H</th>
                  <th>Sales</th>
                  <th>Tips</th>
                  <th>Tip Bonus</th>
                  <th>Norm $</th>
                  <th>Server $</th>
                  <th>Total $</th>
                </tr>
              </thead>
              <tbody>
                {expandedEmployeeData.summaries.map((day: any) => (
                  <tr key={day.date}>
                    <td>{day.date}</td>
                    <td>{day.normHours}</td>
                    <td>{day.serverHours}</td>
                    <td>${day.sales}</td>
                    <td>${day.tips}</td>
                    <td>${day.tipsAfterRate}</td>
                    <td>${day.normWage}</td>
                    <td>${day.serverWage}</td>
                    <td>${day.totalWage}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Stack mt="md">
              <Text>Total Norm Hours: {expandedEmployeeData.totals.totalNormHours}</Text>
              <Text>Total Server Hours: {expandedEmployeeData.totals.totalServerHours}</Text>
              <Text>Total Sales: ${expandedEmployeeData.totals.totalSales}</Text>
              <Text>Total Tips: ${expandedEmployeeData.totals.totalTips}</Text>
              <Text>Total Tip Bonus: ${expandedEmployeeData.totals.totalTipsAfterRate}</Text>
              <Text>Total Norm Wage: ${expandedEmployeeData.totals.totalNormWage}</Text>
              <Text>Total Server Wage: ${expandedEmployeeData.totals.totalServerWage}</Text>
              <Text>Total Wage: ${expandedEmployeeData.totals.totalWage}</Text>
            </Stack>
          </Card>
        )}
      </Stack>
    </Container>
  )
}
