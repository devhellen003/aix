import { ChainId, CurrencyAmount, Token, WETH9 } from '@uniswap/sdk-core';
import { Pair } from '@uniswap/v2-sdk';
import debug from 'debug';
import { ethers } from 'ethers';
import flatMap from 'lodash/flatMap';
import { UniswapFeesDetector, UniswapV2Pair } from 'src/abi';
import { isAddressesEq, isZeroAddress } from 'src/utils/compareAddresses';

const log = debug('utils:uniswap');

export const createPairsAsTokens = (tokenA: Token | null, tokenB: Token | null) => {
  if (!tokenA || !tokenB) return [];

  const bases: Token[] = [
    WETH9[ChainId.MAINNET],
    new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI'),
    new Token(ChainId.MAINNET, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 6, 'USDC'),
    new Token(ChainId.MAINNET, '0xdac17f958d2ee523a2206206994597c13d831ec7', 6, 'USDT'),
  ];

  log('bases', bases);

  const basePairs = flatMap(bases, (base): [Token, Token][] =>
    bases.map((otherBase) => [base, otherBase]),
  ).filter(([t0, t1]) => t0.address !== t1.address);

  log('basePairs', basePairs);

  const allPairCombinations = [
    // the direct pair
    [tokenA, tokenB],
    // token A against all bases
    ...bases.map((base): [Token, Token] => [tokenA, base]),
    // token B against all bases
    ...bases.map((base): [Token, Token] => [tokenB, base]),
    // each base against all bases
    ...basePairs,
  ]
    .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
    .filter(([t0, t1]) => t0.address !== t1.address);

  log('allPairCombinations', allPairCombinations);

  return allPairCombinations;
};

export async function createPair(
  Token0: Token,
  Token1: Token,
  provider: ethers.JsonRpcProvider,
): Promise<Pair | null> {
  const pairAddress = Pair.getAddress(Token0, Token1);

  const pairContract = new ethers.Contract(pairAddress, UniswapV2Pair, provider);
  let reserves;
  try {
    reserves = await pairContract['getReserves']();
  } catch (e) {
    reserves = null;
  }

  if (!reserves) return null;

  const [reserve0, reserve1] = reserves;

  log('reserves', reserves);

  const tokens = [Token0, Token1];
  const [token0, token1] = tokens[0].sortsBefore(tokens[1]) ? tokens : [tokens[1], tokens[0]];

  return new Pair(
    CurrencyAmount.fromRawAmount(token0, reserve0.toString()),
    CurrencyAmount.fromRawAmount(token1, reserve1.toString()),
  );
}

const FEE_CACHE: { [address in string]?: { sellFeeBps?: bigint; buyFeeBps?: bigint } } = {};
const WETH_ADDRESS = WETH9[ChainId.MAINNET].address;
const AMOUNT_TO_BORROW = 10000;

export async function getSwapTaxes(
  inputTokenAddress: string | undefined,
  outputTokenAddress: string | undefined,
  provider: ethers.JsonRpcProvider,
) {
  const detectorContract = '0x19C97dc2a25845C7f9d1d519c8C2d4809c58b43f';
  const contract = new ethers.Contract(detectorContract, UniswapFeesDetector, provider);
  const addresses = [];

  if (
    inputTokenAddress &&
    FEE_CACHE[inputTokenAddress] === undefined &&
    !isZeroAddress(inputTokenAddress) &&
    !isAddressesEq(WETH9[1].address, inputTokenAddress)
  ) {
    addresses.push(inputTokenAddress);
  }

  if (
    outputTokenAddress &&
    FEE_CACHE[outputTokenAddress] === undefined &&
    !isZeroAddress(outputTokenAddress) &&
    !isAddressesEq(WETH9[1].address, outputTokenAddress)
  ) {
    addresses.push(outputTokenAddress);
  }

  log('getSwapTaxes addresses', addresses);

  try {
    if (addresses.length) {
      const data = await contract.batchValidate.staticCall(
        addresses,
        WETH_ADDRESS,
        AMOUNT_TO_BORROW,
      );

      addresses.forEach((address, index) => {
        const [sellFeeBps, buyFeeBps] = data[index];
        log('getSwapTaxes contract call result data', { sellFeeBps, buyFeeBps });

        FEE_CACHE[address] = { sellFeeBps, buyFeeBps };
      });
    }
  } catch (e) {
    console.warn('Failed to get swap taxes for token(s):', addresses, e);
  }

  const sellFeeBps = (inputTokenAddress ? FEE_CACHE[inputTokenAddress]?.sellFeeBps : 0n) ?? 0n;
  const buyFeeBps = (outputTokenAddress ? FEE_CACHE[outputTokenAddress]?.buyFeeBps : 0n) ?? 0n;

  return { sellFeeBps, buyFeeBps };
}
