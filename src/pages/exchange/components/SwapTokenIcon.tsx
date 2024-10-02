import { getAddress } from 'ethers';
import { FC, useState } from 'react';
import { CoingeckoFormattedToken } from 'src/types/coingecko';

const iconSizes = {
  sm: 'w-5 h-5 text-[8px]',
  default: 'w-10 h-10',
} as const;

export const SwapTokenIcon: FC<{
  token: CoingeckoFormattedToken;
  size?: keyof typeof iconSizes;
}> = ({ token, size = 'default' }) => {
  const [trustError, setTrustError] = useState(false);
  const [srcError, setSrcError] = useState(false);

  const trustLink = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${getAddress(
    token.address,
  )}/logo.png`;

  if (!trustError)
    return (
      <img
        src={trustLink}
        onError={() => setTrustError(true)}
        className={`${iconSizes[size]} rounded-full mr-3`}
      />
    );

  if (!srcError && token.image)
    return (
      <img
        src={token.image}
        onError={() => setSrcError(true)}
        className={`${iconSizes[size]} rounded-full mr-3`}
      />
    );

  return (
    <div
      className={`${iconSizes[size]} rounded-full mr-2 bg-gray-200 flex items-center justify-center text-black`}
    >
      <span className="-mb-0.5">{token.symbol}</span>
    </div>
  );
};
