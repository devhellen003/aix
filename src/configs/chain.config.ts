import { ethers } from 'ethers';

export type ChainConfig = typeof CHAIN;

export const CHAIN =
  import.meta.env.VITE_USE_TEST_NET === 'true'
    ? ({
        id: 11155111,
        name: 'Sepolia test network',
        explorer: 'https://sepolia.etherscan.io',
        rpcProviderUrl: 'https://sepolia.infura.io/v3/',
        wsProviderUrl: 'wss://sepolia.infura.io/ws/v3/db72eb2275564c62bfa71896870d8975',
        contracts: {
          AIXRevenueSharing: '0x764bbA47E8d293ecD085874eb65768353e3F68d6',
          AIX: '0x0F72dbf83c1141842A34afA3719796F6997Ae234',
          AIXMigration: '0x84D14D320Df1Aa0d689FcEb0F290F5D08fd86247',
          payments: '0x21071e52Cd21F1411eC1E5a372239aCECa76891F',
          privateSale: '0x5463F8FBCEE63360432Fa91E5e45483674d2cf3B',
          AIX_NFT: '0x0b5dd12b1f116E37172B8Daa687887cdc7AEdCD6',
        },
        coingecko: {
          chainName: 'ethereum',
          categoryId: 'ethereum-ecosystem',
        },
        paramsForAdding: {
          rpcProvider: 'https://sepolia.infura.io/v3/',
          nativeCurrency: {
            name: 'SepoliaETH',
            symbol: 'SepoliaETH',
            decimals: 18,
          },
          hexId: ethers.toQuantity(11155111),
        },
        additionalTokens: [],
        predefinedTokens: {
          '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2': {
            name: 'Maker',
            symbol: 'MKR',
            decimals: 18,
          },
        } as Record<string, { name: string; symbol: string; decimals: number }>,
      } as const)
    : ({
        id: 1,
        name: 'Mainnet network',
        explorer: 'https://etherscan.io',
        rpcProviderUrl: 'https://mainnet.infura.io/v3/92eb829b550743f2a839c803401503fc',
        wsProviderUrl: 'wss://mainnet.infura.io/ws/v3/92eb829b550743f2a839c803401503fc',
        contracts: {
          AIXRevenueSharing: '0xd051eF3DBBEA636Fa009A0318ac51e9eE2CBc3bD',
          AIXMigration: '0x84D14D320Df1Aa0d689FcEb0F290F5D08fd86247',
          AIX: '0x40e9187078032AfE1a30cfcF76E4fe3D7aB5c6C5',
          payments: '0xC889891630598a90D2A2360f891f492CAd5aA887',
          privateSale: '0x6ba4c6854a0CD66F39D41e0a9a8D8C52179dcF86',
          AIX_NFT: '0x0b5dd12b1f116E37172B8Daa687887cdc7AEdCD6',
        },
        paramsForAdding: {
          rpcProvider: 'https://mainnet.infura.io/v3/',
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
          hexId: ethers.toQuantity(1),
        },
        coingecko: {
          chainName: 'ethereum',
          categoryId: 'ethereum-ecosystem',
        },
        additionalTokens: [],
        predefinedTokens: {
          '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2': {
            name: 'Maker',
            symbol: 'MKR',
            decimals: 18,
          },
        } as Record<string, { name: string; symbol: string; decimals: number }>,
      } as const);
