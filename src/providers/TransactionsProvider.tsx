/* eslint-disable @typescript-eslint/no-empty-function */
import { useWeb3ModalAccount } from '@web3modal/ethers/react';
import debug from 'debug';
import { ethers } from 'ethers';
import { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { FCC } from 'src/types/FCC';
import { TxByHash, TxError, TxRecord, TxStatus } from 'src/types/transactions';
import { useAppChain } from './AppChainProvider';

const log = debug('components:TransactionsProvider');

const transactionsProviderInit = {
  transactions: {},
  trackTx: async () => {},
  trackError: () => {},
  resetTransactionsStore: () => {},
  getTransactionsFromStorage: () => ({}),
} as {
  transactions: TxByHash;
  trackTx: (tx: ethers.TransactionResponse, callback?: () => void) => Promise<void>;
  trackError: (err: TxError, tx?: TxRecord) => void;
  resetTransactionsStore: () => void;
  getTransactionsFromStorage: () => {
    [key: string]: {
      [key: string]: {
        hash: string;
        status: number;
      };
    };
  };
};

const TransactionsProviderCtx = createContext(transactionsProviderInit);

export const TransactionsProvider: FCC = ({ children }) => {
  const [{ chainConfig }] = useAppChain();
  const { address } = useWeb3ModalAccount();

  const [txByHash, setTxByHash] = useState<TxByHash>({});

  const updateTransactions = (props: TxByHash) => {
    setTxByHash((prevState) => ({
      ...prevState,
      ...props,
    }));
  };

  const getTxByHash = (hash: string): TxRecord | undefined => txByHash[hash];

  const isTxPending = (hash: string): boolean =>
    Boolean(getTxByHash(hash)?.status === TxStatus.Pending);

  const setLastTransaction = (tx: TxRecord) => {
    updateStorage(tx);

    log('new lastTransaction:', tx);
    updateTransactions({ [tx.hash]: tx });
  };

  function addPendingTx(hash: string, from: string): void {
    setLastTransaction({
      hash,
      from,
      status: TxStatus.Pending,
      error: null,
    });
  }

  function markTxFailed(hash: string, from: string, error?: TxError): void {
    setLastTransaction({
      hash,
      from,
      status: TxStatus.Failed,
      error,
    });
  }

  function markTxMined(hash: string, from: string): void {
    setLastTransaction({
      hash,
      from,
      status: TxStatus.Mined,
      error: null,
    });
  }

  async function trackTx(tx: ethers.TransactionResponse, callback?: () => void) {
    if (isTxPending(tx.hash)) return;

    addPendingTx(tx.hash, tx.from);
    const result = await tx.wait();

    if (!address || !getTransactionsFromStorage()[ethers.getAddress(address)][tx.hash]) return;

    if (result?.status === TxStatus.Mined) {
      markTxMined(tx.hash, tx.from);
      toast.success('Transaction Confirmed', { id: `${chainConfig.explorer}/tx/${tx.hash}` });
      if (callback) callback();
      return;
    }

    markTxFailed(tx.hash, tx.from);
    toast.error('Transaction Failed', { id: `${chainConfig.explorer}/tx/${tx.hash}` });
  }

  function trackError(error: TxError, tx?: TxRecord) {
    if (tx) {
      markTxFailed(tx.hash, tx.from, error);
    } else {
      toast.error('Transaction Failed');
    }
  }

  const resetTransactionsStore = (): void => {
    setTxByHash({});
  };

  const getTransactionsFromStorage = () =>
    JSON.parse(sessionStorage.getItem('transactions') || '{}') as {
      [key: string]: { [key: string]: { hash: string; status: number } };
    };

  const updateStorage = (tx: TxRecord) => {
    sessionStorage.setItem(
      'transactions',
      JSON.stringify({
        ...getTransactionsFromStorage(),
        [tx.from]: {
          ...getTransactionsFromStorage()[tx.from],
          [tx.hash]: {
            hash: tx.hash,
            status: tx.status,
          },
        },
      }),
    );
  };

  return (
    <TransactionsProviderCtx.Provider
      value={{
        transactions: txByHash,
        trackTx,
        trackError,
        resetTransactionsStore,
        getTransactionsFromStorage,
      }}
    >
      {children}
    </TransactionsProviderCtx.Provider>
  );
};

export const useTransactions = () => useContext(TransactionsProviderCtx);
