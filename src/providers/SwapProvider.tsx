import { Percent, Token, TradeType } from '@uniswap/sdk-core';
import { Trade } from '@uniswap/v2-sdk';
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import debug from 'debug';
import { Call, Contract, Provider } from 'ethcall';
import { AddressLike, BrowserProvider, ethers } from 'ethers';
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { erc20Abi, UniswapV2RouterAbi } from 'src/abi';
import { MAX_UINT } from 'src/constants/eth';
import { ETH_AS_TOKEN } from 'src/constants/tokens';
import { useImmutableCallback } from 'src/hooks/useActualRef';
import { useAllowance } from 'src/hooks/useAllowance';
import { useApprove } from 'src/hooks/useApprove';
import { useUniswapTrade } from 'src/hooks/useUniswapTrade';
import { useAppChain } from 'src/providers/AppChainProvider';
import { useSetModal } from 'src/providers/ModalsProvider';
import { useTransactions } from 'src/providers/TransactionsProvider';
import { CoingeckoFormattedToken } from 'src/types/coingecko';
import { FCC } from 'src/types/FCC';
import { withTimeout } from 'src/utils/async';
import { BN, getAtomicAmount, getDisplayAmount } from 'src/utils/bigNumber';
import { isAddressesEq, isZeroAddress } from 'src/utils/compareAddresses';
import { fetchTokensInfo } from 'src/utils/token';
import { trustApiGetTokensList } from 'src/utils/trust';
import { UncheckedJsonRpcSigner } from 'src/utils/UncheckedJsonRpcSigner';

const ETH_TOKEN = {
  asset: '',
  chainId: 1,
  image: '/images/ic-eth.svg',
  logoURI: '/images/ic-eth.svg',
  type: '',
  ...ETH_AS_TOKEN,
  balance: { raw: '0', formatted: '0', fullPrecision: '0' },
};

interface ISwapProviderCtx {
  tokens: CoingeckoFormattedToken[];
  setTokens: Dispatch<SetStateAction<CoingeckoFormattedToken[]>>;
  fetchingTokens: boolean;
  token0: CoingeckoFormattedToken;
  token1: CoingeckoFormattedToken | null;
  token0Amount: string;
  token1Amount: string;
  trade?: Trade<Token, Token, TradeType> | null;
  tradeType: TradeType;
  swapError: string;
  onTokenSelect: (tokenId: 'token0' | 'token1', token: CoingeckoFormattedToken | null) => void;
  setToken0Amount: Dispatch<SetStateAction<string>>;
  setToken1Amount: Dispatch<SetStateAction<string>>;
  setTradeType: Dispatch<SetStateAction<TradeType>>;
  onReverseTokens: () => void;
  fetchWalletBalances: () => void;
  tryToFetchCustomToken: (address: string) => Promise<CoingeckoFormattedToken | null>;
  onSwap: () => void;
}

const initCtx: ISwapProviderCtx = {
  tokens: [ETH_TOKEN],
  setTokens: () => {},
  fetchingTokens: true,
  token0: ETH_TOKEN,
  token1: null,
  token0Amount: '',
  token1Amount: '',
  trade: null,
  tradeType: TradeType.EXACT_INPUT,
  swapError: '',
  onTokenSelect: () => {},
  setToken0Amount: () => {},
  setToken1Amount: () => {},
  setTradeType: () => {},
  onReverseTokens: () => {},
  fetchWalletBalances: () => {},
  tryToFetchCustomToken: () => Promise.resolve(null),
  onSwap: () => {},
};

const SwapProviderCtx = createContext<ISwapProviderCtx>(initCtx);

const log = debug('providers:SwapProvider');
const slippageTolerance = new Percent('300', '10000');

export const SwapProvider: FCC = ({ children }) => {
  const [{ chainConfig, appRpcProvider }] = useAppChain();
  const { address } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { open } = useWeb3Modal();
  const setModal = useSetModal();
  const { trackTx, trackError } = useTransactions();

  const [top100Tokens, setTop100Tokens] = useState(initCtx.tokens);
  const [token0, setToken0] = useState(initCtx.token0);
  const [token1, setToken1] = useState(initCtx.token1);
  const [token0Amount, setToken0Amount] = useState<string>(initCtx.token0Amount);
  const [token1Amount, setToken1Amount] = useState<string>(initCtx.token1Amount);
  const [fetchingTokens, setFetchingTokens] = useState(initCtx.fetchingTokens);
  const [tradeType, setTradeType] = useState<TradeType>(initCtx.tradeType);

  const { tradeExactIn, tradeExactOut } = useUniswapTrade(
    token0,
    token1,
    token0Amount,
    token1Amount,
    tradeType === TradeType.EXACT_INPUT,
  );
  const [allowance, reloadAllowance] = useAllowance(
    token0.address,
    address,
    '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  );
  const approve = useApprove(
    token0.address,
    '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    'Approving',
  );

  const needApproval =
    !isZeroAddress(token0.address) &&
    BN(allowance).lt(getAtomicAmount(token0Amount, token0.decimals));

  useEffect(() => {
    if (!token1Amount) setToken0Amount('');
  }, [token1Amount]);

  useEffect(() => {
    if (!token0Amount) setToken1Amount('');
  }, [token0Amount]);

  useEffect(() => {
    if (tradeExactIn) setToken1Amount(tradeExactIn.outputAmount.toExact());
    if (tradeExactOut) setToken0Amount(tradeExactOut.inputAmount.toExact());
  }, [tradeExactIn, tradeExactOut]);

  useEffect(() => {
    fetchTop100Tokens();
  }, []);

  useEffect(() => {
    if (fetchingTokens) return;

    if (!address) {
      clearBalances();
      return;
    }

    fetchWalletBalances();
  }, [address, fetchingTokens]);

  const swapError = useMemo(() => {
    const errorMessage = `Insufficient ${token0?.symbol} balance`;
    if (!token0) return 'Select token for sell';
    if (BN(token0Amount).gt(token0.balance.fullPrecision)) return errorMessage;
    return '';
  }, [top100Tokens, token0, token0Amount]);

  const tryToFetchCustomToken = async (
    searchToken: string,
  ): Promise<CoingeckoFormattedToken | null> => {
    if (fetchingTokens)
      return withTimeout<CoingeckoFormattedToken | null>(300, tryToFetchCustomToken(searchToken));

    log('tryToFetchCustomToken', searchToken);

    const existingToken = top100Tokens.find((el) => isAddressesEq(searchToken, el.address));

    if (existingToken) return existingToken;

    try {
      const tokenInfo = (
        await fetchTokensInfo(chainConfig, appRpcProvider, [searchToken], address)
      )[0];

      if (!tokenInfo) {
        return null;
      }

      setTop100Tokens((prevState) => [...prevState, tokenInfo]);
      return tokenInfo;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const fetchTop100Tokens = async () => {
    let tokens = await trustApiGetTokensList();

    tokens.unshift(ETH_TOKEN);

    const tokensInfo = await fetchTokensInfo(
      chainConfig,
      appRpcProvider,
      tokens.map((el) => el.address),
      address!,
    );

    tokens = tokens.map((token, i) => ({
      ...tokensInfo[i],
      ...token,
      balance: tokensInfo[i].balance,
    }));

    setTop100Tokens(
      [...tokens].sort((a, b) => {
        if (BN(a.balance.raw).gt(b.balance.raw)) return -1;
        if (BN(a.balance.raw).lt(b.balance.raw)) return 1;
        return 0;
      }),
    );

    setToken0(tokens[0]);

    setFetchingTokens(false);
  };

  const fetchWalletBalances = async () => {
    const ethcallProvider = new Provider(chainConfig.id, appRpcProvider);
    const calls: Call[] = top100Tokens.map((token) => {
      const contract = new Contract(token.address, erc20Abi);
      return contract.balanceOf(address);
    });

    try {
      const [balances, ethBalance] = await Promise.all([
        ethcallProvider.tryAll<bigint>(calls),
        appRpcProvider.getBalance(address as AddressLike),
      ]);

      setTop100Tokens((prevState) =>
        prevState
          .map((el, index) => {
            const balance = isZeroAddress(el.address)
              ? ethBalance.toString()
              : balances[index]?.toString();

            el.balance = {
              raw: balance || '0',
              formatted: getDisplayAmount(balance || 0, {
                decimals: el.decimals,
              }),
              fullPrecision: getDisplayAmount(balance || 0, {
                decimals: el.decimals,
                cut: false,
              }),
            };
            return el;
          })
          .sort((a, b) => {
            if (BN(a.balance.fullPrecision).gt(b.balance.fullPrecision)) return -1;
            if (BN(a.balance.fullPrecision).lt(b.balance.fullPrecision)) return 1;
            return 0;
          }),
      );
    } catch (e) {
      console.error(e);
    }
  };

  const clearBalances = () => {
    setTop100Tokens((prevState) =>
      prevState.map((el) => {
        el.balance = { raw: '0', formatted: '0', fullPrecision: '0' };
        return el;
      }),
    );
  };

  const handleTokenSelect = (
    tokenId: 'token0' | 'token1',
    token: CoingeckoFormattedToken | null,
  ) => {
    if (tokenId === 'token0' && token) setToken0(token);
    else if (tokenId === 'token1') setToken1(token);
  };

  const handleTokensReverse = () => {
    const newToken0 = token1 ? JSON.parse(JSON.stringify(token1)) : undefined;
    const newToken1 = token0 ? JSON.parse(JSON.stringify(token0)) : undefined;

    setToken0(newToken0);
    setToken1(newToken1);
  };

  const handleSwap = useImmutableCallback(async () => {
    log('handleSwap fired', { address, walletProvider, token1 });
    if (!address) open();
    if (!walletProvider) return;
    if (!token1) return;

    const trade = tradeExactIn || tradeExactOut;

    if (!trade) return;

    if (needApproval) {
      await approve(MAX_UINT);
      await reloadAllowance();
    }

    let tx;
    let methodName: string;
    let callParams: any[];

    const isEthIn = isZeroAddress(token0.address);
    const isEthOut = isZeroAddress(token1.address);
    const isExactIn = tradeType === TradeType.EXACT_INPUT;
    const sellOrBuyFees =
      trade.inputAmount.currency.sellFeeBps?.gt(0) || trade.outputAmount.currency.buyFeeBps?.gt(0);

    log('trade', trade);
    log('isNativeTrade', isEthIn);
    log('isExactIn', isExactIn);

    // const provider = new BrowserProvider(walletProvider);
    // const signer = await provider.getSigner();
    const signer = new UncheckedJsonRpcSigner(new BrowserProvider(walletProvider), address!);
    const routerContract = new ethers.Contract(
      '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      UniswapV2RouterAbi,
      signer,
    );
    const path = trade.route.path.map((el) => el.address);
    const to = address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    if (isEthIn) {
      const value = getAtomicAmount(trade.inputAmount.toExact());
      let amount: string;

      if (isExactIn) {
        amount = getAtomicAmount(
          trade.minimumAmountOut(slippageTolerance).toExact(),
          trade.outputAmount.currency.decimals,
        );
        methodName = sellOrBuyFees
          ? 'swapExactETHForTokensSupportingFeeOnTransferTokens'
          : 'swapExactETHForTokens';
      } else {
        amount = getAtomicAmount(
          trade.outputAmount.toExact(),
          trade.outputAmount.currency.decimals,
        );
        methodName = 'swapETHForExactTokens';
      }
      callParams = [amount, path, to, deadline, { value }];
    } else if (isEthOut) {
      if (isExactIn) {
        const amountIn = getAtomicAmount(
          trade.inputAmount.toExact(),
          trade.inputAmount.currency.decimals,
        );
        const amountOut = getAtomicAmount(trade.minimumAmountOut(slippageTolerance).toExact());
        methodName = sellOrBuyFees
          ? 'swapExactTokensForETHSupportingFeeOnTransferTokens'
          : 'swapExactTokensForETH';
        callParams = [amountIn, amountOut, path, to, deadline];
      } else {
        const amountIn = getAtomicAmount(
          trade.maximumAmountIn(slippageTolerance).toExact(),
          trade.inputAmount.currency.decimals,
        );
        const amountOut = getAtomicAmount(trade.outputAmount.toExact());
        methodName = 'swapTokensForExactETH';
        callParams = [amountOut, amountIn, path, to, deadline];
      }
    } else {
      if (isExactIn) {
        const amountIn = getAtomicAmount(
          trade.inputAmount.toExact(),
          trade.inputAmount.currency.decimals,
        );
        const amountOut = getAtomicAmount(
          trade.minimumAmountOut(slippageTolerance).toExact(),
          trade.outputAmount.currency.decimals,
        );
        methodName = sellOrBuyFees
          ? 'swapExactTokensForTokensSupportingFeeOnTransferTokens'
          : 'swapExactTokensForTokens';
        callParams = [amountIn, amountOut, path, to, deadline];
      } else {
        const amountIn = getAtomicAmount(
          trade.maximumAmountIn(slippageTolerance).toExact(),
          trade.inputAmount.currency.decimals,
        );
        const amountOut = getAtomicAmount(
          trade.outputAmount.toExact(),
          trade.outputAmount.currency.decimals,
        );
        methodName = 'swapTokensForExactTokens';
        callParams = [amountOut, amountIn, path, to, deadline];
      }
    }

    try {
      setModal({ modalKey: 'loader', title: 'Confirm your transaction in the wallet' });

      log('Swap methodName', methodName);
      log('Swap callParams', callParams);

      tx = await routerContract[methodName](...callParams);

      setModal({
        modalKey: 'loader',
        title: 'Swap in process...',
        txHash: tx.hash,
      });

      trackTx(tx);

      await tx.wait();
      await fetchWalletBalances();

      setModal(null);
    } catch (err: any) {
      trackError(err, tx);
      setModal(null);
      console.error('payment failed', err);
      throw err;
    }
  });

  return (
    <SwapProviderCtx.Provider
      value={{
        tokens: top100Tokens,
        setTokens: setTop100Tokens,
        fetchingTokens,
        token0,
        token1,
        trade: tradeExactIn || tradeExactOut,
        token0Amount,
        token1Amount,
        tradeType,
        setToken0Amount,
        setToken1Amount,
        setTradeType,
        onTokenSelect: handleTokenSelect,
        onReverseTokens: handleTokensReverse,
        onSwap: handleSwap,
        tryToFetchCustomToken,
        fetchWalletBalances,
        swapError,
      }}
    >
      {children}
    </SwapProviderCtx.Provider>
  );
};

export const useSwapProvider = () => useContext(SwapProviderCtx);
