import { BN } from '../utils/bigNumber';

export const MAX_UINT = BN(2).pow(256).minus(1).toString();
export const ZERO_ADDRESS = `0x${'0'.repeat(40)}`;
export const ORACLE_ETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
