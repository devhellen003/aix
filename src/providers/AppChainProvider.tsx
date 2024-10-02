import { ethers } from 'ethers';
import { createContext, Dispatch, useContext, useState } from 'react';
import { CHAIN, ChainConfig } from 'src/configs/chain.config';
import { FCC } from 'src/types/FCC';

/**
 * - Stores provider and all info needed to retrieve data from blockchain.
 * - Depends on the chain currently selected in the web app.
 * - Doesn't depend on the user wallet chain, whether it's connected or not.
 */
export type AppChainState = {
  appWsProvider: ethers.WebSocketProvider;
  appRpcProvider: ethers.JsonRpcProvider;
  chainConfig: ChainConfig;
};

export const getRpcProvider = () => {
  return new ethers.JsonRpcProvider(CHAIN.rpcProviderUrl);
};

export const getWsProvider = () => {
  return new ethers.WebSocketProvider(CHAIN.wsProviderUrl);
};

export const getUpdatedAppChain = () => ({
  chainConfig: CHAIN,
  appRpcProvider: getRpcProvider(),
  appWsProvider: getWsProvider(),
});

export const initialAppChainState: AppChainState = getUpdatedAppChain();

const AppChainStx = createContext<[AppChainState, Dispatch<React.SetStateAction<AppChainState>>]>([
  initialAppChainState,
  () => null,
]);

export const AppChainProvider: FCC = ({ children }) => {
  const value = useState<AppChainState>(initialAppChainState);

  return <AppChainStx.Provider value={value}>{children}</AppChainStx.Provider>;
};

export const useAppChain = () => useContext(AppChainStx);
