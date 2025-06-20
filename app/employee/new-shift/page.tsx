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
import { TimeInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconPlus } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useUser } from '@/lib/UserContext';

const ShiftForm = ({ onChange, onRemove }: any) => {
  const form = useForm({
    initialValues: {
      type: 'norm',
      startTime: dayjs().startOf('hour').format('HH:mm'),
      endTime: dayjs().startOf('hour').add(1, 'hour').format('HH:mm'),
      tipsCash: '',
      tipsCard: '',
      sales: '',
    },
  });

  const handleChange = () => {
    const { type, startTime, endTime, tipsCash, tipsCard, sales } = form.values;
    onChange({ type, startTime, endTime, tipsCash, tipsCard, sales });
  };

  return (
    <Paper withBorder p="md" radius="md" mt="sm">
      <Stack>
        <Text>Date: {dayjs().format('YYYY-MM-DD')}</Text>
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
        {onRemove && (
          <Button variant="outline" color="red" onClick={onRemove}>
            Remove
          </Button>
        )}
      </Stack>
    </Paper>
  );
};

export default function NewShiftPage() {
  const user = useUser(); // ✅ Grab user from context
  const [shifts, setShifts] = useState<any[]>([{ id: Date.now(), data: {} }]);

  const updateShift = (index: number, data: any) => {
    setShifts((prev) => {
      const copy = [...prev];
      copy[index].data = data;
      return copy;
    });
  };

  const addShift = () => {
    setShifts((prev) => [...prev, { id: Date.now(), data: {} }]);
  };

  const removeShift = (index: number) => {
    setShifts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitAll = async () => {
    const today = dayjs().format('YYYY-MM-DD');

    const shiftPayloads = shifts.map((s) => ({
      type: s.data.type || 'norm',
      employee: user?.id,
      restaurant: (user as any)?.restaurant?.id || (user as any)?.restaurant,
      start: `${today}T${s.data.startTime || '00:00'}:00.000Z`,
      end: `${today}T${s.data.endTime || '00:00'}:00.000Z`,
      tipsCash: s.data.tipsCash ? parseFloat(s.data.tipsCash) : undefined,
      tipsCard: s.data.tipsCard ? parseFloat(s.data.tipsCard) : undefined,
      sales: s.data.sales ? parseFloat(s.data.sales) : undefined,
    }));

    for (const payload of shiftPayloads) {
        console.log('Submitting shift:', payload);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error('Failed to submit shift:', error);
      }
    }

    setShifts([{ id: Date.now(), data: {} }]);
  };

  return (
    <Container size="sm" mt="xl">
      <Title order={2} mb="md">
        New Shifts for Today
      </Title>
      {shifts.map((shift, i) => (
        <ShiftForm
          key={shift.id}
          onChange={(data: any) => updateShift(i, data)}
          onRemove={shifts.length > 1 ? () => removeShift(i) : undefined}
        />
      ))}
      <Group mt="md">
        <Button leftSection={<IconPlus size={16} />} onClick={addShift} variant="light">
          Add Another Shift
        </Button>
        <Button onClick={handleSubmitAll} color="green">
          Submit All
        </Button>
      </Group>
    </Container>
  );
}
