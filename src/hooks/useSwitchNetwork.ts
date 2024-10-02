import { useAppChain } from 'src/providers/AppChainProvider';

export const useSwitchNetwork = () => {
  const [{ chainConfig }] = useAppChain();

  return async function switchNetwork() {
    if (window.ethereum && window.ethereum.isMetaMask && chainConfig) {
      const {
        paramsForAdding: { hexId, nativeCurrency },
        name,
        rpcProviderUrl,
        explorer,
      } = chainConfig;
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: hexId }],
        });
      } catch (switchError: any) {
        console.error(switchError);
        if (switchError['code'] === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: hexId,
                  chainName: name,
                  rpcProviderUrl,
                  nativeCurrency,
                  blockExplorerUrls: [explorer],
                },
              ],
            });
          } catch (addError) {
            console.error(addError);
          }
        }
      }
    }
  };
};
