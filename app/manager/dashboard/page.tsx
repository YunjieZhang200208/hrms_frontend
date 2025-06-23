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
  ScrollArea,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import '@mantine/dates/styles.css'
import { useUser } from '@/lib/UserContext'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import DailyDetailsTable from '@/components/DailyDetailsTable/DailyDetailsTable'

export default function ManagerDashboardPage() {
  const user = useUser()

  const [range, setRange] = useState<[string | null, string | null]>([null, null])
  const [rangeData, setRangeData] = useState<any>(null)
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null)
  const [expandedEmployeeData, setExpandedEmployeeData] = useState<any>(null)

  if (!user) {
    return <Text>加载中...</Text>
  }

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
    if (!rangeData) return;

    const headers = ['姓名', '非服务员', '服务工时', '总工资'];
    const rows = rangeData.employees.map((emp: any) => [
      emp.username,
      emp.normHours,
      emp.serverHours,
      emp.totalWage,
    ]);

    const csvContent =
      '\uFEFF' + // BOM for UTF-8
      [headers, ...rows]
        .map((row) =>
          row
            .map((val) =>
              typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
            )
            .join(',')
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `员工工资汇总_${dayjs(range?.[0]).format('YYYYMMDD')}_${dayjs(range?.[1]).format('YYYYMMDD')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <Container>
      <Title order={2} mt="md">Dashboard</Title>

      <Stack mt="lg">
        <Card withBorder>
          <Title order={4}>📊 时间范围汇总（总计）</Title>
          <Group mt="sm">
            <DatePickerInput
              type="range"
              label="选择日期范围"
              value={range}
              onChange={setRange}
            />
            <Button onClick={fetchRangeSummary}>加载数据</Button>
          </Group>

          {rangeData && (
            <>
              <Group justify="space-between" mt="md">
                <Text>所有员工总工资：${rangeData.totalWage}</Text>
                <Button onClick={exportCSV} size="xs" variant="light">导出 CSV</Button>
              </Group>


              <ScrollArea>
                <Table mt="sm" highlightOnHover withColumnBorders>
                  <thead>
                    <tr>
                      <th>姓名</th>
                      <th>非服务员</th>
                      <th>服务工时</th>
                      <th>总工资</th>
                      <th>操作</th>
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
                            查看详情
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </ScrollArea>
            </>
          )}
        </Card>

        {expandedEmployeeData && <DailyDetailsTable data={expandedEmployeeData} />}
      </Stack>
    </Container>
  )
}
