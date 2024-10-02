import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import debug from 'debug';
import { BrowserProvider, ethers } from 'ethers';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { AIXPrivateSaleAbi, erc20Abi } from 'src/abi';
import { ExecuteButton } from 'src/components/ExecuteButton';
import { Modal } from 'src/components/UI/Modal';
import { UIInput } from 'src/components/UI/UIInput';
import { useAppChain } from 'src/providers/AppChainProvider';
import { useSetModal } from 'src/providers/ModalsProvider';
import { useTransactions } from 'src/providers/TransactionsProvider';
import { LaunchpadParticipateModalSettings } from 'src/types/modal';
import { BN, getAtomicAmount, getDisplayAmount } from 'src/utils/bigNumber';
import { numberInputReg } from 'src/utils/input';
import { UncheckedJsonRpcSigner } from 'src/utils/UncheckedJsonRpcSigner';

const MIN_AMOUNT_FORMATTED = 100;

const log = debug('components:LaunchpadParticipateModal');

export const LaunchpadParticipateModal: FC<LaunchpadParticipateModalSettings> = ({
  onSuccess,
  walletStakesSum,
}) => {
  const [value, setValue] = useState('0');
  const [aixBalance, setAixBalance] = useState({ raw: '0', formatted: '0', fullPrecision: '0' });
  const [max, setMax] = useState({ raw: '0', formatted: '0', fullPrecision: '0' });
  const [power, setPower] = useState('0');
  const { walletProvider } = useWeb3ModalProvider();
  const { address, isConnected } = useWeb3ModalAccount();
  const [{ chainConfig, appRpcProvider }] = useAppChain();
  const { trackTx, trackError } = useTransactions();
  const setModal = useSetModal();

  const totalStaked = useMemo(() => {
    return Object.values(walletStakesSum).reduce((acc, el) => {
      return BN(acc).plus(el).toString();
    }, '0');
  }, [walletStakesSum]);

  const canParticipate = BN(totalStaked).plus(aixBalance.raw).div(1e18).gt(MIN_AMOUNT_FORMATTED);

  useEffect(() => {
    if (!appRpcProvider) return;
    if (!address) return;

    const contract = new ethers.Contract(
      chainConfig.contracts.privateSale,
      AIXPrivateSaleAbi,
      appRpcProvider,
    );

    const AIXContract = new ethers.Contract(chainConfig.contracts.AIX, erc20Abi, appRpcProvider);

    Promise.all([
      appRpcProvider.getBalance(address),
      contract.accountPower(address),
      AIXContract.balanceOf(address),
    ]).then(([rawEthBalance, rawPower, rawAixBalance]) => {
      const rawEth = rawEthBalance.toString();
      const formattedEth = getDisplayAmount(rawEth);
      const fullPrecisionEth = getDisplayAmount(rawEth, { cut: false });

      const rawAix = rawAixBalance.toString();
      const formattedAix = getDisplayAmount(rawAix);
      const fullPrecisionAix = getDisplayAmount(rawAix, { cut: false });

      log('power from contract', rawPower.toString());

      setPower(getDisplayAmount(rawPower.toString()));
      setMax({ raw: rawEth, formatted: formattedEth, fullPrecision: fullPrecisionEth });
      setAixBalance({ raw: rawAix, formatted: formattedAix, fullPrecision: fullPrecisionAix });
    });
  }, [appRpcProvider, address]);

  const handleMax = () => {
    setValue(max.fullPrecision);
  };

  const handleValueChange = (e: React.ChangeEvent<any>) => {
    let value = numberInputReg(e.target.value);

    if (BN(value).gt(max.fullPrecision)) {
      value = max.fullPrecision;
    }

    setValue(value);
  };

  const handleDeposit = async () => {
    if (!walletProvider) return null;

    // const signer = await provider.getSigner();
    const signer = new UncheckedJsonRpcSigner(new BrowserProvider(walletProvider), address!);
    const contract = new ethers.Contract(
      chainConfig.contracts.privateSale,
      AIXPrivateSaleAbi,
      signer,
    );

    let tx;

    try {
      setModal({ modalKey: 'loader', title: 'Confirm your transaction in the wallet' });

      tx = await contract.buy({ value: getAtomicAmount(value) });

      setModal({
        modalKey: 'loader',
        title: 'Depositing ETH',
        txHash: tx.hash,
      });

      trackTx(tx);

      await tx.wait();

      onSuccess();
      setModal({
        modalKey: 'success',
        title:
          'Thank you for your contribution! 🙌\n' +
          'You will be able to claim your $ECL at TGE. Stay tuned for more updates.',
      });
    } catch (err: any) {
      trackError(err, tx);
      setModal(null);
      console.error('Deposit failed', err);
      throw err;
    }
  };

  return (
    <Modal size="sm">
      <div className="modal-title">Participate in Eclipse</div>
      {isConnected && (
        <>
          <div>Your balance: {aixBalance.formatted} $AIX</div>
          <div className="mb-4">Your stake sum: {getDisplayAmount(totalStaked)} $AIX</div>
          {!canParticipate && (
            <div className="bg-[#ED1522] bg-opacity-10 border border-[#ED1522] p-4 rounded-lg my-4">
              Your stake and balance of $AIX is less than the minimum required to participate in the
              Eclipse project (minimum of {MIN_AMOUNT_FORMATTED} $AIX)
            </div>
          )}
        </>
      )}
      <div className="w-full my-8">
        <UIInput
          labelEnd={
            <div className="cursor-pointer" onClick={handleMax}>
              Max
            </div>
          }
          label="ETH deposit amount"
          name="eth-value"
          value={value}
          onChange={handleValueChange}
        />
      </div>
      <div className="flex flex-col space-y-1 mb-4">
        <p>Hold or Stake 100+ $AIX to be eligible.</p>
        <p>Stake 10.000-99.999 $AIX for a 10% boost</p>
        <p>Stake 100.000+ $AIX for a 20% boost</p>
      </div>
      <ExecuteButton
        className="w-full"
        onClick={handleDeposit}
        label="Deposit"
        disabled={!canParticipate}
      />
    </Modal>
  );
};
