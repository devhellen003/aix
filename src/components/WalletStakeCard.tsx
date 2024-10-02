import { Icon } from '@iconify/react';
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import { BrowserProvider, ethers } from 'ethers';
import { FC, useEffect, useState } from 'react';
import { AIXRevenueSharingAbi } from 'src/abi';
import AIXTiker from 'src/assets/images/AIX-black-white.svg?react';
import { ExecuteButton } from 'src/components/ExecuteButton';
import { CircleWithIcon } from 'src/components/UI/CircleWithIcon';
import { OpacityBox } from 'src/components/UI/OpacityBox';
import { useImmutableCallback } from 'src/hooks/useActualRef';
import { useTimeUntil } from 'src/hooks/useTimeUntil';
import { useAppChain } from 'src/providers/AppChainProvider';
import { useSetModal } from 'src/providers/ModalsProvider';
import { useStakes } from 'src/providers/StakesProvider';
import { useTransactions } from 'src/providers/TransactionsProvider';
import { WalletStake } from 'src/types/stakes';
import { BN, getDisplayAmount, shortenNumber } from 'src/utils/bigNumber';
import { secToDays } from 'src/utils/dates';
import { UncheckedJsonRpcSigner } from 'src/utils/UncheckedJsonRpcSigner';

export const WalletStakeCard: FC<{ stake: WalletStake }> = ({ stake }) => {
  const { fetchWalletStakes, fetchStakes, stakes } = useStakes();
  const timeUntil = useTimeUntil(stake.unstakeTimestamp);
  const setModal = useSetModal();
  const { walletProvider } = useWeb3ModalProvider();
  const { chainId, isConnected, address } = useWeb3ModalAccount();
  const [{ chainConfig }] = useAppChain();
  const { trackTx, trackError } = useTransactions();

  const [isOpen, setIsOpen] = useState(false);

  const wrongNetwork = isConnected && chainId !== chainConfig.id;
  const selectedStake = stakes.find((el) => el.sec.toString() === stake.period);

  const clickHandler = useImmutableCallback(() => {
    setIsOpen(false);
  });

  useEffect(() => {
    window.document.addEventListener('click', clickHandler);

    return () => window.document.removeEventListener('click', clickHandler);
  }, []);

  async function emergencyWithdraw() {
    if (wrongNetwork) {
      return;
    }

    if (!walletProvider) return;

    // const provider = new BrowserProvider(walletProvider);
    // const signer = await provider.getSigner();
    const signer = new UncheckedJsonRpcSigner(new BrowserProvider(walletProvider), address!);
    const contract = new ethers.Contract(
      chainConfig.contracts.AIXRevenueSharing,
      AIXRevenueSharingAbi,
      signer,
    );

    let tx;

    try {
      setModal({ modalKey: 'loader', title: 'Confirm your transaction in the wallet' });

      tx = await contract.emergencyWithdraw(stake.stakeId);

      setModal({
        modalKey: 'loader',
        title: 'Unstaking',
        txHash: tx.hash,
      });

      trackTx(tx);

      await tx.wait();

      setModal(null);
      fetchStakes();
      fetchWalletStakes();
    } catch (err: any) {
      trackError(err, tx);
      setModal(null);
      console.error('unstake failed', err);
      throw err;
    }
  }

  function unstakeHandler() {
    setIsOpen(false);

    emergencyWithdraw();
  }

  return (
    <div className="flex items-center my-5">
      <div className="flex flex-col">
        <span className="text-4xl mb-1">{selectedStake ? selectedStake.apy : stake.apy}% APY</span>
        <span className="text-2xl mb-3">
          {selectedStake ? selectedStake.apr : BN(stake.apr).div(100).toString()}% APR
        </span>
        <div className="flex items-center">
          <span>{secToDays(stake.period)} days Lockup</span>
          <span className="ml-4 px-1.5 py-1.5 pb-1 bg-gray-700 opacity-50 rounded-xl">
            {timeUntil === '0' ? 'Claim available' : timeUntil}
          </span>
        </div>
      </div>
      <div className="flex ml-auto">
        <OpacityBox className="flex items-center p-4 rounded-2xl">
          <CircleWithIcon icon={<AIXTiker />} />
          <div className="flex flex-col ml-4">
            <span className="text-xl">
              {shortenNumber(getDisplayAmount(stake.stakedAmount, { decimals: 18 }))} AIX
            </span>
            <span className="opacity-40">Staked</span>
          </div>
        </OpacityBox>
        <OpacityBox className="flex items-center p-4 ml-3 rounded-2xl">
          <CircleWithIcon icon={<Icon className="text-black text-2xl" icon="logos:ethereum" />} />
          <div className="flex flex-col ml-4">
            <span className="text-xl">
              {shortenNumber(getDisplayAmount(stake.availableReward, { decimals: 18 }), 4)} ETH
            </span>
            <span className="opacity-40">Unclaimed ETH</span>
          </div>
        </OpacityBox>
        <ExecuteButton label="Unstake" className="self-center ml-6" onClick={unstakeHandler} />
      </div>
    </div>
  );
};
