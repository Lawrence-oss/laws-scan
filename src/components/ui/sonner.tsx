// src/components/ui/sonner.tsx
import * as React from 'react';
import { Toaster as Sonner, toast } from 'sonner';
import { useTheme } from './theme-provider';

const Toaster = ({ ...props }: React.ComponentProps<typeof Sonner>) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as 'light' | 'dark' | 'system'}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'bg-background text-foreground border-border rounded-md p-4',
          success: 'bg-success text-success-foreground',
          error: 'bg-destructive text-destructive-foreground',
          warning: 'bg-warning text-warning-foreground',
          info: 'bg-info text-info-foreground',
          title: 'font-semibold',
          description: 'text-sm opacity-90',
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-muted text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
