import { useState, useEffect } from 'react';

export function useRotatingMessages(isLoading: boolean, messages: string[], interval = 8000) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [isLoading, messages.length, interval]);

  return messages[index];
}
