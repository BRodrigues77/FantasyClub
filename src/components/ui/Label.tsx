import { cn } from '@/lib/utils'
import * as LabelPrimitive from '@radix-ui/react-label'
import type { ComponentProps } from 'react'

export function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn('text-sm font-medium text-foreground', className)}
      {...props}
    />
  )
}
