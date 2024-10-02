import BigNumber from 'bignumber.js';
import debug from 'debug';
import { ethers } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

import erc20Abi from 'src/abi/erc20.json';
import { MAX_UINT } from 'src/constants/eth';
import { useImmutableCallback } from 'src/hooks/useActualRef';
import { useAppChain } from 'src/providers/AppChainProvider';
import { isAddressesEq, isZeroAddress } from 'src/utils/compareAddresses';

const log = debug('hooks:useAllowance');

export const useAllowance = (
  tokenAddress: string | null,
  owner: string | undefined | null,
  spender: string,
) => {
  const [allowance, setAllowance] = useState('0');
  const [{ appRpcProvider, appWsProvider }] = useAppChain();
  const contract = useMemo(() => {
    if (!tokenAddress) return null;
    return new ethers.Contract(tokenAddress, erc20Abi, appRpcProvider);
  }, [tokenAddress, appRpcProvider]);

  const fetchAllowanceImmutable = useImmutableCallback(async () => {
    log('fetchAllowanceImmutable for address', tokenAddress);
    if (tokenAddress && isZeroAddress(tokenAddress)) {
      setAllowance(MAX_UINT);
      return;
    }
    if (!contract) return;

    return contract
      .allowance(owner, spender)
      .then((resp: BigNumber) => {
        log('allowance reloaded:', String(resp));
        setAllowance(String(resp) || '0');
        return resp;
      })
      .catch((e) => {
        console.error('fetchAllowanceImmutable error', e);
      });
  });

  useEffect(() => {
    if (!owner || !tokenAddress) return setAllowance('0');

    const wsContract = new ethers.Contract(tokenAddress, erc20Abi, appWsProvider);

    const approvalEventHandler = (from: string, to: string, data: BigNumber.Value) => {
      if (isAddressesEq(from, owner) && isAddressesEq(to, spender)) {
        log('approvalEventHandler: ', data.toString());
        setAllowance(data.toString());
      }
    };

    fetchAllowanceImmutable();
    wsContract?.on('Approval', approvalEventHandler);

    return () => {
      wsContract?.removeListener('Approval', approvalEventHandler);
    };
  }, [appWsProvider, tokenAddress, owner, spender]);

  /**
   * On some chains/providers the Approval event subscription is unreliable,
   * so it's better to reload it manually when possible.
   */
  return [allowance, fetchAllowanceImmutable] as const;
};
