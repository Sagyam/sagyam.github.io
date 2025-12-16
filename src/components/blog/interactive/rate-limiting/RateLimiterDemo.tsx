'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RateLimiterDemoProps {
  algorithm?: 'token-bucket' | 'leaky-bucket' | 'fixed-window' | 'sliding-window';
  limit?: number;
}

export function RateLimiterDemo({ algorithm = 'token-bucket', limit = 10 }: RateLimiterDemoProps) {
  const [requests, setRequests] = useState<number[]>([]);
  const [blocked, setBlocked] = useState(0);

  const handleRequest = () => {
    const now = Date.now();
    // Simple fixed window demo - replace with actual algorithm implementation
    const recentRequests = requests.filter((time) => now - time < 60000);

    if (recentRequests.length < limit) {
      setRequests([...recentRequests, now]);
    } else {
      setBlocked(blocked + 1);
    }
  };

  const reset = () => {
    setRequests([]);
    setBlocked(0);
  };

  return (
    <Card className="my-6 border-primary/20 bg-white/5">
      <CardHeader>
        <CardTitle className="text-xl text-foreground">Rate Limiter Demo - {algorithm}</CardTitle>
        <CardDescription className="text-muted-foreground">
          Limit: {limit} requests per minute
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Successful Requests</p>
            <p className="text-3xl font-bold text-green-500">{requests.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Blocked Requests</p>
            <p className="text-3xl font-bold text-red-500">{blocked}</p>
          </div>
        </div>

        <div className="flex gap-2 justify-center">
          <Button onClick={handleRequest} variant="default">
            Send Request
          </Button>
          <Button onClick={reset} variant="outline">
            Reset
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Click rapidly to test rate limiting!
        </div>
      </CardContent>
    </Card>
  );
}
