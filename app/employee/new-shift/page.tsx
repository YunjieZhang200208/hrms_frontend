'use client';

import {
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconEdit, IconPlus } from '@tabler/icons-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useEffect, useState } from 'react';
import { useUser } from '@/lib/UserContext';
import ShiftForm from '@/components/ShiftForm/ShiftForm';
// import DailySummaryCard from '@/components/DailySummaryCard/DailySummaryCard';
import '@mantine/dates/styles.css';

dayjs.extend(utc);
dayjs.extend(timezone);
const TORONTO = 'America/Toronto';

export default function EmployeeNewShiftPage() {
  const user = useUser();
  const today = dayjs().tz(TORONTO).format('YYYY-MM-DD');
  const [shiftForms, setShiftForms] = useState<any[]>([]);
  const [existingShifts, setExistingShifts] = useState<any[]>([]);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  // const [dailySummary, setDailySummary] = useState<any | null>(null);

  const parseOptionalFloat = (val: string) =>
    val === undefined || val === null || val.trim() === '' ? undefined : parseFloat(val);

  const fetchShifts = async () => {
    const start = dayjs.tz(`${today} 00:00`, 'YYYY-MM-DD HH:mm', TORONTO).toISOString();
    const end = dayjs.tz(`${today} 23:59:59.999`, 'YYYY-MM-DD HH:mm:ss.SSS', TORONTO).toISOString();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/shifts?where[start][greater_than_equal]=${start}&where[start][less_than_equal]=${end}&where[employee][equals]=${user?.id}`,
      { credentials: 'include' }
    );
    const json = await res.json();
    setExistingShifts(json.docs || []);
    setShiftForms([]);
    setEditingShiftId(null);
  };

  // const fetchDailySummary = async () => {
  //   if (!user?.id) { return; }
  //   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employee-daily-summary?date=${today}`, {
  //     credentials: 'include',
  //   });
  //   const json = await res.json();
  //   setDailySummary(json);
  // };

  useEffect(() => {
    if (user?.id) {
      fetchShifts();
      // fetchDailySummary();
    }
  }, [user]);

  const updateForm = (index: number, data: any) => {
    setShiftForms((prev) => {
      const copy = [...prev];
      copy[index].data = data;
      return copy;
    });
  };

  return (
    <Container size="sm" mt="xl">
      <Title order={2} mb="md">今日班次 (My Shifts for Today)</Title>

      {/* {dailySummary && <DailySummaryCard summary={dailySummary} />} */}

      {existingShifts.map((shift: any) =>
        editingShiftId === shift.id ? (
          <ShiftForm
            key={shift.id}
            date={today}
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
                start: dayjs.tz(`${today} ${updated.startTime}`, 'YYYY-MM-DD HH:mm', TORONTO).toISOString(),
                end: dayjs.tz(`${today} ${updated.endTime}`, 'YYYY-MM-DD HH:mm', TORONTO).toISOString(),
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
              fetchShifts();
              // fetchDailySummary();
              setEditingShiftId(null);
            }}
            onRemove={() => setEditingShiftId(null)}
          />
        ) : (
          <Paper key={shift.id} withBorder p="md" mt="sm">
            <Group justify="space-between">
              <Stack>
                <Text><b>类型 (Type)：</b> {shift.type === 'norm' ? '非服务员' : '服务员'}</Text>
                <Text><b>开始时间 (Start Time)：</b> {dayjs(shift.start).tz(TORONTO).format('HH:mm')}</Text>
                <Text><b>结束时间 (End Time)：</b> {dayjs(shift.end).tz(TORONTO).format('HH:mm')}</Text>
                {shift.sales && <Text><b>销售额 (Sales)：</b> ${shift.sales.toFixed(2)}</Text>}
                {(shift.tipsCash || shift.tipsCard) && (
                  <Text><b>小费总额 (Total Tips)：</b> ${(shift.tipsCash + shift.tipsCard).toFixed(2)}</Text>
                )}
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

      {shiftForms.map((form, index) => (
        <ShiftForm
          key={form.id}
          date={today}
          data={form.data}
          onChange={(data: any) => updateForm(index, data)}
          onSave={async (newData: any) => {
            const payload = {
              type: newData.type,
              employee: user?.id,
              restaurant: typeof user?.restaurant === 'object' ? user?.restaurant?.id : user?.restaurant,
              start: dayjs.tz(`${today} ${newData.startTime}`, 'YYYY-MM-DD HH:mm', TORONTO).toISOString(),
              end: dayjs.tz(`${today} ${newData.endTime}`, 'YYYY-MM-DD HH:mm', TORONTO).toISOString(),
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
            await fetchShifts();
            // await fetchDailySummary();
          }}
          onRemove={() => setShiftForms((prev) => prev.filter((_, i) => i !== index))}
        />
      ))}

      <Group mt="md">
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() =>
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
            ])
          }
          variant="light"
        >
          添加新班次
        </Button>
      </Group>
    </Container>
  );
}
