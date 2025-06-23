'use client';

import {
  Paper,
  PasswordInput,
  Button,
  Stack,
  Title,
  Text,
  Group,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';

export default function ChangePasswordForm() {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const form = useForm({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      newPassword: (v) => (v.length < 6 ? 'New password too short' : null),
      confirmPassword: (v, values) =>
        v !== values.newPassword ? 'Passwords do not match' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setSuccess('');
    setError('');

    try {
      const tokenRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/request-reset-token`, {
        method: 'POST',
        credentials: 'include',
      });

      const tokenJson = await tokenRes.json();

      if (!tokenRes.ok || !tokenJson.token) {
        throw new Error(tokenJson.error || 'Failed to get reset token');
      }

      const resetRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenJson.token,
          password: values.newPassword,
        }),
      });

      const resetJson = await resetRes.json();

      if (!resetRes.ok) {
        throw new Error(resetJson.error || 'Password reset failed');
      }

      setSuccess('Password updated successfully!');
      form.reset();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <Paper withBorder shadow="sm" p="xl" mt="lg">
      <Title order={4} mb="md">更改密码 (Change Password)</Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <PasswordInput
            label="新密码 (New Password)"
            {...form.getInputProps('newPassword')}
          />
          <PasswordInput
            label="确认密码 (Confirm New Password)"
            {...form.getInputProps('confirmPassword')}
          />

          {success && <Text c="green">{success}</Text>}
          {error && <Text c="red">{error}</Text>}

          <Group justify="flex-end">
            <Button type="submit">Update Password</Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
