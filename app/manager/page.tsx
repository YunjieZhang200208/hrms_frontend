import { getUser } from '@/lib/getUser';
import { redirect } from 'next/navigation';

export default async function ManagerPage() {
  const user = await getUser();

  if (!user || user.role !== 'manager') {
    redirect('/login');
  }

  redirect('/manager/dashboard');
}
