'use client';

import {
  Button,
  Container,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconEdit, IconPlus } from '@tabler/icons-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useEffect, useState } from 'react';
import '@mantine/dates/styles.css';
import ShiftForm from '@/components/ShiftForm/ShiftForm';
import { DailySummaryTables } from '@/components/DailySummaryTable/DailySummaryTable';

dayjs.extend(utc);
dayjs.extend(timezone);
const TORONTO = 'America/Toronto';

export default function ManagerNewShiftPage() {
  const [selectedDate, setSelectedDate] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [shiftForms, setShiftForms] = useState<any[]>([]);
  const [existingShifts, setExistingShifts] = useState<any[]>([]);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);

  const [dailySummary, setDailySummary] = useState<null | {
    totals: {
      totalSales: number;
      totalTipsCash: number;
      totalTipsCard: number;
    };
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
  }>(null);

  const [showDetails, setShowDetails] = useState(false);

  const fetchDailySummary = async (date: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/manager/daily-sales-report?date=${date}`,
        { credentials: 'include' }
      );
      if (!res.ok) {
        throw new Error('Failed to fetch daily summary');
      }
      const json = await res.json();
      console.log('Daily Summary:', json);
      setDailySummary(json);
    } catch (err) {
      console.error(err);
      setDailySummary(null);
    }
  };

  useEffect(() => {
    setSelectedDate(dayjs().format('YYYY-MM-DD'));
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        const user = json.user;
        if (user?.restaurant) {
          const res2 = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users?where[restaurant][equals]=${user.restaurant.id}&limit=100`,
            { credentials: 'include' }
          );
          const data = await res2.json();
          setEmployees(data.docs || []);
        }
      }
    };
    fetchUser();
  }, []);

  const selectedEmployee = employees.find((e) => e.id === employeeId);

  const fetchShiftsForDate = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/shifts?where[start][greater_than_equal]=${selectedDate}T00:00:00.000&where[start][less_than_equal]=${selectedDate}T23:59:59.999&where[employee][equals]=${employeeId}`,
      { credentials: 'include' }
    );
    const json = await res.json();
    setExistingShifts(json.docs || []);
    setShiftForms([]);
    setEditingShiftId(null);
  };

  useEffect(() => {
    if (employeeId && selectedDate) {
      fetchShiftsForDate();
    }
    if (selectedDate) {
      fetchDailySummary(selectedDate);
    }
  }, [employeeId, selectedDate]);

  const updateForm = (index: number, data: any) => {
    setShiftForms((prev) => {
      const copy = [...prev];
      copy[index].data = data;
      return copy;
    });
  };

  const addShiftForm = () => {
    setShiftForms((prev) => [
      ...prev,
      {
        id: Date.now(),
        data: {
          type: 'norm',
          startTime: dayjs().tz(TORONTO).startOf('hour').format('HH:mm'),
          endTime: dayjs().tz(TORONTO).startOf('hour').add(1, 'hour').format('HH:mm'),
          tipsCash: '',
          tipsCard: '',
          sales: '',
        },
      },
    ]);
  };

  const parseOptionalFloat = (val: string) =>
    val === undefined || val === null || val.trim() === '' ? undefined : parseFloat(val);

  return (
    <Container size="sm" mt="xl">
      <Title order={2} mb="md">今日班次</Title>

      <DateInput
        label="日期"
        value={selectedDate}
        onChange={(value) => setSelectedDate(dayjs(value).format('YYYY-MM-DD'))}
        mb="md"
      />

      {dailySummary && (
        <Paper withBorder p="sm" mb="md">
          <Text fw={500}>今日总结</Text>
          <Text>总销售额：${dailySummary.totals.totalSales.toFixed(2)}</Text>
          <Text>总现金小费 (Cash)：${dailySummary.totals.totalTipsCash.toFixed(2)}</Text>
          <Text>总刷卡小费 (Card)：${dailySummary.totals.totalTipsCard.toFixed(2)}</Text>

          <Button
            mt="sm"
            size="xs"
            variant="light"
            onClick={() => setShowDetails((prev) => !prev)}
          >
            {showDetails ? '隐藏详细信息' : '查看详细信息'}
          </Button>

          {showDetails && (
            <DailySummaryTables
              levelI={dailySummary.levelI}
              levelII={dailySummary.levelII}
            />
          )}

        </Paper>
      )}

      <Select
        label="选择员工"
        data={employees.map((e: any) => ({ value: e.id, label: e.username }))}
        value={employeeId}
        onChange={(value) => setEmployeeId(value!)}
        searchable
        mb="md"
      />

      {existingShifts.length > 0 && (
        <Stack>
          <Title order={4}>已存在班次</Title>
          {existingShifts.map((shift: any) =>
            editingShiftId === shift.id ? (
              <ShiftForm
                key={shift.id}
                date={selectedDate}
                data={{
                  type: shift.type,
                  startTime: dayjs(shift.start).tz(TORONTO).format('HH:mm'),
                  endTime: dayjs(shift.end).tz(TORONTO).format('HH:mm'),
                  sales: shift.sales?.toString(),
                  tipsCash: shift.tipsCash?.toString(),
                  tipsCard: shift.tipsCard?.toString(),
                }}
                onChange={() => { }}
                onSave={async (updated: any) => {
                  const payload = {
                    ...shift,
                    type: updated.type,
                    start: dayjs.tz(`${selectedDate} ${updated.startTime}`, 'YYYY-MM-DD HH:mm', TORONTO).toISOString(),
                    end: dayjs.tz(`${selectedDate} ${updated.endTime}`, 'YYYY-MM-DD HH:mm', TORONTO).toISOString(),
                    sales: parseOptionalFloat(updated.sales),
                    tipsCash: parseOptionalFloat(updated.tipsCash),
                    tipsCard: parseOptionalFloat(updated.tipsCard),
                  };

                  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shifts/${shift.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(payload),
                  });
                  await fetchShiftsForDate();
                  setEditingShiftId(null);
                }}
                onRemove={() => setEditingShiftId(null)}
              />
            ) : (
              <Paper key={shift.id} withBorder p="md">
                <Group justify="space-between">
                  <Stack>
                    <Text><b>类型 (Type)：</b>{shift.type === 'norm' ? '非服务员' : '服务员'}</Text>
                    <Text><b>开始时间：</b>{dayjs(shift.start).tz(TORONTO).format('HH:mm')}</Text>
                    <Text><b>结束时间：</b>{dayjs(shift.end).tz(TORONTO).format('HH:mm')}</Text>
                    {shift.sales && <Text><b>销售额：</b>${shift.sales.toFixed(2)}</Text>}
                    {(shift.tipsCash || shift.tipsCard) && (
                      <Text><b>小费：</b>${(shift.tipsCash + shift.tipsCard).toFixed(2)}</Text>
                    )}
                    <Text><b>工资：</b>${shift.wage?.toFixed(2)}</Text>
                  </Stack>
                  <Button
                    variant="light"
                    leftSection={<IconEdit size={16} />}
                    onClick={() => setEditingShiftId(shift.id)}
                  >
                    编辑
                  </Button>
                </Group>
              </Paper>
            )
          )}
        </Stack>
      )}

      {shiftForms.map((form, index) => (
        <ShiftForm
          key={form.id}
          date={selectedDate}
          data={form.data}
          onChange={(data: any) => updateForm(index, data)}
          onSave={async (newData: any) => {
            const payload = {
              type: newData.type,
              employee: employeeId,
              restaurant: selectedEmployee?.restaurant?.id,
              start: dayjs.tz(`${selectedDate} ${newData.startTime}`, 'YYYY-MM-DD HH:mm', TORONTO).toISOString(),
              end: dayjs.tz(`${selectedDate} ${newData.endTime}`, 'YYYY-MM-DD HH:mm', TORONTO).toISOString(),
              tipsCash: parseOptionalFloat(newData.tipsCash),
              tipsCard: parseOptionalFloat(newData.tipsCard),
              sales: parseOptionalFloat(newData.sales),
            };

            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shifts`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(payload),
            });
            await fetchShiftsForDate();
          }}
          onRemove={() => {
            setShiftForms((prev) => prev.filter((_, i) => i !== index));
          }}
        />
      ))}

      <Group mt="md">
        <Button leftSection={<IconPlus size={16} />} onClick={addShiftForm} variant="light">
          添加新班次
        </Button>
      </Group>
    </Container>
  );
}
