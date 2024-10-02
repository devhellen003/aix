import { Icon } from '@iconify/react';
import { useWeb3ModalAccount } from '@web3modal/ethers/react';
import React from 'react';
import { useSwitchNetwork } from 'src/hooks/useSwitchNetwork';

import { useAppChain } from 'src/providers/AppChainProvider';

export const NetworkAttention: React.FC = () => {
  const { chainId, isConnected } = useWeb3ModalAccount();
  const [{ chainConfig }] = useAppChain();
  const switchNetwork = useSwitchNetwork();

  if (!chainConfig || !isConnected) return null;

  if (chainId !== chainConfig.id) {
    return (
      <div
        className="cursor-pointer fixed z-20 bottom-8 left-1/2 -translate-x-1/2 bg-[#FFE662] bg-opacity-20 flex items-center font-bold text-lg px-6 py-4 pb-3 rounded-xl"
        onClick={switchNetwork}
      >
        <Icon className="mr-4" color="#FFA940" icon="fa6-solid:circle-exclamation" />
        <span>Click to switch network to {chainConfig.name}</span>
      </div>
    );
  }

  return null;
};
