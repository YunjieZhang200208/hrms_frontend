'use client';

import {
  Button,
  Container,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { DateInput, TimeInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconPlus, IconEdit } from '@tabler/icons-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useEffect, useState } from 'react';
import '@mantine/dates/styles.css';
dayjs.extend(utc);

const ShiftForm = ({ date, data, onChange, onRemove, onSave }: any) => {
  const form = useForm({
    initialValues: {
      type: data?.type || 'norm',
      startTime: data?.startTime || dayjs().startOf('hour').format('HH:mm'),
      endTime: data?.endTime || dayjs().startOf('hour').add(1, 'hour').format('HH:mm'),
      tipsCash: data?.tipsCash || '',
      tipsCard: data?.tipsCard || '',
      sales: data?.sales || '',
    },
  });

  const handleChange = () => {
    const { type, startTime, endTime, tipsCash, tipsCard, sales } = form.values;
    onChange({ type, startTime, endTime, tipsCash, tipsCard, sales });
  };

  useEffect(() => {
    handleChange(); // sync defaults immediately
  }, []);

  return (
    <Paper withBorder p="md" radius="md" mt="sm">
      <Stack>
        <Text>Date: {date}</Text>
        <Select
          label="Shift Type"
          data={[
            { label: 'Norm Shift', value: 'norm' },
            { label: 'Server Shift', value: 'server' },
          ]}
          {...form.getInputProps('type')}
          onChange={(value) => {
            form.setFieldValue('type', value!);
            handleChange();
          }}
        />
        <TimeInput
          label="Start Time"
          value={form.values.startTime}
          onChange={(event) => {
            form.setFieldValue('startTime', event.currentTarget.value);
            handleChange();
          }}
        />
        <TimeInput
          label="End Time"
          value={form.values.endTime}
          onChange={(event) => {
            form.setFieldValue('endTime', event.currentTarget.value);
            handleChange();
          }}
        />
        {form.values.type === 'server' && (
          <>
            <TextInput
              label="Sales"
              type="number"
              step="0.01"
              {...form.getInputProps('sales')}
              onChange={(e) => {
                form.setFieldValue('sales', e.currentTarget.value);
                handleChange();
              }}
            />
            <TextInput
              label="Tips (Cash)"
              type="number"
              step="0.01"
              {...form.getInputProps('tipsCash')}
              onChange={(e) => {
                form.setFieldValue('tipsCash', e.currentTarget.value);
                handleChange();
              }}
            />
            <TextInput
              label="Tips (Card)"
              type="number"
              step="0.01"
              {...form.getInputProps('tipsCard')}
              onChange={(e) => {
                form.setFieldValue('tipsCard', e.currentTarget.value);
                handleChange();
              }}
            />
          </>
        )}
        <Group>
          {onRemove && (
            <Button variant="outline" color="red" onClick={onRemove}>
              Cancel
            </Button>
          )}
          {onSave && (
            <Button color="green" onClick={() => onSave(form.values)}>
              Save
            </Button>
          )}
        </Group>
      </Stack>
    </Paper>
  );
};

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
          startTime: dayjs().startOf('hour').format('HH:mm'),
          endTime: dayjs().startOf('hour').add(1, 'hour').format('HH:mm'),
          tipsCash: '',
          tipsCard: '',
          sales: '',
        },
      },
    ]);
  };

  const submitNewShifts = async () => {
    const shiftPayloads = shiftForms.map((s) => ({
      type: s.data.type,
      employee: employeeId,
      restaurant: selectedEmployee?.restaurant?.id,
      start: `${selectedDate}T${s.data.startTime}:00.000`,
      end: `${selectedDate}T${s.data.endTime}:00.000`,
      tipsCash: s.data.tipsCash ? parseFloat(s.data.tipsCash) : undefined,
      tipsCard: s.data.tipsCard ? parseFloat(s.data.tipsCard) : undefined,
      sales: s.data.sales ? parseFloat(s.data.sales) : undefined,
    }));

    for (const payload of shiftPayloads) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
    }

    fetchShiftsForDate();
  };

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
                  startTime: dayjs(shift.start).format('HH:mm'),
                  endTime: dayjs(shift.end).format('HH:mm'),
                  sales: shift.sales?.toString(),
                  tipsCash: shift.tipsCash?.toString(),
                  tipsCard: shift.tipsCard?.toString(),
                }}
                onChange={() => {}}
                onSave={async (updated: any) => {
                  const payload = {
                    ...shift,
                    type: updated.type,
                    start: `${selectedDate}T${updated.startTime}:00.000`,
                    end: `${selectedDate}T${updated.endTime}:00.000`,
                    sales: updated.sales ? parseFloat(updated.sales) : undefined,
                    tipsCash: updated.tipsCash ? parseFloat(updated.tipsCash) : undefined,
                    tipsCard: updated.tipsCard ? parseFloat(updated.tipsCard) : undefined,
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
                    <Text><b>Start:</b> {dayjs(shift.start).format('HH:mm')}</Text>
                    <Text><b>End:</b> {dayjs(shift.end).format('HH:mm')}</Text>
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
          onRemove={shiftForms.length > 1 ? () => setShiftForms((prev) => prev.filter((_, i) => i !== index)) : undefined}
        />
      ))}

      <Group mt="md">
        <Button leftSection={<IconPlus size={16} />} onClick={addShiftForm} variant="light">
          Add New Shift
        </Button>
        <Button onClick={submitNewShifts} color="green" disabled={shiftForms.length === 0}>
          Submit All
        </Button>
      </Group>
    </Container>
  );
}
