import { Icon } from '@iconify/react';
import { useWeb3ModalAccount } from '@web3modal/ethers/react';
import { isAddress } from 'ethers';
import { ChangeEvent, FC, useEffect, useState } from 'react';
import { LoadingStub } from 'src/components/UI/LoadingStub';
import { Modal } from 'src/components/UI/Modal';
import { UIInput } from 'src/components/UI/UIInput';
import { SwapTokenIcon } from 'src/pages/exchange/components/SwapTokenIcon';
import { useAppChain } from 'src/providers/AppChainProvider';
import { useSetModal } from 'src/providers/ModalsProvider';
import { SwapSelectTokenModalSettings } from 'src/types/modal';
import { isAddressesEq } from 'src/utils/compareAddresses';
import { fetchTokensInfo } from 'src/utils/token';

export const SwapSelectTokenModal: FC<SwapSelectTokenModalSettings> = ({
  tokens,
  setTokens,
  fetchingTokens,
  onTokenSelect,
}) => {
  const [{ chainConfig, appRpcProvider }] = useAppChain();
  const { address } = useWeb3ModalAccount();
  const setModal = useSetModal();

  const [searchToken, setSearchToken] = useState('');
  const [searchFailed, setSearchFailed] = useState(false);
  const [filteredTokens, setFilteredTokens] = useState(tokens);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchToken(e.target.value);
  };

  useEffect(() => {
    setSearchFailed(false);

    if (!searchToken) return setFilteredTokens([...tokens]);

    if (isAddress(searchToken) as boolean) {
      const token = tokens.find((el) => isAddressesEq(el.address, searchToken));

      if (!token) {
        tryToFetchCustomToken();
        return;
      }

      setFilteredTokens([token]);
      return;
    }

    setFilteredTokens(
      [...tokens].filter((el) => {
        return (
          el.symbol.toLowerCase().includes(searchToken.toLowerCase()) ||
          el.name.toLowerCase().includes(searchToken.toLowerCase())
        );
      }),
    );
  }, [searchToken, tokens]);

  const tryToFetchCustomToken = async () => {
    try {
      const tokenInfo = (
        await fetchTokensInfo(chainConfig, appRpcProvider, [searchToken], address)
      )[0];

      if (!tokenInfo) {
        setSearchFailed(true);
        return;
      }

      setTokens((prevState) => [...prevState, tokenInfo]);
    } catch (e) {
      console.error(e);
      setSearchFailed(true);
    }
  };

  return (
    <Modal size="sm">
      <div className="modal-title">Select token</div>
      <UIInput
        name="search"
        value={searchToken}
        onChange={handleSearch}
        inputContainerClasses="!border-gray-300"
        startAdornment={
          <div className="flex items-center justify-center self-stretch px-2 space-x-2 opacity-40 -mr-4">
            <Icon icon="fa6-solid:magnifying-glass" />
          </div>
        }
        placeholder="Search by name/symbol/address"
      />
      {fetchingTokens ? (
        <LoadingStub label="Loading tokens" />
      ) : searchFailed ? (
        <div>Can't find token</div>
      ) : (
        <div className="mt-4 -mb-6 -mx-6 h-[40vh] overflow-auto">
          {filteredTokens.map((el) => (
            <div
              key={el.address}
              className="flex items-center py-2 px-6 hover:bg-gray-300 cursor-pointer"
              onClick={() => {
                onTokenSelect(el);
                setModal(null);
              }}
            >
              <SwapTokenIcon token={el} />
              <div className="flex flex-col">
                <span className="">{el.symbol}</span>
                <span className="text-xs opacity-40">{el.name}</span>
              </div>
              <span className="text-lg ml-auto">{el.balance.formatted}</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};
