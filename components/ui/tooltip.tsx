'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children || (
            <span 
              className={cn("text-subtle hover:text-accent transition-colors p-0.5 inline-flex cursor-help", className)}
              tabIndex={0}
              role="button"
              aria-label="More information"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </span>
          )}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={5}
            className="z-[100] overflow-hidden rounded-lg bg-foreground px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-background animate-in fade-in zoom-in-95 duration-200"
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-foreground" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
