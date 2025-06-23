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
      <Title order={2} mb="md">员工管理</Title>

      <TextInput
        placeholder="按用户名搜索..."
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
                  setEditingId(null);
                }}
                style={{ cursor: 'pointer' }}
              >
                {emp.username}
              </Text>

              {isOpen && (
                <Stack mt="sm">
                  <Text><b>邮箱：</b>{emp.email}</Text>
                  <Text><b>等级：</b>{emp.level}</Text>
                  <Text><b>社保号：</b>{emp.sin}</Text>
                  <Text><b>出生日期：</b>{dayjs(emp.dob).format('YYYY-MM-DD')}</Text>
                  <Text><b>住址：</b>{emp.address}</Text>

                  {isEditing ? (
                    <>
                      <TextInput
                        label="基础时薪（普通）"
                        type="number"
                        step="0.01"
                        value={form.baseRate}
                        onChange={(e) => handleChange(emp.id, 'baseRate', e.currentTarget.value)}
                      />
                      {emp.level === 'II' && (
                        <>
                          <TextInput
                            label="含小费基础时薪"
                            type="number"
                            step="0.01"
                            value={form.baseRateWithTips}
                            onChange={(e) => handleChange(emp.id, 'baseRateWithTips', e.currentTarget.value)}
                          />
                          <TextInput
                            label="小费提成倍率"
                            type="number"
                            step="0.01"
                            value={form.tipRate}
                            onChange={(e) => handleChange(emp.id, 'tipRate', e.currentTarget.value)}
                          />
                        </>
                      )}
                      <Group mt="sm">
                        <Button color="green" onClick={() => handleSave(emp.id)}>
                          保存
                        </Button>
                        <Button variant="outline" color="red" onClick={() => setEditingId(null)}>
                          取消
                        </Button>
                      </Group>
                    </>
                  ) : (
                    <>
                      <Text><b>基础时薪：</b>${emp.baseRate?.toFixed(2)}</Text>
                      {emp.level === 'II' && (
                        <>
                          <Text><b>含小费基础时薪：</b>${emp.baseRateWithTips?.toFixed(2)}</Text>
                          <Text><b>小费提成倍率：</b>×{emp.tipRate}</Text>
                        </>
                      )}
                      <Button variant="light" onClick={() => setEditingId(emp.id)}>
                        编辑工资信息
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
