import { BigNumber } from '@ethersproject/bignumber';
import { CurrencyAmount, Ether, Token, TradeType, WETH9 } from '@uniswap/sdk-core';
import { Pair, Trade } from '@uniswap/v2-sdk';
import debug from 'debug';
import { useEffect, useMemo, useState } from 'react';
import { useAppChain } from 'src/providers/AppChainProvider';
import { CoingeckoFormattedToken } from 'src/types/coingecko';
import { getAtomicAmount } from 'src/utils/bigNumber';
import { isZeroAddress } from 'src/utils/compareAddresses';
import { createPair, createPairsAsTokens, getSwapTaxes } from 'src/utils/uniswap';

const log = debug('hooks:useUniswapTrade');

export const useUniswapTrade = (
  tokenIn: CoingeckoFormattedToken | null,
  tokenOut: CoingeckoFormattedToken | null,
  tokenInAmount: string,
  tokenOutAmount: string,
  isExactIn: boolean,
) => {
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [TokenOut, setTokenOut] = useState<Token | null>(null);
  const [TokenIn, setTokenIn] = useState<Token | null>(null);

  const [{ appRpcProvider }] = useAppChain();

  useEffect(() => {
    if (!tokenIn) return setTokenIn(null);
    getSwapTaxes(tokenIn.address, undefined, appRpcProvider).then(({ sellFeeBps, buyFeeBps }) => {
      log('tokenIn taxes', {
        buyFeeBps,
        sellFeeBps,
      });

      if (isZeroAddress(tokenIn.address)) {
        const token = WETH9[1];
        setTokenIn(token);
        log('setTokenIn', token);
        return;
      }

      setTokenIn(
        new Token(
          1,
          tokenIn.address,
          tokenIn.decimals,
          tokenIn.symbol,
          tokenIn.name,
          undefined,
          BigNumber.from(buyFeeBps),
          BigNumber.from(sellFeeBps),
        ),
      );
    });
  }, [tokenIn]);

  useEffect(() => {
    if (!tokenOut) return setTokenOut(null);
    getSwapTaxes(undefined, tokenOut.address, appRpcProvider).then(({ sellFeeBps, buyFeeBps }) => {
      log('tokenOut taxes', {
        buyFeeBps,
        sellFeeBps,
      });

      if (isZeroAddress(tokenOut.address)) {
        const token = Ether.onChain(1).wrapped;
        setTokenOut(token);
        log('setTokenOut', token);
        return;
      }

      setTokenOut(
        new Token(
          1,
          tokenOut.address,
          tokenOut.decimals,
          tokenOut.symbol,
          tokenOut.name,
          undefined,
          BigNumber.from(buyFeeBps),
          BigNumber.from(sellFeeBps),
        ),
      );
    });
  }, [tokenOut]);

  useEffect(() => {
    createPairs(createPairsAsTokens(TokenIn, TokenOut));
  }, [TokenIn, TokenOut]);

  const tradeExactIn = useMemo(() => {
    if (pairs.length === 0) return null;
    if (!isExactIn) return null;
    if (!tokenInAmount) return null;

    const trade = Trade.bestTradeExactIn(
      pairs,
      CurrencyAmount.fromRawAmount(TokenIn!, getAtomicAmount(tokenInAmount, TokenIn!.decimals)),
      TokenOut!,
      {
        maxHops: 3,
        maxNumResults: 1,
      },
    );

    log('tradeExactIn', trade[0]);

    return trade[0];
  }, [pairs, isExactIn, tokenInAmount]);

  const tradeExactOut = useMemo(() => {
    if (pairs.length === 0) return null;
    if (isExactIn) return null;
    if (!tokenOutAmount) return null;

    const trade = Trade.bestTradeExactOut(
      pairs,
      TokenIn!,
      CurrencyAmount.fromRawAmount(TokenOut!, getAtomicAmount(tokenOutAmount, TokenOut!.decimals)),
      {
        maxHops: 3,
        maxNumResults: 1,
      },
    );

    log('tradeExactOut', trade[0]);

    return trade[0];
  }, [pairs, isExactIn, tokenOutAmount]);

  const createPairs = async (pairsAsTokens: [Token, Token][]) => {
    log('pairsAsTokens', pairsAsTokens);

    const uniqPairsAddresses: string[] = [];

    const uniqPairs = (
      await Promise.all(pairsAsTokens.map(([t0, t1]) => createPair(t0, t1, appRpcProvider)))
    )
      .filter(Boolean)
      .filter((pair) => {
        if (uniqPairsAddresses.includes(pair.liquidityToken.address)) return false;
        uniqPairsAddresses.push(pair.liquidityToken.address);
        return true;
      });

    log('pairs', uniqPairs);

    setPairs(uniqPairs);
  };

  return { tradeExactIn, tradeExactOut };
};

const usePriceImpact = (trade: Trade<Token, Token, TradeType>) => {};
