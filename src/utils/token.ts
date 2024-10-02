import { arrayify } from '@ethersproject/bytes';
import { parseBytes32String } from '@ethersproject/strings';
import debug from 'debug';
import { Call, Contract, Provider } from 'ethcall';
import { ethers } from 'ethers';
import { erc20Abi } from 'src/abi';
import { ChainConfig } from 'src/configs/chain.config';
import { ZERO_ADDRESS } from 'src/constants/eth';
import { CoingeckoFormattedToken } from 'src/types/coingecko';
import { Token, TokenInfoCallsRes } from 'src/types/tokens';
import { createMatrix } from 'src/utils/array';
import { getDisplayAmount } from 'src/utils/bigNumber';
import { isZeroAddress } from 'src/utils/compareAddresses';

const log = debug('utils:token');

/**
 * Fetches information about tokens on a blockchain.
 * @param {ChainConfig} chainConfig - Configuration for the blockchain chain.
 * @param {ethers.JsonRpcProvider} appRpcProvider - The JSON RPC provider for blockchain queries.
 * @param {string[]} addresses - An array of token contract addresses.
 * @param {string} userAddress - An array of token contract addresses.
 * @returns {Promise<Token[]>} An array of tokens with their details.
 */
export async function fetchTokensInfo(
  chainConfig: ChainConfig,
  appRpcProvider: ethers.JsonRpcProvider,
  addresses: string[],
  userAddress?: string | null,
): Promise<CoingeckoFormattedToken[]> {
  let ethIndex: number = -1;

  const filteredAddresses = [...addresses].filter((address, index) => {
    if (isZeroAddress(address)) {
      ethIndex = index;
      return false;
    }
    return true;
  });

  const ethcallProvider = new Provider(chainConfig.id, appRpcProvider);
  const calls: Call[] = [];

  filteredAddresses.forEach((address) => {
    const contract = new Contract(address, erc20Abi);
    calls.push(contract.name(), contract.symbol(), contract.decimals());
    if (userAddress) calls.push(contract.balanceOf(userAddress));
  });

  try {
    const tokensInfoRaw = await ethcallProvider.tryAll(calls);
    const tokensInfoSplitted = createMatrix(
      tokensInfoRaw,
      userAddress ? 4 : 3,
    ) as TokenInfoCallsRes[];
    const tokensInfo = tokensInfoSplitted.map<Token>((token, i) => {
      const info = {
        name: token[0],
        symbol: token[1],
        decimals: Number(token[2]),
        address: filteredAddresses[i].toLowerCase(),
        balance: {
          raw: '0',
          formatted: '0',
          fullPrecision: '0',
        },
      };

      if (userAddress) {
        info.balance = {
          raw: token[3].toString(),
          formatted: getDisplayAmount(token[3].toString(), { decimals: info.decimals }),
          fullPrecision: getDisplayAmount(token[3].toString(), {
            decimals: info.decimals,
            cut: false,
          }),
        };
      }

      return info;
    });

    log('ethIndex', ethIndex);

    if (ethIndex !== -1) {
      const ethBalance = !userAddress
        ? '0'
        : (await appRpcProvider.getBalance(userAddress)).toString();

      log('ethBalance', ethBalance);
      log('userAddress', userAddress);

      tokensInfo.splice(ethIndex, 0, {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        address: ZERO_ADDRESS,
        isEth: true,
        balance: {
          raw: ethBalance,
          formatted: getDisplayAmount(ethBalance),
          fullPrecision: getDisplayAmount(ethBalance, { cut: false }),
        },
      });
    }

    log('fetchTokensInfo tokensInfo', tokensInfo);

    return tokensInfo;
  } catch (e) {
    console.error(e);
    return [];
  }
}
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/;

function parseStringOrBytes32(
  str: string | undefined,
  bytes32: string | undefined,
  defaultValue: string,
): string {
  return str && str.length > 0
    ? str
    : // need to check for proper bytes string and valid terminator
      bytes32 && BYTES32_REGEX.test(bytes32) && arrayify(bytes32)[31] === 0
      ? parseBytes32String(bytes32)
      : defaultValue;
}
