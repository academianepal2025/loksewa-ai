import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon: Icon, action }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center bg-surface border border-dashed border-border-subtle rounded-3xl"
    >
      <div className="h-20 w-20 bg-background border border-border-subtle rounded-2xl flex items-center justify-center text-subtle/40 mb-8">
        <Icon className="h-10 w-10" />
      </div>
      <h3 className="text-xl font-bold text-foreground tracking-tight mb-2">{title}</h3>
      <p className="text-sm font-medium text-subtle max-w-xs leading-relaxed mb-10">
        {description}
      </p>
      {action}
    </motion.div>
  );
}
