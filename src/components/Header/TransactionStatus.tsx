import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import { BrowserProvider, ethers } from 'ethers';
import React, { useEffect, useMemo } from 'react';
import { CircularProgress } from 'src/components/UI/CircularProgress';
import { UIButton } from 'src/components/UI/UIButton';
import { useTransactions } from 'src/providers/TransactionsProvider';
import { TxStatus } from 'src/types/transactions';

export const TransactionStatus: React.FC = React.memo(() => {
  const { walletProvider } = useWeb3ModalProvider();
  const { address } = useWeb3ModalAccount();
  const { transactions, getTransactionsFromStorage, resetTransactionsStore, trackTx } =
    useTransactions();

  useEffect(() => {
    resetTransactionsStore();

    if (!address || !walletProvider) {
      return;
    }

    const provider = new BrowserProvider(walletProvider);
    const promises = getTransactionsFromStorage()[ethers.getAddress(address)] || {};

    Object.values(promises).forEach((tx) => {
      if (tx.status === TxStatus.Pending) {
        provider
          .getTransaction(tx.hash)
          .then((res) => {
            if (res) {
              trackTx(res);
            }
          })
          .catch((e) => console.error('Failed to get Transaction:', e));
      }
    });
  }, [address, walletProvider]);

  const pendingTxCount = useMemo(() => {
    return address
      ? Object.values(getTransactionsFromStorage()[ethers.getAddress(address)] || {}).filter(
          (tx) => tx.status === TxStatus.Pending,
        ).length
      : 0;
  }, [address, getTransactionsFromStorage, transactions]);

  if (!pendingTxCount) return null;

  return (
    <UIButton buttonType="stroke">
      <div className="mr-4 w-4 h-4">
        <CircularProgress spinnerSize="full" className="fill-white" />
      </div>
      {pendingTxCount} pending
    </UIButton>
  );
});
