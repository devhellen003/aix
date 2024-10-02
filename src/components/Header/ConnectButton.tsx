import { Icon } from '@iconify/react';
import { useWeb3Modal, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { UIButton } from 'src/components/UI/UIButton';
import { shortenHash } from 'src/utils/ui';

export const ConnectButton = () => {
  const { open } = useWeb3Modal();
  const { isConnected, address } = useWeb3ModalAccount();

  const renderButtonContent = () => {
    if (isConnected && address) {
      return (
        <>
          <Icon className="mr-4" icon="fa6-solid:user" />
          {shortenHash(address)}
        </>
      );
    }

    return (
      <>
        <Icon className="mr-4" icon="fa6-solid:plus" />
        Connect wallet
      </>
    );
  };

  return <UIButton onClick={() => open()}>{renderButtonContent()}</UIButton>;
};
