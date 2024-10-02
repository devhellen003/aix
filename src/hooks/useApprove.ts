import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import BigNumber from 'bignumber.js';
import { BrowserProvider, ethers } from 'ethers';

import erc20Abi from 'src/abi/erc20.json';
import { MAX_UINT } from 'src/constants/eth';
import { useSetModal } from 'src/providers/ModalsProvider';
import { useTransactions } from 'src/providers/TransactionsProvider';
import { UncheckedJsonRpcSigner } from 'src/utils/UncheckedJsonRpcSigner';

type UseApprove = (
  tokenAddress: string | null,
  spender: string,
  modalText?: string,
) => (value: BigNumber.Value) => Promise<void>;

export const useApprove: UseApprove = (tokenAddress, spender, modalText) => {
  const { walletProvider } = useWeb3ModalProvider();
  const { address } = useWeb3ModalAccount();
  const setModal = useSetModal();
  const { trackTx, trackError } = useTransactions();

  return async (value: BigNumber.Value = MAX_UINT) => {
    if (!tokenAddress || !walletProvider) return;

    // const provider = new BrowserProvider(walletProvider);
    // const signer = await provider.getSigner();
    const signer = new UncheckedJsonRpcSigner(new BrowserProvider(walletProvider), address!);
    const contract = new ethers.Contract(tokenAddress, erc20Abi, signer);

    let tx;

    try {
      setModal({ modalKey: 'loader', title: 'Confirm your transaction in the wallet' });

      tx = await contract.approve(spender, value);

      setModal({
        modalKey: 'loader',
        title: modalText ? String(modalText) : 'loading',
        txHash: tx.hash,
      });

      trackTx(tx);

      await tx.wait();

      setModal(null);
    } catch (err: any) {
      trackError(err, tx);
      setModal(null);
      console.error('useApprove failed', err);
      throw err;
    }
  };
};
