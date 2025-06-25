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
import {
  Center,
  Stack,
  Tooltip,
  UnstyledButton,
  Group,
  Box,
  rem,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import classes from './NavbarMinimal.module.css'

interface NavItem {
  icon: any
  label: string
  path: string
}

interface SidebarProps {
  userRole: 'employee' | 'manager'
}

function NavbarLink({
  icon: Icon,
  label,
  active,
  onClick,
  isMobile = false,
}: NavItem & { active: boolean; onClick: () => void; isMobile?: boolean }) {
  return (
    <Tooltip label={label} position={isMobile ? 'top' : 'right'}>
      <UnstyledButton
        className={classes.link}
        data-active={active || undefined}
        onClick={onClick}
        style={{
          width: rem(50),
          height: rem(50),
        }}
      >
        <Icon size={20} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  )
}

export default function Sidebar({ userRole }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isMobile = useMediaQuery('(max-width: 768px)')

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
          { icon: IconUser, label: 'Profile', path: '/employee/profile' },
        ]

  const navLinks = items.map((item) => (
    <NavbarLink
      key={item.path}
      {...item}
      isMobile={isMobile}
      active={pathname === item.path}
      onClick={() => router.push(item.path)}
    />
  ))

  const logoutLink = (
    <NavbarLink
      icon={IconLogout}
      label="Logout"
      path="/logout"
      active={false}
      onClick={() => router.push('/logout')}
      isMobile={isMobile}
    />
  )

  if (isMobile) {
    return (
      <Box className={classes.bottomNav}>
        <Group justify="space-around" w="100%">
          {navLinks}
          {logoutLink}
        </Group>
      </Box>
    )
  }

  return (
    <nav className={classes.navbar}>
      <Center mb="xl">
        <IconCalendarStats size={30} />
      </Center>
      <Stack justify="center" gap={0}>
        {navLinks}
      </Stack>
      <Stack justify="center" gap={0} mt="auto">
        {logoutLink}
      </Stack>
    </nav>
  )
}
