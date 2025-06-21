import { Card, Group, Stack, Text, Title } from '@mantine/core';

export default function DailySummaryCard({ summary }: { summary: any }) {
  const totals = summary.totals;
  const date = summary.date;

  return (
    <Card withBorder shadow="sm" mt="md">
      <Stack>
        <Title order={4}>📅 Daily Summary – {date}</Title>

        <Group justify="space-between">
          <Text><b>Total Hours (Norm):</b> {totals.totalNormHours} hrs</Text>
          <Text><b>Wage (Norm):</b> ${totals.totalNormWage}</Text>
          <Text><b>Hourly Wage (Norm):</b> ${totals.avgNormHourlyWage}</Text>
        </Group>

        <Group justify="space-between">
          <Text><b>Total Hours (Server):</b> {totals.totalServerHours} hrs</Text>
          <Text><b>Wage (Server):</b> ${totals.totalServerWage}</Text>
          <Text><b>Hourly Wage (Server):</b> ${totals.avgServerHourlyWage}</Text>
        </Group>

        <Group justify="space-between">
          <Text><b>Total Tips:</b> ${totals.totalTips}</Text>
          <Text><b>Total Sales:</b> ${totals.totalSales}</Text>
        </Group>

        <Group justify="space-between">
          <Text><b>Total Wage:</b> ${totals.totalWage}</Text>
          <Text><b>Overall Hourly Wage:</b> ${totals.avgTotalHourlyWage}</Text>
        </Group>
      </Stack>
    </Card>
  );
}
