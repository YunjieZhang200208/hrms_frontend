'use client';

import {
  Button,
  Card,
  Container,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useState } from 'react';
import '@mantine/dates/styles.css';
import dayjs from 'dayjs';

export default function EmployeeDashboard() {
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null]);
  const [summary, setSummary] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchSummary = async () => {
    if (!dateRange[0] || !dateRange[1]) {
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/employee-daily-summary-range?start=${dateRange[0]}&end=${dateRange[1]}`,
      { credentials: 'include' }
    );

    if (res.ok) {
      const json = await res.json();
      setSummary(json);
    }
  };

  return (
    <Container size="sm" mt="xl">
      <Title order={2} mb="md">
        Dashboard
      </Title>

      <DatePickerInput
        type="range"
        label="Pick a date range"
        value={dateRange}
        onChange={setDateRange}
        mb="md"
      />

      <Button onClick={fetchSummary} disabled={!dateRange[0] || !dateRange[1]}>
        Show Summary
      </Button>

      {summary && (
        <Stack mt="xl">
          <Title order={3}>Summary</Title>
          <Text>Total Base Salary (Norm): ${summary.totals.totalNormHours.toFixed(2)}</Text>
          <Text>Total Base Salary (Server): ${summary.totals.totalServerHours.toFixed(2)}</Text>
          <Text>Total Tips (Cash + Card): ${summary.totals.totalTips.toFixed(2)}</Text>
          <Text>Total Sales: ${summary.totals.totalSales.toFixed(2)}</Text>
          <Text>Total Wage: ${summary.totals.totalWage.toFixed(2)}</Text>

          <Button variant="outline" onClick={() => setShowDetails((prev) => !prev)}>
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>

          {showDetails && (
            <Stack mt="md">
              <Title order={4}>Daily Breakdown</Title>
              {summary.summaries.map((s: any) => (
                <Card withBorder key={s.date} shadow="sm" p="md">
                  <Text fw={700}>{dayjs(s.date).format('YYYY-MM-DD')}</Text>
                  <Text>Norm Hours: {s.normHours}</Text>
                  <Text>Server Hours: {s.serverHours}</Text>
                  <Text>Norm Wage: ${s.normWage}</Text>
                  <Text>Server Wage: ${s.serverWage}</Text>
                  <Text>Tips: ${s.tips}</Text>
                  <Text>Sales: ${s.sales}</Text>
                  <Text>Total Wage: ${s.totalWage}</Text>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      )}
    </Container>
  );
}
