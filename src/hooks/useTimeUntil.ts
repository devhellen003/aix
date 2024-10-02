import moment from 'moment';
import { useEffect, useRef, useState } from 'react';

export const useTimeUntil = (end: number | string | null | undefined) => {
  const [pastTime, setPastTime] = useState('0');
  const interval = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (end === 0 || end === '0' || !end) {
      setPastTime('0');
      return;
    }
    calculatePastTime();
    interval.current = setInterval(() => {
      calculatePastTime();
    }, 1000);

    return () => clearInterval(interval.current);
  }, [end]);

  function calculatePastTime() {
    const endTime = moment(Number(end) * 1000);
    const now = moment().utc();

    // Calculate the duration between now and the end time
    const duration = moment.duration(endTime.diff(now));

    // Check if the duration is negative (end time has passed)
    if (duration.asSeconds() < 0) {
      setPastTime('0');
      clearInterval(interval.current); // Stop the interval as well
      return;
    }

    // Extract each component from the duration
    const months = duration.months();
    const days = duration.days();
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    // Set the with the calculated duration components
    // Ensure to check each time component and append it to the string only if it's significant
    setPastTime(
      `${months ? `${months} month${months > 1 ? 's' : ''} ` : ''}` +
        `${days ? `${days} day${days > 1 ? 's' : ''} ` : ''}` +
        `${hours ? `${hours} hour${hours > 1 ? 's' : ''} ` : ''}` +
        `${minutes || (!months && !days && !hours) ? `${minutes} min` : ''}` +
        `${!months && !days && !hours && !minutes ? `${seconds} sec` : ''}`,
    );
  }

  return pastTime;
};
