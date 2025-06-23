'use client'

import { usePathname, useRouter } from 'next/navigation'
import {
  IconCalendarStats,
  IconGauge,
  IconUser,
  IconLogout,
  IconBuildingStore,
  IconPlus,
} from '@tabler/icons-react'
import { Center, Stack, Tooltip, UnstyledButton } from '@mantine/core'
import classes from './NavbarMinimal.module.css'

interface NavItem {
  icon: any
  label: string
  path: string
}

interface SidebarProps {
  userRole: 'employee' | 'manager';
}

function NavbarLink({
  icon: Icon,
  label,
  active,
  onClick,
}: NavItem & { active: boolean; onClick: () => void }) {
  return (
    <Tooltip label={label} position="right">
      <UnstyledButton
        className={classes.link}
        data-active={active || undefined}
        onClick={onClick}
      >
        <Icon size={20} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  )
}

export default function Sidebar({ userRole }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const items: NavItem[] =
    userRole === 'manager'
      ? [
          { icon: IconPlus, label: 'New Shift', path: '/manager/new-shift' },
          { icon: IconGauge, label: 'Dashboard', path: '/manager/dashboard' },
          {
            icon: IconBuildingStore,
            label: 'Employee Management',
            path: '/manager/employees',
          },
          { icon: IconUser, label: 'Profile', path: '/manager/profile' },
        ]
      : [
          { icon: IconPlus, label: 'New Shift', path: '/employee/new-shift' },
          // { icon: IconGauge, label: 'Dashboard', path: '/employee/dashboard' },
          { icon: IconUser, label: 'Profile', path: '/employee/profile' },
        ];

  return (
    <nav className={classes.navbar}>
      <Center mb="xl">
        <IconCalendarStats size={30} />
      </Center>
      <Stack justify="center" gap={0}>
        {items.map((item) => (
          <NavbarLink
            key={item.path}
            {...item}
            active={pathname === item.path}
            onClick={() => router.push(item.path)}
          />
        ))}
      </Stack>
      <Stack justify="center" gap={0} mt="auto">
        <NavbarLink
          icon={IconLogout}
          label="Logout"
          path="/logout"
          active={false}
          onClick={() => router.push('/logout')}
        />
      </Stack>
    </nav>
  )
}
