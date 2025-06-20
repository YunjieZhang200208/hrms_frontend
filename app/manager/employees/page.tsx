'use client';

import {
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useUser } from '@/lib/UserContext';
import { useRouter } from 'next/navigation';

export default function EmployeeManagementPage() {
  const router = useRouter();
  const user = useUser();

  const [employees, setEmployees] = useState<any[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    console.log('User in EmployeeManagementPage:', user);
    if (user && user.role !== 'manager') {
      router.push('/unauthorized');
    }
  }, [user]);

  const fetchEmployees = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
      credentials: 'include',
    });
    const json = await res.json();
    const data = json.docs || [];

    const initFormState: Record<string, any> = {};
    for (const emp of data) {
      initFormState[emp.id] = {
        baseRate: emp.baseRate?.toString() || '',
        baseRateWithTips: emp.baseRateWithTips?.toString() || '',
        tipRate: emp.tipRate?.toString() || '',
      };
    }

    setEmployees(data);
    setFormState(initFormState);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSave = async (id: string) => {
    const values = formState[id];
    const payload = {
      baseRate: parseFloat(values.baseRate),
      baseRateWithTips: values.baseRateWithTips ? parseFloat(values.baseRateWithTips) : undefined,
      tipRate: values.tipRate ? parseFloat(values.tipRate) : undefined,
    };

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    setEditingId(null);
    fetchEmployees();
  };

  const handleChange = (id: string, field: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const filteredAndSortedEmployees = employees
    .filter((emp) => emp.username.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.username.localeCompare(b.username));

  return (
    <Container size="sm" mt="xl">
      <Title order={2} mb="md">Employee Management</Title>

      <TextInput
        placeholder="Search by username..."
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        mb="md"
      />

      <Stack>
        {filteredAndSortedEmployees.map((emp) => {
          const isOpen = openId === emp.id;
          const isEditing = editingId === emp.id;
          const form = formState[emp.id] || {};

          return (
            <Paper withBorder p="md" key={emp.id}>
              <Text
                fw={500}
                onClick={() => {
                  setOpenId(isOpen ? null : emp.id);
                  setEditingId(null); // reset edit mode
                }}
                style={{ cursor: 'pointer' }}
              >
                {emp.username}
              </Text>

              {isOpen && (
                <Stack mt="sm">
                  <Text><b>Email:</b> {emp.email}</Text>
                  <Text><b>Level:</b> {emp.level}</Text>
                  <Text><b>SIN:</b> {emp.sin}</Text>
                  <Text><b>DOB:</b> {dayjs(emp.dob).format('YYYY-MM-DD')}</Text>
                  <Text><b>Address:</b> {emp.address}</Text>

                  {isEditing ? (
                    <>
                      <TextInput
                        label="Base Rate (Norm)"
                        type="number"
                        step="0.01"
                        value={form.baseRate}
                        onChange={(e) => handleChange(emp.id, 'baseRate', e.currentTarget.value)}
                      />
                      {emp.level === 'II' && (
                        <>
                          <TextInput
                            label="Base Rate With Tips"
                            type="number"
                            step="0.01"
                            value={form.baseRateWithTips}
                            onChange={(e) => handleChange(emp.id, 'baseRateWithTips', e.currentTarget.value)}
                          />
                          <TextInput
                            label="Tip Rate"
                            type="number"
                            step="0.01"
                            value={form.tipRate}
                            onChange={(e) => handleChange(emp.id, 'tipRate', e.currentTarget.value)}
                          />
                        </>
                      )}
                      <Group mt="sm">
                        <Button color="green" onClick={() => handleSave(emp.id)}>
                          Save
                        </Button>
                        <Button variant="outline" color="red" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </Group>
                    </>
                  ) : (
                    <>
                      <Text><b>Base Rate:</b> ${emp.baseRate?.toFixed(2)}</Text>
                      {emp.level === 'II' && (
                        <>
                          <Text><b>Base With Tips:</b> ${emp.baseRateWithTips?.toFixed(2)}</Text>
                          <Text><b>Tip Rate:</b> ×{emp.tipRate}</Text>
                        </>
                      )}
                      <Button variant="light" onClick={() => setEditingId(emp.id)}>
                        Edit Salary Info
                      </Button>
                    </>
                  )}
                </Stack>
              )}
            </Paper>
          );
        })}
      </Stack>
    </Container>
  );
}
