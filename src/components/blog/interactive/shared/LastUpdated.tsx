'use client';

import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LastUpdatedProps {
  timestamp: string;
}

export function LastUpdated({ timestamp }: LastUpdatedProps) {
  const date = new Date(timestamp);
  const formattedDate = date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return (
    <Badge variant="outline" className="inline-flex items-center gap-2">
      <Clock className="size-3" />
      Last updated: {formattedDate}
    </Badge>
  );
}
