import { Icon } from '@iconify/react';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { AIXRevenueSharingAbi } from 'src/abi';
import { OpacityBox } from 'src/components/UI/OpacityBox';
import { useAppChain } from 'src/providers/AppChainProvider';
import { getDisplayAmount, numberWithSpaces } from 'src/utils/bigNumber';

export const StakedInfo = () => {
  const [{ chainConfig, appRpcProvider }] = useAppChain();
  const [data, setData] = useState({ totalAllocated: '0', totalStaked: '0', fetching: true });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const AIXRevSharingContract = new ethers.Contract(
          chainConfig.contracts.AIXRevenueSharing,
          AIXRevenueSharingAbi,
          appRpcProvider,
        );

        const [staked, allocated] = await Promise.all([
          AIXRevSharingContract.totalStaked(),
          AIXRevSharingContract.totalAssignedRewards(),
        ]);

        setData({
          totalStaked: staked.toString(),
          totalAllocated: allocated.toString(),
          fetching: false,
        });
      } catch (error) {
        console.error('Error fetching staking data:', error);
        // Handle error state as needed
      }
    };

    fetchData();
  }, [chainConfig, appRpcProvider]);

  const { totalAllocated, totalStaked, fetching } = data;

  const renderContent = () => {
    return (
      <>
        <div className=" mb-3">
          <div className="mb-0.5 whitespace-nowrap">
            {fetching
              ? 'Loading...'
              : `${numberWithSpaces(getDisplayAmount(totalAllocated, { round: 2 }))} ETH`}
          </div>
          <div className="text-xs opacity-40">Allocated rewards</div>
        </div>
        <div>
          <div className="mb-0.5 whitespace-nowrap">
            {fetching
              ? 'Loading...'
              : `${numberWithSpaces(getDisplayAmount(totalStaked, { round: 0 }))} AIX`}
          </div>
          <div className="text-xs opacity-40">Total staked amount</div>
        </div>
      </>
    );
  };

  return (
    <OpacityBox className="mx-6 rounded-2xl mt-6">
      <div className="flex items-center mb-5">
        <Icon className="text-white text-xl mr-1" icon="cib:ethereum" />
        <span className="-mb-1 text-xs">ETH Rewards</span>
      </div>
      <div className="flex flex-col flex-wrap">{renderContent()}</div>
    </OpacityBox>
  );
};
