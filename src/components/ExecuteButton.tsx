import { useWeb3Modal, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { FC } from 'react';
import { UIButton, UIButtonProps } from 'src/components/UI/UIButton';
import { useSwitchNetwork } from 'src/hooks/useSwitchNetwork';
import { useAppChain } from 'src/providers/AppChainProvider';

type Props = UIButtonProps & {
  label: string;
};

export const ExecuteButton: FC<Props> = ({ label, disabled, onClick, ...props }) => {
  const { open } = useWeb3Modal();
  const { chainId, isConnected } = useWeb3ModalAccount();
  const [{ chainConfig }] = useAppChain();
  const switchNetwork = useSwitchNetwork();

  const wrongNetwork = isConnected && chainId !== chainConfig.id;

  return (
    <UIButton
      disabled={isConnected && !wrongNetwork && disabled}
      onClick={wrongNetwork ? switchNetwork : !isConnected ? () => open() : onClick}
      {...props}
    >
      {!isConnected ? 'Connect wallet' : wrongNetwork ? 'Change network' : label}
    </UIButton>
  );
};
