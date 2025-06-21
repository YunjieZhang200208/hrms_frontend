import { Card, Stack, Table, Text, Title } from '@mantine/core';

export default function DailyDetailsTable({ data }: { data: any }) {
  return (
    <Card withBorder mt="lg">
      <Title order={4}>Daily Details for {data.employee.username}</Title>

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
            <th>Avg Hr $</th>
            <th>Server Hr $</th>
          </tr>
        </thead>
        <tbody>
          {data.summaries.map((day: any) => (
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
              <td>${day.avgHourlyWage}</td>
              <td>${day.avgServerHourlyWage}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Stack mt="md">
        <Text>Total Norm Hours: {data.totals.totalNormHours}</Text>
        <Text>Total Server Hours: {data.totals.totalServerHours}</Text>
        <Text>Total Sales: ${data.totals.totalSales}</Text>
        <Text>Total Tips: ${data.totals.totalTips}</Text>
        <Text>Total Tip Bonus: ${data.totals.totalTipsAfterRate}</Text>
        <Text>Total Norm Wage: ${data.totals.totalNormWage}</Text>
        <Text>Total Server Wage: ${data.totals.totalServerWage}</Text>
        <Text>Total Wage: ${data.totals.totalWage}</Text>
        <Text>Avg Server Hourly Wage: ${data.totals.avgServerHourlyWage}</Text>
        <Text>Avg Overall Hourly Wage: ${data.totals.avgOverallHourlyWage}</Text>
      </Stack>
    </Card>
  );
}
