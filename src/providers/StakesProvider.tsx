import { useWeb3ModalAccount } from '@web3modal/ethers/react';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import debug from 'debug';
import { ethers } from 'ethers';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AIXRevenueSharingAbi } from 'src/abi';
import { useImmutableCallback } from 'src/hooks/useActualRef';
import { useAppChain } from 'src/providers/AppChainProvider';
import { FCC } from 'src/types/FCC';
import { AvrgAprResp, Stake, WalletStake, WalletStakesSum } from 'src/types/stakes';
import { BN } from 'src/utils/bigNumber';

const log = debug('providers:StakesProviderCtx');

const initialStakesState = {
  stakes: [] as Stake[],
  fetching: true,
  walletStakes: [] as WalletStake[],
  walletStakesSum: {} as WalletStakesSum,
  fetchStakes: () => {},
  fetchWalletStakes: () => {},
};

const StakesProviderCtx = createContext(initialStakesState);

export const StakesProvider: FCC = ({ children }) => {
  const [{ chainConfig, appRpcProvider }] = useAppChain();
  const { address } = useWeb3ModalAccount();

  const [stakes, setStakes] = useState<Stake[]>([]);
  const [walletStakes, setWalletStakes] = useState<WalletStake[]>([]);
  const [walletStakesSum, setWalletStakesSum] = useState<WalletStakesSum>({});
  const [fetching, setFetching] = useState(true);

  const AIXRevenueSharingContract = useMemo(
    () =>
      new ethers.Contract(
        chainConfig.contracts.AIXRevenueSharing,
        AIXRevenueSharingAbi,
        appRpcProvider,
      ),
    [],
  );

  useEffect(() => {
    if (!AIXRevenueSharingContract || !appRpcProvider) return;
    log('getAllStakesPeriodBoostAPR fired');

    fetchStakes();
  }, [appRpcProvider, AIXRevenueSharingContract]);

  useEffect(() => {
    if (!AIXRevenueSharingContract) return;
    if (!address) {
      setWalletStakes([]);
      return;
    }

    fetchWalletStakes();
  }, [AIXRevenueSharingContract, address]);

  function calcApy(apr: string) {
    const rate = BN(apr).div(10000);
    const apy = BN(1).plus(rate.div(365)).pow(365).minus(1);
    return apy.times(100).toFixed(2);
  }

  const fetchStakes = useImmutableCallback(async () => {
    const [avrgAprResp, contractResp] = await Promise.allSettled([
      axios.get<AvrgAprResp>('https://clay-maiden-ai.cloud:2053/average_apr'),
      AIXRevenueSharingContract.getAllStakesPeriodBoostAPR() as Promise<[bigint, bigint, bigint][]>,
    ]);

    log('fetchStakes contract resp', contractResp);
    log('fetchStakes api resp', avrgAprResp);

    if (contractResp.status === 'fulfilled') {
      const formattedStakes = contractResp.value
        .map((el) => {
          const days = el[0] / 60n / 60n / 24n;
          let apr = BN(el[2].toString()).div(100).toString();
          let apy = calcApy(el[2].toString());

          if (avrgAprResp.status === 'fulfilled') {
            const stakeAvrgApr = avrgAprResp.value.data.find(
              (item) => item.period === Number(el[0]),
            );
            if (stakeAvrgApr) {
              const maxApr = BigNumber.max(
                el[2].toString(),
                stakeAvrgApr.week_avg_apr_numerator,
                stakeAvrgApr.day_avg_apr_numerator,
              ).toString();

              apr = BN(maxApr).div(100).toFixed(2);
              apy = calcApy(maxApr);
            }
          }

          log('result apy/apr', { apr, apy });

          return {
            sec: el[0],
            days,
            apr,
            apy,
          };
        })
        .sort((a: Stake, b: Stake) => {
          if (a.sec < b.sec) return -1;
          if (a.sec > b.sec) return 1;
          return 0;
        })
        .slice(0, 3);

      setStakes(formattedStakes);
    }
    setFetching(false);
  });

  const fetchWalletStakes = useImmutableCallback(() => {
    AIXRevenueSharingContract.getUserStakes(address).then((resp: bigint[][]) => {
      log('getUserStakes resp', resp);

      const summary = {} as WalletStakesSum;

      setWalletStakes(
        resp.map((el) => {
          const period = el[4].toString();
          const stakedAmount = el[2].toString();

          if (summary[period]) {
            summary[period] = BN(summary[period]).plus(stakedAmount).toString();
          } else {
            summary[period] = stakedAmount;
          }

          return {
            user: el[0].toString(),
            stakeId: el[1].toString(),
            stakedAmount,
            boostedStakedAmount: el[3].toString(),
            period,
            unstakeTimestamp: el[5].toString(),
            lastRewardPerToken: el[6].toString(),
            totalPaidRewards: el[7].toString(),
            apr: el[8].toString(),
            apy: calcApy(el[8].toString()),
            availableReward: el[9].toString(),
            poolShare: el[10].toString(),
          };
        }),
      );

      log('setWalletStakesSum', summary);

      setWalletStakesSum(summary);
    });
  });

  return (
    <StakesProviderCtx.Provider
      value={{ stakes, fetching, walletStakes, fetchStakes, fetchWalletStakes, walletStakesSum }}
    >
      {children}
    </StakesProviderCtx.Provider>
  );
};

export const useStakes = () => useContext(StakesProviderCtx);
