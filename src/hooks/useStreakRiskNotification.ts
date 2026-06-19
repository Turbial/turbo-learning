import { useEffect } from 'react';
import { useStreakAtRisk } from '../data/useStreakAtRisk';
import { scheduleStreakAtRiskAlert } from '../integrations/push';

export function useStreakRiskNotification(userId?: string) {
  const { data } = useStreakAtRisk(userId);
  useEffect(() => {
    if (data?.isAtRisk && data.expiresInHours > 0) {
      scheduleStreakAtRiskAlert(data.expiresInHours);
    }
  }, [data?.isAtRisk, data?.expiresInHours]);
}
