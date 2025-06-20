'use client';

import {
    TextInput,
    PasswordInput,
    Paper,
    Title,
    Container,
    Button,
    Stack,
    Anchor,
    Text,
} from '@mantine/core';
import Link from 'next/link';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();

    const form = useForm({
        initialValues: {
            username: '',
            password: '',
            confirmPassword: '',
        },

        validate: {
            username: (value) => (value.length > 0 ? null : 'Username is required'),
            password: (value) =>
                value.length >= 6 ? null : 'Password must be at least 6 characters',
            confirmPassword: (value, values) =>
                value !== values.password ? 'Passwords do not match' : null,
        },
    });

    const handleSubmit = (values: typeof form.values) => {
        console.log('Registering user:', values);

        // TODO: Replace with real register logic
        router.push('/login');
    };

    return (
        <Container size={460} my={40}>
            <Title>Create Account</Title>
            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        <TextInput
                            label="Username"
                            placeholder="yourusername"
                            {...form.getInputProps('username')}
                        />
                        <PasswordInput
                            label="Password"
                            placeholder="Your password"
                            {...form.getInputProps('password')}
                        />
                        <PasswordInput
                            label="Confirm Password"
                            placeholder="Repeat your password"
                            {...form.getInputProps('confirmPassword')}
                        />
                        <Button type="submit" fullWidth mt="md">
                            Register
                        </Button>
                        <Text size="sm" align="center" mt="sm">
                            Already have an account?{' '}
                            <Anchor component={Link} href="/login" size="sm">
                                Login here
                            </Anchor>
                        </Text>
                    </Stack>
                </form>
            </Paper>
        </Container>
    );
}
