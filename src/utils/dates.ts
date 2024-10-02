import { BN } from 'src/utils/bigNumber';

/**
 * Converts a time period from seconds to days.
 * @param period - The time period in seconds.
 * @returns The equivalent time period in days as a string.
 */
export const secToDays = (period: number | string): string => {
  const secondsPerMinute = 60;
  const minutesPerHour = 60;
  const hoursPerDay = 24;

  return BN(period).div(secondsPerMinute).div(minutesPerHour).div(hoursPerDay).toString();
};
