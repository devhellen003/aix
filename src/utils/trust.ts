import axios from 'axios';
import { TokensListFromTrust } from 'src/types/tokens';

export const trustApiGetTokensList = async () => {
  const resp = await axios.get<TokensListFromTrust>(
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/tokenlist.json',
  );

  const tokens = resp.data.tokens.map((el) => ({
    ...el,
    image: el.logoURI,
    balance: {
      raw: '0',
      formatted: '0',
      fullPrecision: '0',
    },
  }));

  return tokens;
};
