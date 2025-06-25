import { Card, Table, Title } from '@mantine/core';

export function DailySummaryTables({
  levelI,
  levelII,
}: {
  levelI: Record<string, { username: string; hoursNorm: number }>;
  levelII: Record<
    string,
    {
      username: string;
      hoursNorm: number;
      hoursServer: number;
      sales: number;
      tipsCash: number;
      tipsCard: number;
    }
  >;
}) {
  return (
    <>
      {Object.keys(levelI).length > 0 && (
        <Card withBorder mt="md">
          <Title order={5}>🧑‍🏭 Level I 员工</Title>
          <Table mt="sm" highlightOnHover style={{ alignItems: 'center', textAlign: 'center' }}>
            <thead>
              <tr>
                <th>员工</th>
                <th>非服务员时长</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(levelI).map(([id, emp]) => (
                <tr key={id}>
                  <td>{emp.username}</td>
                  <td>{emp.hoursNorm.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {Object.keys(levelII).length > 0 && (
        <Card withBorder mt="md">
          <Title order={5}>🧑‍💼 Level II 员工</Title>
          <Table mt="sm" highlightOnHover style={{ alignItems: 'center', textAlign: 'center' }}>
            <thead>
              <tr>
                <th>员工</th>
                <th>非服务员时长</th>
                <th>服务员时长</th>
                <th>销售额</th>
                <th>现金小费</th>
                <th>刷卡小费</th>
                <th>总小费</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(levelII).map(([id, emp]) => (
                <tr key={id}>
                  <td>{emp.username}</td>
                  <td>{emp.hoursNorm.toFixed(2)}</td>
                  <td>{emp.hoursServer.toFixed(2)}</td>
                  <td>${emp.sales.toFixed(2)}</td>
                  <td>${emp.tipsCash.toFixed(2)}</td>
                  <td>${emp.tipsCard.toFixed(2)}</td>
                  <td>${(emp.tipsCash + emp.tipsCard).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </>
  );
}
