import { Card, Stack, Table, Text, Title, ScrollArea, Button, Group } from '@mantine/core';

export default function DailyDetailsTable({ data }: { data: any }) {
  const exportCSV = () => {
    const headers = [
      '日期',
      '普通工时',
      '服务工时',
      '销售额',
      '小费',
      '小费提成',
      '普通工资',
      '服务工资',
      '总工资',
      '平均时薪',
      '服务平均时薪',
    ];

    const rows = data.summaries.map((day: any) => [
      day.date,
      day.normHours,
      day.serverHours,
      day.sales,
      day.tips,
      day.tipsAfterRate,
      day.normWage,
      day.serverWage,
      day.totalWage,
      day.avgHourlyWage,
      day.avgServerHourlyWage,
    ]);

    const totalRows = [
      [],
      ['总普通工时', data.totals.totalNormHours],
      ['总服务工时', data.totals.totalServerHours],
      ['总销售额', data.totals.totalSales],
      ['总小费', data.totals.totalTips],
      ['总小费提成', data.totals.totalTipsAfterRate],
      ['总普通工资', data.totals.totalNormWage],
      ['总服务工资', data.totals.totalServerWage],
      ['总工资', data.totals.totalWage],
      ['平均服务时薪', data.totals.avgServerHourlyWage],
      ['总体平均时薪', data.totals.avgOverallHourlyWage],
    ];

    const csvContent =
      '\uFEFF' +
      [headers, ...rows, ...totalRows]
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
      `每日详情_${data.employee.username}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card withBorder mt="lg">
      <Group justify="space-between">
        <Title order={4}>{data.employee.username} 的每日详情</Title>
        <Button size="xs" variant="light" onClick={exportCSV}>
          导出 CSV
        </Button>
      </Group>

      <ScrollArea>
        <Table mt="md" highlightOnHover>
          <thead>
            <tr>
              <th>日期</th>
              <th>普通工时</th>
              <th>服务工时</th>
              <th>销售额</th>
              <th>小费</th>
              <th>小费提成</th>
              <th>普通工资</th>
              <th>服务工资</th>
              <th>总工资</th>
              <th>平均时薪</th>
              <th>服务平均时薪</th>
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
      </ScrollArea>

      <Stack mt="md">
        <Text>总普通工时：{data.totals.totalNormHours}</Text>
        <Text>总服务工时：{data.totals.totalServerHours}</Text>
        <Text>总销售额：${data.totals.totalSales}</Text>
        <Text>总小费：${data.totals.totalTips}</Text>
        <Text>总小费提成：${data.totals.totalTipsAfterRate}</Text>
        <Text>总普通工资：${data.totals.totalNormWage}</Text>
        <Text>总服务工资：${data.totals.totalServerWage}</Text>
        <Text>总工资：${data.totals.totalWage}</Text>
        <Text>平均服务时薪：${data.totals.avgServerHourlyWage}</Text>
        <Text>总体平均时薪：${data.totals.avgOverallHourlyWage}</Text>
      </Stack>
    </Card>
  );
}
