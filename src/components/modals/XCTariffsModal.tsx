import { Icon } from '@iconify/react';
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import debug from 'debug';
import { Contract, Provider } from 'ethcall';
import { BrowserProvider, ethers } from 'ethers';
import { FC, memo, useEffect, useState } from 'react';
import { paymentAbi } from 'src/abi';
import Tiker from 'src/assets/images/AIX-tiker.svg?react';
import { ExecuteButton } from 'src/components/ExecuteButton';
import { LoadingStub } from 'src/components/UI/LoadingStub';
import { Modal } from 'src/components/UI/Modal';
import { OpacityBox } from 'src/components/UI/OpacityBox';
import { useBotsApi } from 'src/hooks/useBotsApi';
import { useTimeUntil } from 'src/hooks/useTimeUntil';
import { useAppChain } from 'src/providers/AppChainProvider';
import { useSetModal } from 'src/providers/ModalsProvider';
import { useTransactions } from 'src/providers/TransactionsProvider';
import { XcTariffsModalSettings } from 'src/types/modal';
import { Token } from 'src/types/tokens';
import { BN, getDisplayAmount } from 'src/utils/bigNumber';
import { fetchTokensInfo } from 'src/utils/token';
import { UncheckedJsonRpcSigner } from 'src/utils/UncheckedJsonRpcSigner';

const TARIFFS = [
  {
    id: import.meta.env.MODE === 'development' ? 11 : 1,
    type: 'Essential',
    info: 'Includes AigentX branding.',
    icon: <Tiker />,
    priority: 1,
  },
  {
    id: import.meta.env.MODE === 'development' ? 22 : 2,
    type: 'Pro',
    info: 'No AigentX branding.',
    icon: <Icon icon="fa6-solid:circle-check" />,
    priority: 2,
  },
  {
    id: import.meta.env.MODE === 'development' ? 33 : 3,
    type: 'Exclusive',
    info: 'Fully customized solution.',
    icon: <Icon icon="fa6-solid:circle-check" />,
    priority: 3,
  },
  {
    id: 1001,
    type: 'Essential',
    info: 'Includes AigentX branding.',
    icon: <Tiker />,
    priority: 1,
  },
  {
    id: 1002,
    type: 'Pro',
    info: 'No AigentX branding.',
    icon: <Icon icon="fa6-solid:circle-check" />,
    priority: 2,
  },
  {
    id: 1003,
    type: 'Exclusive',
    info: 'Fully customized solution.',
    icon: <Icon icon="fa6-solid:circle-check" />,
    priority: 3,
  },
];

type UserSub = {
  id: number;
  priority: number;
  startedAt: number;
  expiresAt: number;
  periodsPayment: number;
};

type Subscription = {
  id: number;
  paymentPeriod: string;
  payableToken: Token;
  isPaused: boolean;
  extendable: boolean;
  setupPrice: string;
  paymentPeriodPrice: string;
  ui: (typeof TARIFFS)[number] | undefined;
};

const log = debug('components:XCTariffsModal');

export const XCTariffsModal: FC<XcTariffsModalSettings> = () => {
  const [{ chainConfig, appRpcProvider }] = useAppChain();
  const { walletProvider } = useWeb3ModalProvider();
  const { address } = useWeb3ModalAccount();
  const setModal = useSetModal();
  const { trackTx, trackError } = useTransactions();
  const { fetchUserRefs } = useBotsApi();

  const [subs, setSubs] = useState<Subscription[] | null>(null);
  const [userSubs, setUserSubs] = useState<UserSub[] | null>(null);
  const [userRefs, setUserRefs] = useState<string[]>([]);

  const currentUserSub = userSubs?.reduce<UserSub | null>((acc, cur) => {
    if (!acc && cur.expiresAt !== 0) return cur;
    if (acc && cur.expiresAt !== 0 && cur.priority > acc.priority) return cur;
    return acc;
  }, null);

  useEffect(() => {
    getSubscription();
    getUserRefs();
  }, []);

  useEffect(() => {
    getUserSubs();
  }, [address, subs]);

  async function getUserRefs() {
    try {
      const refs = await fetchUserRefs();

      log('getUserRefs refs', refs);

      setUserRefs(refs || []);
    } catch (e) {
      console.error('filed to fetch user refs', e);
    }
  }

  async function getUserSubs() {
    if (!address || !subs) {
      setUserSubs([]);
      return;
    }

    const contract = new ethers.Contract(
      chainConfig.contracts.payments,
      paymentAbi,
      appRpcProvider,
    );

    const userSubsRaw = (await contract.getUserSubscriptions(
      address,
      subs.map((el) => el.id),
    )) as [bigint, bigint, bigint][];

    const newUserSubs = userSubsRaw.map((el, i) => ({
      id: subs[i].id,
      priority: subs[i].ui?.priority || -1,
      startedAt: Number(el[0]),
      expiresAt: Number(el[1]),
      periodsPayment: Number(el[2]),
    }));

    log('newUserSubs', newUserSubs);

    setUserSubs(newUserSubs);
  }

  async function getSubscription() {
    const ethCallProvider = new Provider(chainConfig.id, appRpcProvider);
    const paymentsContract = new Contract(chainConfig.contracts.payments, paymentAbi);

    let subscriptions: Subscription[] = [];

    try {
      const ids = [...Array.from(Array(10).keys()), 1001, 1002, 1003];

      subscriptions = (
        await Promise.all(
          (
            await ethCallProvider.all<[string, bigint, boolean, boolean, bigint, bigint]>(
              ids.map((id) => paymentsContract.subscriptions(id)),
            )
          ).map(async (el, i) => {
            if (!el[1] && !el[2]) return null;

            const tokenInfoRaw = await fetchTokensInfo(chainConfig, appRpcProvider, [el[0]]);
            const id = ids[i];

            return {
              id,
              paymentPeriod: el[1].toString(),
              payableToken: tokenInfoRaw[0],
              isPaused: el[2],
              extendable: el[3],
              setupPrice: el[4].toString(),
              paymentPeriodPrice: el[5].toString(),
              ui: TARIFFS.find((el) => el.id === id),
            };
          }),
        )
      ).filter(Boolean);
    } catch (e) {
      console.error(e);
    }

    setSubs(subscriptions);

    log('subscriptions', subscriptions);
  }

  function handlePayClick(sub: Subscription, userSub?: UserSub) {
    if (!userSub) return;
    if (!subs) return;

    if (currentUserSub && currentUserSub.id !== sub.id) {
      const currentSub = subs.find((el) => el.id === currentUserSub?.id);
      upgrade(sub, currentUserSub, currentSub);
      return;
    }

    if (userSub.expiresAt === 0) {
      pay(sub);
      return;
    }

    extend(sub);
  }

  async function pay(sub: Subscription) {
    if (!walletProvider) return;

    // const provider = new BrowserProvider(walletProvider);
    // const signer = await provider.getSigner();
    const signer = new UncheckedJsonRpcSigner(new BrowserProvider(walletProvider), address!);
    const contract = new ethers.Contract(chainConfig.contracts.payments, paymentAbi, signer);
    const paymentPeriodTimes = '1';

    const params = [
      sub.id,
      paymentPeriodTimes, // paymentPeriodTimes
      userRefs,
      (Date.now() / 1000).toFixed(0), // signatureTimestamp
      new Uint8Array(), // signature
    ];

    let tx;

    try {
      setModal({ modalKey: 'loader', title: 'Confirm your transaction in the wallet' });

      const value = BN(sub.setupPrice)
        .plus(BN(paymentPeriodTimes).times(sub.paymentPeriodPrice))
        .toString();

      log('pay transaction call data', { params, value });

      tx = await contract.pay(...params, {
        value,
      });

      setModal({
        modalKey: 'loader',
        title: 'Payment in process...',
        txHash: tx.hash,
      });

      trackTx(tx);

      await tx.wait();
      await getUserSubs();

      setModal({ modalKey: 'xc-tariffs' });
    } catch (err: any) {
      trackError(err, tx);
      setModal({ modalKey: 'xc-tariffs' });
      console.error('payment failed', err);
      throw err;
    }
  }

  async function extend(sub: Subscription) {
    if (!walletProvider) return;

    // const provider = new BrowserProvider(walletProvider);
    // const signer = await provider.getSigner();
    const signer = new UncheckedJsonRpcSigner(new BrowserProvider(walletProvider), address!);
    const contract = new ethers.Contract(chainConfig.contracts.payments, paymentAbi, signer);
    const paymentPeriodTimes = '1';

    const params = [
      sub.id,
      1, // paymentPeriodTimes
      userRefs,
      (Date.now() / 1000).toFixed(0), // signatureTimestamp
      new Uint8Array(), // signature
    ];

    let tx;

    try {
      setModal({ modalKey: 'loader', title: 'Confirm your transaction in the wallet' });

      const value = BN(paymentPeriodTimes).times(sub.paymentPeriodPrice).toString();

      log('extend transaction call data', { params, value });

      tx = await contract.extend(...params, {
        value,
      });

      setModal({
        modalKey: 'loader',
        title: 'Payment in process...',
        txHash: tx.hash,
      });

      trackTx(tx);

      await tx.wait();
      await getUserSubs();

      setModal({ modalKey: 'xc-tariffs' });
    } catch (err: any) {
      trackError(err, tx);
      setModal({ modalKey: 'xc-tariffs' });
      console.error('payment failed', err);
      throw err;
    }
  }

  async function upgrade(
    toSub: Subscription,
    currentUserSub: UserSub | null,
    fromSub?: Subscription,
  ) {
    if (!walletProvider) return;
    if (!fromSub) return;
    if (!currentUserSub) return;

    log('upgrade', { fromSub, toSub, currentUserSub });

    // const provider = new BrowserProvider(walletProvider);
    // const signer = await provider.getSigner();
    const signer = new UncheckedJsonRpcSigner(new BrowserProvider(walletProvider), address!);
    const contract = new ethers.Contract(chainConfig.contracts.payments, paymentAbi, signer);
    const paymentPeriodTimes = '1';

    const params = [
      fromSub.id, // fromSubscriptionId
      toSub.id, // toSubscriptionId
      paymentPeriodTimes, // paymentPeriodTimes
      userRefs,
      (Date.now() / 1000).toFixed(0), // signatureTimestamp
      new Uint8Array(), // signature
    ];

    const block = await appRpcProvider.getBlock('latest');

    if (!block) return;

    log('latest block', block);

    let tx;

    try {
      setModal({ modalKey: 'loader', title: 'Confirm your transaction in the wallet' });

      let compensation = fromSub.setupPrice;

      if (currentUserSub.expiresAt > block.timestamp && fromSub.extendable) {
        compensation = BN(currentUserSub.periodsPayment)
          .times(BN(currentUserSub.expiresAt).minus(block.timestamp))
          .div(BN(currentUserSub.expiresAt).minus(currentUserSub.startedAt))
          .toString();
      }

      log('compensation', compensation);

      const totalAmount = BN(toSub.paymentPeriodPrice)
        .times(paymentPeriodTimes)
        .plus(toSub.setupPrice)
        .toString();

      let amountToPay = '0';

      if (BN(compensation).lt(totalAmount)) {
        amountToPay = BN(totalAmount).minus(compensation).toString();
      }

      log('upgrade transaction call data', { params, value: amountToPay });

      tx = await contract.upgrade(...params, {
        value: amountToPay,
      });

      setModal({
        modalKey: 'loader',
        title: 'Upgrade in process...',
        txHash: tx.hash,
      });

      trackTx(tx);

      await tx.wait();
      await getUserSubs();

      setModal({ modalKey: 'xc-tariffs' });
    } catch (err: any) {
      trackError(err, tx);
      setModal({ modalKey: 'xc-tariffs' });
      console.error('payment failed', err);
      throw err;
    }
  }

  return (
    <Modal size="5xl">
      {!subs || !userSubs ? (
        <LoadingStub label="Loading subscriptions..." />
      ) : (
        <>
          <div className="modal-title">Select a plan</div>
          <div className="flex space-x-2 mb-4">
            {subs
              .filter((el) => el.ui)
              .map((sub, i) => (
                <Tariff
                  key={sub.id}
                  index={i}
                  sub={sub}
                  subs={subs}
                  userSub={userSubs.find((userSub) => userSub.id === sub.id)}
                  currentUserSub={currentUserSub}
                  onPay={() =>
                    handlePayClick(
                      sub,
                      userSubs.find((userSub) => userSub.id === sub.id),
                    )
                  }
                />
              ))}
          </div>
        </>
      )}
    </Modal>
  );
};

const Tariff = memo<{
  index: number;
  sub: Subscription;
  subs: Subscription[];
  userSub?: UserSub;
  currentUserSub?: UserSub | null;
  onPay: () => void;
}>(({ index, sub, subs, userSub, currentUserSub, onPay }) => {
  const isActivated = !!userSub?.expiresAt;
  const expiresAt = useTimeUntil(userSub?.expiresAt || 0);
  const isExpired = expiresAt === '0';
  const currentSub = subs.find((el) => el.id === currentUserSub?.id);

  if (!sub.ui) return null;

  const isUpgradeable =
    sub.id !== currentSub?.id
      ? sub.ui.priority > ((currentSub?.ui && currentSub.ui.priority) || 0)
      : true;

  return (
    <div className="relative pt-[36%] z-10 flex-1">
      <OpacityBox className="flex flex-col absolute overflow-hidden left-0 top-0 w-full h-full">
        <div
          className={`absolute w-[140%] h-[140%] -right-[50%] -bottom-[50%] -z-10 ${
            index === 0 ? 'bg-circle-purple' : index === 1 ? 'bg-circle-orange' : 'bg-circle-blue'
          }`}
        ></div>
        <div className="flex items-center justify-between mb-7">
          <div className="py-1.5 px-3.5 rounded-xl bg-white text-base">
            <div className="-mb-[2px]">{sub.ui.type}</div>
          </div>
          {/*<div className=" text-gray-700">{sub.ui.slogan}</div>*/}
        </div>
        <div className="text-3xl">
          {getDisplayAmount(sub.setupPrice, {
            decimals: import.meta.env.MODE === 'development' ? 13 : sub.payableToken.decimals,
            round: 1,
          })}{' '}
          {sub.payableToken.symbol}
        </div>
        <div className="text-lg text-gray-500 mb-4">
          {sub.extendable
            ? `+${getDisplayAmount(sub.paymentPeriodPrice, {
                decimals: import.meta.env.MODE === 'development' ? 13 : sub.payableToken.decimals,
                round: 1,
              })} eth/month`
            : 'one-time payment'}
        </div>
        <div className="flex mb-5 items-center">
          <div className="flex-shrink-0 mr-2 bg-white rounded-xl w-9 h-9 relative">
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {sub.ui.icon}
            </span>
          </div>
          <span>{sub.ui.info}</span>
        </div>
        <div className="mb-auto">
          {isActivated && sub.extendable && currentUserSub?.id === sub.id ? (
            isExpired ? (
              'Your subscription expired'
            ) : (
              <>
                <span>Expires in:</span>
                <br />
                <span>{expiresAt}</span>
              </>
            )
          ) : (
            ''
          )}
        </div>
        {isUpgradeable && (
          <ExecuteButton
            className="w-full mt-auto"
            onClick={onPay}
            buttonColor={index === 0 ? 'default' : index === 1 ? 'orange' : 'blue'}
            label={
              sub.isPaused
                ? 'Tariff paused'
                : isActivated && isExpired
                  ? 'Renew'
                  : isActivated && sub.extendable
                    ? 'Extend'
                    : isActivated && !sub.extendable
                      ? 'Active'
                      : currentUserSub
                        ? 'Upgrade'
                        : 'Try AigentXC'
            }
            disabled={(isActivated && !sub.extendable) || sub.isPaused}
          />
        )}
      </OpacityBox>
    </div>
  );
});
