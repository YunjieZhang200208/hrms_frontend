// ShiftForm.tsx
'use client';

import {
    Paper,
    Stack,
    Text,
    Select,
    TextInput,
    Group,
    Button,
} from '@mantine/core';
import { TimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useEffect } from 'react';
import '@mantine/dates/styles.css';

dayjs.extend(utc);
dayjs.extend(timezone);

export default function ShiftForm({ date, data, onChange, onRemove, onSave }: any) {
    const form = useForm({
        initialValues: {
            type: data?.type || 'norm',
            startTime: data?.startTime || '09:00',
            endTime: data?.endTime || '10:00',
            tipsCash: data?.tipsCash || '',
            tipsCard: data?.tipsCard || '',
            sales: data?.sales || '',
        },
    });

    const handleChange = () => {
        onChange({
            type: form.values.type,
            startTime: form.values.startTime,
            endTime: form.values.endTime,
            tipsCash: form.values.tipsCash,
            tipsCard: form.values.tipsCard,
            sales: form.values.sales,
        });
    };

    useEffect(() => {
        handleChange();
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

                <TimePicker
                    label="Start Time"
                    withSeconds={false}
                    format="24h"
                    value={form.values.startTime}
                    onChange={(value) => {
                        form.setFieldValue('startTime', value || '00:00');
                        handleChange();
                    }}
                />

                <TimePicker
                    label="End Time"
                    withSeconds={false}
                    format="24h"
                    value={form.values.endTime}
                    onChange={(value) => {
                        form.setFieldValue('endTime', value || '00:00');
                        handleChange();
                    }}
                />

                {form.values.type === 'server' && (
                    <>
                        <TextInput
                            label="Sales"
                            type="number"
                            step="0.01"
                            value={form.values.sales}
                            onChange={(e) => {
                                form.setFieldValue('sales', e.currentTarget.value);
                                handleChange();
                            }}
                        />
                        <TextInput
                            label="Tips (Cash)"
                            type="number"
                            step="0.01"
                            value={form.values.tipsCash}
                            onChange={(e) => {
                                form.setFieldValue('tipsCash', e.currentTarget.value);
                                handleChange();
                            }}
                        />
                        <TextInput
                            label="Tips (Card)"
                            type="number"
                            step="0.01"
                            value={form.values.tipsCard}
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
} 
