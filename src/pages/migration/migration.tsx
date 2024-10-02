import { Icon } from '@iconify/react';
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import debug from 'debug';
import { BrowserProvider, ethers } from 'ethers';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AIXMigrationAbi, erc20Abi } from 'src/abi';
import { ExecuteButton } from 'src/components/ExecuteButton';
import { LoadingStub } from 'src/components/UI/LoadingStub';
import { OpacityBox } from 'src/components/UI/OpacityBox';
import { UIButton } from 'src/components/UI/UIButton';
import { UIInput } from 'src/components/UI/UIInput';
import { WalletStakeCard } from 'src/components/WalletStakeCard';
import { useAllowance } from 'src/hooks/useAllowance';
import { useApprove } from 'src/hooks/useApprove';
import { useAppChain } from 'src/providers/AppChainProvider';
import { useSetModal } from 'src/providers/ModalsProvider';
import { useStakes } from 'src/providers/StakesProvider';
import { useTransactions } from 'src/providers/TransactionsProvider';
import { BN, getAtomicAmount, getDisplayAmount } from 'src/utils/bigNumber';
import { numberInputReg } from 'src/utils/input';

type TreeState = {
  wallet: string;
  claimableAmount: string;
  snapshotBalance: string;
  snapshotStakesAmount: string;
  proof: string[];
  manualVerificationRequired: boolean;
  manualVerificationExplain: string;
};

const log = debug('components:Migration');

export const Migration = () => {
  const { address } = useWeb3ModalAccount();
  // const address = '0x0b37dD71D17f5697CFC78b478eD1466b0c946DA4';
  const { walletProvider } = useWeb3ModalProvider();
  const [{ chainConfig, appRpcProvider }] = useAppChain();
  const setModal = useSetModal();
  const { trackTx, trackError } = useTransactions();
  const { walletStakes } = useStakes();

  const [treeState, setTreeState] = useState<TreeState | null>(null);
  const [loadingTree, setLoadingTree] = useState(true);
  const [walletNotInTheList, setWalletNotInTheList] = useState(false);
  const [migrateInputVal, setMigrateInputVal] = useState('0');
  const [balance, setBalance] = useState('0');
  const [claimedAmount, setClaimedAmount] = useState('0');

  const [allowance, reloadAllowance] = useAllowance(
    chainConfig.contracts.AIX,
    address,
    chainConfig.contracts.AIXMigration,
  );
  const approve = useApprove(
    chainConfig.contracts.AIX,
    chainConfig.contracts.AIXMigration,
    'Approving',
  );

  const needApproval = BN(allowance).lt(getAtomicAmount(migrateInputVal));

  useEffect(() => {
    if (!address) {
      setTreeState(null);
      return;
    }

    setLoadingTree(true);

    axios
      .get(
        `https://raw.githubusercontent.com/vsmelov/AIX-migration-proofs/refs/heads/main/proofs/${address.toLowerCase()}.json`,
      )
      .then((resp) => {
        setTreeState(resp.data);
        setWalletNotInTheList(false);
      })
      .catch(() => {
        setWalletNotInTheList(true);
        setTreeState(null);
      })
      .finally(() => setLoadingTree(false));
  }, [address]);

  const migrationContract = useMemo(
    () => new ethers.Contract(chainConfig.contracts.AIXMigration, AIXMigrationAbi, appRpcProvider),
    [chainConfig, appRpcProvider],
  );

  useEffect(() => {
    getParams();
  }, [address, migrationContract, walletNotInTheList]);

  function getParams() {
    if (!address) return;
    if (!migrationContract) return;
    if (walletNotInTheList) return;

    const AIXContract = new ethers.Contract(chainConfig.contracts.AIX, erc20Abi, appRpcProvider);

    Promise.all([AIXContract.balanceOf(address), migrationContract.claimedAmount(address)]).then(
      ([balance, claimed]) => {
        setBalance(balance.toString());
        setClaimedAmount(claimed.toString());
      },
    );
  }

  const amountToMigrate = useMemo(() => {
    if (!treeState) return '0';

    if (BN(balance).eq(0)) return '0';

    const { claimableAmount } = treeState;

    const maxClaimableAmount = BN(claimableAmount).minus(claimedAmount);
    return BigNumber.min(maxClaimableAmount, balance).toString();
  }, [treeState, claimedAmount, balance]);

  async function handleMigrate() {
    if (!treeState) return;
    if (!walletProvider) return;

    const amountWei = getAtomicAmount(migrateInputVal);

    if (needApproval) {
      await approve(amountWei);
      await reloadAllowance();
    }

    const { claimableAmount, proof } = treeState;

    let tx;

    try {
      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        chainConfig.contracts.AIXMigration,
        AIXMigrationAbi,
        signer,
      );

      setModal({ modalKey: 'loader', title: 'Confirm your transaction in the wallet' });

      tx = await contract.migrate(amountWei, claimableAmount, proof, '0x', '0');

      setModal({
        modalKey: 'loader',
        title: `Migrate ${migrateInputVal} AIX...`,
        txHash: tx.txHash,
      });

      trackTx(tx);

      log('tx', tx);
      await tx.wait();
      setModal(null);

      setMigrateInputVal('0');
      getParams();

      log(`${amountWei} AIX successfully migrated.`);
    } catch (e) {
      trackError(e, tx);
      setModal(null);
      console.error('Migrate action failed:', e);
      throw e;
    }
  }

  function handleMigrateValueChange(e: ChangeEvent<any>) {
    const val = numberInputReg(e.target.value);
    const maxAmount = getDisplayAmount(amountToMigrate, { cut: false });

    if (BN(val).gt(maxAmount)) {
      setMigrateInputVal(maxAmount);
      return;
    }

    setMigrateInputVal(numberInputReg(e.target.value));
  }

  return (
    <div className="container mx-auto flex-grow gap-4 flex flex-col">
      <OpacityBox
        className="flex items-center justify-between bg-[length:auto_100%] bg-no-repeat bg-right-bottom !py-12 pr-28 pl-10"
        style={{ backgroundImage: 'url(/images/migration/migrate-bg.png)' }}
      >
        <h2 className="text-3xl">
          Migrating tokens into
          <br />a new AGX token
        </h2>
        <img className="w-64" src="/images/migration/migrate-logos.png" />
      </OpacityBox>
      {!walletNotInTheList && !treeState?.manualVerificationRequired && (
        <OpacityBox className="flex items-center justify-between mb-4">
          <h3 className="text-2xl">Share this event on Twitter and support the project</h3>
          <Link
            to="https://twitter.com/intent/retweet?tweet_id=1838591198539452810"
            target="_blank"
            className="flex-shrink-0"
          >
            <UIButton className="flex-shrink-0" size="xl">
              Share
            </UIButton>
          </Link>
        </OpacityBox>
      )}
      <OpacityBox>
        {!address ? (
          <div className="flex flex-col items-center">
            <Icon icon="fa6-solid:triangle-exclamation" className="text-3xl mb-4" />
            <p className="text-xl text-center mb-4">Connect your wallet to interact</p>
            <ExecuteButton label="Connect wallet" />
          </div>
        ) : loadingTree ? (
          <LoadingStub label="Loading proofs" />
        ) : walletNotInTheList ? (
          <div className="flex flex-col items-center">
            <Icon icon="fa6-solid:triangle-exclamation" className="text-3xl mb-4" />
            <p className="text-xl text-center">Your wallet not in the migrate list</p>
          </div>
        ) : treeState?.manualVerificationRequired ? (
          <div className="flex flex-col items-center">
            <Icon icon="fa6-solid:triangle-exclamation" className="text-3xl mb-4" />
            <p className="text-xl text-center">{treeState.manualVerificationExplain}</p>
          </div>
        ) : (
          <>
            <UIInput
              name="migrateValue"
              value={migrateInputVal}
              onChange={handleMigrateValueChange}
              labelEnd={
                <span
                  className="cursor-pointer"
                  onClick={() =>
                    setMigrateInputVal(getDisplayAmount(amountToMigrate, { cut: false }))
                  }
                >
                  Max: {getDisplayAmount(amountToMigrate)}
                </span>
              }
            />
            <ExecuteButton
              label={needApproval ? 'Approve and migrate' : 'Migrate'}
              className="w-full"
              onClick={handleMigrate}
            />
          </>
        )}
      </OpacityBox>
      {!walletNotInTheList && !treeState?.manualVerificationRequired && (
        <>
          {walletStakes.length !== 0 && (
            <OpacityBox>
              {walletStakes.map((stake) => (
                <WalletStakeCard key={stake.stakeId} stake={stake} />
              ))}
            </OpacityBox>
          )}
        </>
      )}
    </div>
  );
};
