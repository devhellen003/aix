import { ZERO_ADDRESS } from 'src/constants/eth';

/**
 * Checks if two Ethereum addresses are equal, case-insensitive.
 * @param address1 - The first Ethereum address to compare.
 * @param address2 - The second Ethereum address to compare.
 * @returns True if the addresses are equal, false otherwise.
 */
export const isAddressesEq = (address1: string, address2: string): boolean =>
  address1.toLowerCase() === address2.toLowerCase();

/**
 * Checks if an Ethereum address is the zero address.
 * @param address - The Ethereum address to check.
 * @returns True if the address is the zero address, false otherwise.
 */
export const isZeroAddress = (address: string): boolean => isAddressesEq(address, ZERO_ADDRESS);
