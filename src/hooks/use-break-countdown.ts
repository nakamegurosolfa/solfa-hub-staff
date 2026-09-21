import { useEffect, useMemo, useState } from "react";

import { getBreakCountdownRemainingSeconds } from "@/lib/break-countdown";

export function useBreakCountdown(businessDate: string, startAt: string | null | undefined) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!startAt) {
      return;
    }

    setNow(new Date());
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [businessDate, startAt]);

  return useMemo(() => {
    if (!startAt) {
      return 0;
    }

    return getBreakCountdownRemainingSeconds(businessDate, startAt, now);
  }, [businessDate, now, startAt]);
}
