'use client';

import {
    TextInput,
    PasswordInput,
    NumberInput,
    Select,
    Group,
    Button,
    Paper,
    Stepper,
    Stack,
    Container,
    Title,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import '@mantine/dates/styles.css'

export default function RegisterPage() {
    const router = useRouter();
    const [active, setActive] = useState(0);
    const [loading, setLoading] = useState(false);
    const [highestStepVisited, setHighestStepVisited] = useState(0);

    type RestaurantOption = {
        value: string;
        label: string;
    };

    const [restaurants, setRestaurants] = useState<RestaurantOption[]>([]);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/restaurants`);
                const data = await res.json();
                const options = data.docs.map((r: any) => ({
                    value: r.id,
                    label: r.location ? `${r.name} (${r.location})` : r.name,
                }));
                setRestaurants(options);
            } catch (err) {
                console.error('Failed to fetch restaurants', err);
            }
        };

        fetchRestaurants();
    }, []);



    const form = useForm({
        initialValues: {
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
            level: '',
            baseRate: 17.2,
            baseRateWithTips: '',
            tipRate: '',
            sin: '',
            dob: '',
            address: '',
            restaurant: '',
        },
        validate: (values) => {
            const errors: Record<string, string> = {};
            if (!/^\S+@\S+\.\S+$/.test(values.email)) { errors.email = 'Invalid email'; }
            if (!values.username) { errors.username = 'Username required'; }
            if (values.password.length < 6) { errors.password = 'Password too short'; }
            if (values.password !== values.confirmPassword) { errors.confirmPassword = 'Mismatch'; }
            if (!values.level) { errors.level = 'Employee level required' };
            if (!values.baseRate) { errors.baseRate = 'Base rate required' };
            if (values.level === 'II') {
                if (!values.baseRateWithTips) { errors.baseRateWithTips = 'Required for server' };
                if (!values.tipRate) { errors.tipRate = 'Tip rate required' };
            }
            if (!values.sin) { errors.sin = 'SIN required' };
            if (!values.dob) { errors.dob = 'DOB required' };
            if (!values.address) { errors.address = 'Address required' };
            if (!values.restaurant) { errors.restaurant = 'Restaurant required' };
            return errors;
        },
    });

    const nextStep = () => {
        let fieldsToValidate: string[] = [];

        if (active === 0) {
            fieldsToValidate = ['email', 'username', 'password', 'confirmPassword', 'level'];
        } else if (active === 1) {
            fieldsToValidate = ['baseRate'];
            if (form.values.level === 'II') {
                fieldsToValidate.push('baseRateWithTips', 'tipRate');
            }
        } else if (active === 2) {
            fieldsToValidate = ['sin', 'dob', 'address', 'restaurant'];
        }

        let hasErrors = false;
        for (const field of fieldsToValidate) {
            const validation = form.validateField(field as keyof typeof form.values);
            if (validation.hasError) {
                hasErrors = true;
            }
        }

        if (!hasErrors) {
            const next = active + 1;
            setActive(next);
            setHighestStepVisited(Math.max(highestStepVisited, next));
        }
    };

    const prevStep = () => setActive((current) => Math.max(current - 1, 0));
    const allowSelectStep = (step: number) => highestStepVisited >= step;

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form.values,
                    role: 'employee',
                    dob: dayjs(form.values.dob).format('YYYY-MM-DD'),
                }),
            });

            if (!res.ok) {
                throw new Error((await res.json()).message || 'Registration failed');
            }
            router.push('/login');
        } catch (err: any) {
            //   alert(err.message || 'Registration error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size="md" my="xl">
            <Title align="center">Employee Registration</Title>
            <Paper withBorder shadow="md" p="xl" radius="md" mt="lg">
                <Stepper active={active} onStepClick={setActive}>
                    <Stepper.Step
                        label="Account Info"
                        description="Email, password & level"
                        allowStepSelect={allowSelectStep(0)}
                    >
                        <Stack>
                            <TextInput
                                label="Email"
                                placeholder="you@example.com"
                                {...form.getInputProps('email')}
                            />
                            <TextInput
                                label="Username"
                                placeholder="yourname"
                                {...form.getInputProps('username')}
                            />
                            <PasswordInput label="Password" {...form.getInputProps('password')} />
                            <PasswordInput label="Confirm Password" {...form.getInputProps('confirmPassword')} />
                            <Select
                                label="Employee Level"
                                placeholder="Select level"
                                data={[
                                    { value: 'I', label: 'Norm (Level I)' },
                                    { value: 'II', label: 'Server (Level II)' },
                                ]}
                                {...form.getInputProps('level')}
                            />
                        </Stack>
                    </Stepper.Step>

                    <Stepper.Step
                        label="Wage Info"
                        description="Hourly pay details"
                        allowStepSelect={allowSelectStep(1)}
                    >
                        <Stack>
                            <NumberInput
                                label="Base Hourly Rate"
                                min={0}
                                step={0.01}
                                {...form.getInputProps('baseRate')}
                            />
                            {form.values.level === 'II' && (
                                <>
                                    <NumberInput
                                        label="Server Shift Rate"
                                        min={0}
                                        step={0.01}
                                        {...form.getInputProps('baseRateWithTips')}
                                    />
                                    <NumberInput
                                        label="Tip Rate Multiplier"
                                        min={0}
                                        step={0.01}
                                        {...form.getInputProps('tipRate')}
                                    />
                                </>
                            )}
                        </Stack>
                    </Stepper.Step>

                    <Stepper.Step
                        label="Personal Info"
                        description="Identification & address"
                        allowStepSelect={allowSelectStep(2)}
                    >
                        <Stack>
                            <TextInput label="SIN" {...form.getInputProps('sin')} />
                            <DateInput
                                label="Date of Birth"
                                valueFormat="YYYY-MM-DD"
                                {...form.getInputProps('dob')}
                            />
                            <TextInput label="Address" {...form.getInputProps('address')} />
                            <Select
                                label="Restaurant"
                                placeholder="Select your restaurant"
                                data={restaurants}
                                searchable
                                {...form.getInputProps('restaurant')}
                            />
                        </Stack>
                    </Stepper.Step>

                    <Stepper.Completed>All set! Submit to register</Stepper.Completed>
                </Stepper>

                <Group justify="center" mt="xl">
                    {active > 0 && (
                        <Button variant="default" onClick={prevStep}>
                            Back
                        </Button>
                    )}
                    {active < 3 ? (
                        <Button onClick={nextStep}>Next</Button>
                    ) : (
                        <Button loading={loading} onClick={handleSubmit}>
                            Register
                        </Button>
                    )}
                </Group>
            </Paper>
        </Container>
    );
}
