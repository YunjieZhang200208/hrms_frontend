// ManagerNewShiftPage.tsx
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
      <Title order={2} mb="md">New Shifts</Title>

      <DateInput
        label="Date"
        value={selectedDate}
        onChange={(value) => setSelectedDate(dayjs(value).format('YYYY-MM-DD'))}
        mb="md"
      />

      <Select
        label="Select Employee"
        data={employees.map((e: any) => ({ value: e.id, label: e.username }))}
        value={employeeId}
        onChange={(value) => setEmployeeId(value!)}
        mb="md"
      />

      {existingShifts.length > 0 && (
        <Stack>
          <Title order={4}>Existing Shifts</Title>
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
                    <Text><b>Type:</b> {shift.type}</Text>
                    <Text><b>Start:</b> {dayjs(shift.start).tz(TORONTO).format('HH:mm')}</Text>
                    <Text><b>End:</b> {dayjs(shift.end).tz(TORONTO).format('HH:mm')}</Text>
                    {shift.sales && <Text><b>Sales:</b> ${shift.sales.toFixed(2)}</Text>}
                    {(shift.tipsCash || shift.tipsCard) && (
                      <Text><b>Tips:</b> ${(shift.tipsCash + shift.tipsCard).toFixed(2)}</Text>
                    )}
                    <Text><b>Wage:</b> ${shift.wage?.toFixed(2)}</Text>
                  </Stack>
                  <Button
                    variant="light"
                    leftSection={<IconEdit size={16} />}
                    onClick={() => setEditingShiftId(shift.id)}
                  >
                    Edit
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
          Add New Shift
        </Button>
      </Group>
    </Container>
  );
}
