import IconLogo from 'src/assets/white-logo.svg?react';
import { ConnectButton } from 'src/components/Header/ConnectButton';
import { TransactionStatus } from 'src/components/Header/TransactionStatus';

export const Header = () => {
  return (
    <div className="flex justify-between items-center px-6 py-4 border-b border-opacity-10 border-white ">
      <IconLogo />
      <div className="flex items-center space-x-6">
        <TransactionStatus />
        <ConnectButton />
      </div>
    </div>
  );
};
