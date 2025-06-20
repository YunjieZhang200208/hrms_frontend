import { cookies } from 'next/headers';

export async function getUser(): Promise<null | {
  id: string;
  role: 'admin' | 'manager' | 'employee';
  email: string;
  username: string;
  restaurant?: any;
  sin?: string;
  dob?: string;
  address?: string;
  level?: 'I' | 'II';
  baseRate: number;
  baseRateWithTips?: number;
  tipRate?: number;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get('payload-token');

  if (!token) {
    return null;
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
      method: 'GET',
      headers: {
        Cookie: `payload-token=${token.value}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    const user = json.user;

    return {
      id: user.id,
      role: user.role,
      email: user.email,
      username: user.username,
      restaurant: user.restaurant,
      sin: user.sin,
      dob: user.dob,
      address: user.address,
      level: user.level,
      baseRate: user.baseRate,
      baseRateWithTips: user.baseRateWithTips,
      tipRate: user.tipRate,
    };
  } catch (err) {
    return null;
  }
}
