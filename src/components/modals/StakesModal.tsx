import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import debug from 'debug';
import { BrowserProvider, ethers } from 'ethers';
import { ChangeEvent, FC, useEffect, useState } from 'react';
import { AIXRevenueSharingAbi, erc20Abi } from 'src/abi';
import { Modal } from 'src/components/UI/Modal';
import { OpacityBox } from 'src/components/UI/OpacityBox';
import { UIButton } from 'src/components/UI/UIButton';
import { MAX_UINT } from 'src/constants/eth';
import { useAllowance } from 'src/hooks/useAllowance';
import { useApprove } from 'src/hooks/useApprove';
import { useAppChain } from 'src/providers/AppChainProvider';
import { useSetModal } from 'src/providers/ModalsProvider';
import { useTransactions } from 'src/providers/TransactionsProvider';
import { StakesModalSettings } from 'src/types/modal';
import { BN, getAtomicAmount, getDisplayAmount } from 'src/utils/bigNumber';
import { numberInputReg } from 'src/utils/input';
import { UncheckedJsonRpcSigner } from 'src/utils/UncheckedJsonRpcSigner';

const INIT_BALANCE = { raw: '0', formatted: '0', fullPrecision: '0' };

const log = debug('components:StakesModal');

export const StakesModal: FC<StakesModalSettings> = ({
  stakes,
  selectedIndex = 0,
  walletStakesSum,
  fetchWalletStakes,
  fetchStakes,
  stakeValue = '0',
}) => {
  const setModal = useSetModal();
  const [{ chainConfig, appRpcProvider }] = useAppChain();
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { trackTx, trackError } = useTransactions();
  const [allowance, reloadAllowance] = useAllowance(
    chainConfig.contracts.AIX,
    address,
    chainConfig.contracts.AIXRevenueSharing,
  );
  const approve = useApprove(
    chainConfig.contracts.AIX,
    chainConfig.contracts.AIXRevenueSharing,
    'Approving',
  );

  const [selectedStake, setSelectedStake] = useState(stakes[selectedIndex]);
  const [balance, setBalance] = useState(INIT_BALANCE);
  const [amount, setAmount] = useState(stakeValue);

  useEffect(() => {
    if (!address) {
      setBalance(INIT_BALANCE);
      return;
    }

    fetchUserBalance();
  }, [address]);

  const needApproval = BN(allowance).lt(getAtomicAmount(amount, 18));
  const wrongNetwork = isConnected && chainId !== chainConfig.id;

  async function fetchUserBalance() {
    const contract = new ethers.Contract(chainConfig.contracts.AIX, erc20Abi, appRpcProvider);
    contract.balanceOf(address).then((resp: bigint) =>
      setBalance({
        raw: resp.toString(),
        formatted: getDisplayAmount(resp.toString(), { decimals: 18 }),
        fullPrecision: getDisplayAmount(resp.toString(), { decimals: 18, cut: false }),
      }),
    );
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    let value = numberInputReg(e.target.value);

    if (BN(value).gt(balance.formatted)) {
      value = balance.formatted;
    }

    setAmount(value);
  }

  async function handleStake() {
    if (!walletProvider) return;
    if (needApproval) {
      await approve(MAX_UINT);
      await reloadAllowance();
    }

    let tx;

    try {
      // const provider = new BrowserProvider(walletProvider);
      // const signer = await provider.getSigner();
      const signer = new UncheckedJsonRpcSigner(new BrowserProvider(walletProvider), address!);
      const contract = new ethers.Contract(
        chainConfig.contracts.AIXRevenueSharing,
        AIXRevenueSharingAbi,
        signer,
      );
      const amountWei = getAtomicAmount(amount, 18);

      setModal({ modalKey: 'loader', title: 'Confirm your transaction in the wallet' });

      const gasLimit = await contract.stake.estimateGas(getAtomicAmount(amount), selectedStake.sec);

      tx = await contract.stake(getAtomicAmount(amount), selectedStake.sec, {
        gasLimit: BN(gasLimit.toString()).times(1.2).toFixed(0),
      });

      setModal({
        modalKey: 'loader',
        title: `Staking ${amount} AIX...`,
        txHash: tx.txHash,
      });

      trackTx(tx);

      log('tx', tx);
      await tx.wait();
      setModal(null);

      fetchWalletStakes();
      fetchStakes();

      log(`${amountWei} AIX successfully supplied.`);
    } catch (e) {
      trackError(e, tx);
      setModal(null);
      console.error('Stake action failed:', e);
      throw e;
    }
  }

  return (
    <Modal>
      <div className="modal-title">Select Staking Option</div>
      <div className="flex flex-col space-y-4 mb-8">
        {stakes.map((stake) => (
          <div
            key={stake.sec}
            className={`flex items-center rounded-lg bg-black bg-opacity-5 border-2 justify-between px-4 py-2 pb-1.5 cursor-pointer ${
              stake.sec === selectedStake.sec
                ? 'border-purple-600'
                : 'border-black border-opacity-5'
            }`}
            onClick={() => setSelectedStake(stake)}
          >
            <span className="text-xl">{stake.apr}% APR</span>
            <span className="opacity-50">{stake.days.toString()} days Lockup</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col space-y-2 mb-6">
        <div
          className="text-sm font-semibold text-gray-600 cursor-pointer"
          onClick={() => setAmount(balance.formatted.toString())}
        >
          Balance: <span className="text-purple-600">{balance.formatted.toString()} AIX</span>
        </div>
        <div className="relative">
          <input
            value={amount}
            type="text"
            placeholder="0"
            className="ui-input"
            onChange={handleChange}
          />
          <span
            className="font-bold absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-500 text-sm cursor-pointer hover:text-purple-600"
            onClick={() => setAmount(balance.formatted.toString())}
          >
            Max
          </span>
        </div>
      </div>
      <p className="text-lg text-center mb-6">
        You are staking: {getDisplayAmount(walletStakesSum[selectedStake.sec.toString()] || 0)} AIX
        tokens
      </p>
      {needApproval && (
        <OpacityBox className="items-center text-lg bg-none border border-gray-400 mb-10">
          <ul>
            <span>You will need to send two transactions:</span>
            <li className="pl-4">1. Approve AIX for Stake</li>
            <li className="pl-4">2. Stake AIX tokens</li>
          </ul>
        </OpacityBox>
      )}
      <UIButton className="w-full" onClick={handleStake} disabled={wrongNetwork}>
        {wrongNetwork ? 'Wrong network' : needApproval ? 'Approve AIX and Stake' : 'Stake'}
      </UIButton>
    </Modal>
  );
};
