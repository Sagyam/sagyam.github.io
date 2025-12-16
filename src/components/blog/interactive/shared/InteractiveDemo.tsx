'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface InteractiveDemoProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export function InteractiveDemo({
  title = 'Interactive Demo',
  description = 'Click to interact',
  children,
}: InteractiveDemoProps) {
  const [count, setCount] = useState(0);

  return (
    <Card className="my-6 border-primary/20 bg-white/5">
      <CardHeader>
        <CardTitle className="text-xl text-foreground">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {children || (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-muted-foreground">
                Counter: <span className="text-2xl font-bold text-primary">{count}</span>
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setCount(count + 1)} variant="default">
                Increment
              </Button>
              <Button onClick={() => setCount(0)} variant="outline">
                Reset
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
