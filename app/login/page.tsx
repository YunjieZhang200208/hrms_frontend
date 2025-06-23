'use client';

import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Container,
  Button,
  Stack,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) =>
        value.length >= 6 ? null : 'Password must be at least 6 characters',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await res.json();

      const user = data.user;

      if (!user) {
        throw new Error('User not found');
      }

      // Redirect based on role
      switch (user.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'manager':
          router.push('/manager');
          break;
        case 'employee':
          router.push('/employee');
          break;
        default:
        // alert('Unknown role');
      }
    } catch (err: any) {
      // alert(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">SshStr System</Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="邮箱 (Email)"
              placeholder="you@example.com"
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label="密码 (Password)"
              placeholder="Your password"
              {...form.getInputProps('password')}
            />
            <Button type="submit" fullWidth mt="md" loading={loading}>
              Login
            </Button>
            {/* <Text size="sm" mt="sm">
              Don't have an account?{' '}
              <Anchor component={Link} href="/register" size="sm">
                Register here
              </Anchor>
            </Text> */}
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
