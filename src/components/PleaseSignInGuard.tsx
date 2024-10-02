import { useWeb3ModalAccount } from '@web3modal/ethers/react';
import { Outlet } from 'react-router-dom';
import { ExecuteButton } from 'src/components/ExecuteButton';
import { ConnectButton } from 'src/components/Header/ConnectButton';
import { SectionTitle } from 'src/components/UI/SectionTitle';
import { UIButton } from 'src/components/UI/UIButton';
import { useAuth } from 'src/providers/AuthProvider';
import { FCC } from 'src/types/FCC';

export const PleaseSignInGuard: FCC = ({ children }) => {
  const { address } = useWeb3ModalAccount();

  const { loggedIn, signIn, demoSignIn } = useAuth();

  if (loggedIn) return children || <Outlet />;

  return (
    <>
      <SectionTitle>My Aigents</SectionTitle>
      <div className="flex flex-col flex-1 items-center justify-start">
        <div className="relative after:content-[''] after:absolute after:left-0 after:top-0 after:w-2/12 after:h-full after:z-20 after:bg-gradient-to-r after:from-[#17191B] before:content-[''] before:absolute before:right-0 before:top-0 before:w-2/12 before:h-full before:z-20 before:bg-gradient-to-l before:from-[#17191B]">
          <img className="w-full my-16" src="/images/welcome-bots.png" />
        </div>
        <h1 className="text-6xl">Welcome</h1>
        <span className="text-2xl my-6">
          {!address ? 'Connect your wallet' : 'Sign auth message'} to create, launch, and manage
          bots.
        </span>

        {!address ? (
          <ConnectButton />
        ) : (
          <>
            <ExecuteButton label="Sign in" className="mt-8 w-48" onClick={signIn} />

            <UIButton className="mt-8 w-48" onClick={demoSignIn}>
              Demo Access
            </UIButton>
          </>
        )}
      </div>
    </>
  );
};
