// app/employee/page.tsx
import { getUser } from '@/lib/getUser';

export default async function ManagerPage() {
  const user = await getUser();

  if (!user) {
    return (
      <div>
        <h1>User not found</h1>
        <p>You are not logged in as an manager.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome, {user.username}</h1>
      <p>You are logged in as an manager.</p>
    </div>
  );
}
