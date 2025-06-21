// components/TimeInputWithIcon.tsx
'use client';

import { useRef } from 'react';
import { TimeInput } from '@mantine/dates';
import { ActionIcon } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';

type TimeInputWithIconProps = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const TimeInputWithIcon = ({ label, value, onChange }: TimeInputWithIconProps) => {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <TimeInput
      label={label}
      value={value}
      onChange={onChange}
      ref={ref}
      rightSection={
        <ActionIcon variant="subtle" color="gray" onClick={() => ref.current?.showPicker()}>
          <IconClock size={16} stroke={1.5} />
        </ActionIcon>
      }
    />
  );
};
