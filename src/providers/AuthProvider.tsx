import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import axios from 'axios';
import { BrowserProvider } from 'ethers';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { API_URL } from 'src/configs/api.config';
import { useSetModal } from 'src/providers/ModalsProvider';
import { TelegramUser } from 'src/types/bots';
import { FCC } from 'src/types/FCC';
import { Nullable } from 'src/types/objectHelpers';
import { UncheckedJsonRpcSigner } from 'src/utils/UncheckedJsonRpcSigner';

const INIT_CTX = {
  tgUser: null as Nullable<TelegramUser>,
  loggedIn: false,
  signedIn: false,
  getTgUser: () => {},
  signOut: () => {},
  signIn: () => Promise.resolve(),
  demoSignIn: () => Promise.resolve(),
};

const AuthCtx = createContext<typeof INIT_CTX>(INIT_CTX);

export const AuthProvider: FCC = ({ children }) => {
  const { address } = useWeb3ModalAccount();
  const setModal = useSetModal();
  const { walletProvider } = useWeb3ModalProvider();

  const [tgUser, setTgUser] = useState<Nullable<TelegramUser>>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const lastAddress = useRef<`0x${string}` | undefined>();

  useEffect(() => {
    if (!address) {
      signOut();
    }

    const token = localStorage.getItem(`token-${address}`);
    if (!token) signOut();
    else {
      lastAddress.current = address;
      setSignedIn(true);
      setLoggedIn(true);
    }
  }, [address]);

  useEffect(() => {
    if (!loggedIn) setModal(null);
  }, [loggedIn]);

  function signOut() {
    setLoggedIn(false);
    setSignedIn(false);
    setTgUser(null);
    localStorage.removeItem(`token-${lastAddress.current}`);
  }

  async function signIn() {
    if (!walletProvider) return;
    if (!address) return;

    const timestamp = Math.floor(new Date().getTime() / 1000);

    try {
      // const provider = new BrowserProvider(walletProvider);
      // const signer = await provider.getSigner();
      const signer = new UncheckedJsonRpcSigner(new BrowserProvider(walletProvider), address!);
      const signedMessage = await signer.signMessage(
        `I verify my ownership to use AIgentX bot, timestamp: ${timestamp}`,
      );

      const resp = await axios.post(`${API_URL}/api/sign`, {
        wallet: address.toLowerCase(),
        timestamp: timestamp,
        signature: signedMessage,
      });

      const token = resp.data.token;

      localStorage.setItem(`token-${address}`, token);

      getTgUser();

      setLoggedIn(true);
    } catch (e) {
      // if (axios.isAxiosError(e)) {
      //   if (e.response?.status === 400 && e.response.data?.error?.includes('wallet=')) {
      //     setModal({ modalKey: 'connect-tg' });
      //     return;
      //   }
      // }
      setModal(null);
      signOut();
    }
  }

  async function demoSignIn() {
    try {
      const demoSignResp = await axios.get('https://eros-ai.cloud:2096/demoSignature');
      const { signature, wallet, timestamp } = demoSignResp.data;

      const resp = await axios.post(`${API_URL}/api/sign`, {
        wallet,
        timestamp,
        signature,
      });

      const token = resp.data.token;

      localStorage.setItem(`token-${address}`, token);
      localStorage.setItem('demoSignin', 'true');

      setLoggedIn(true);
    } catch (e) {
      console.error(e);
      signOut();
    }
  }

  async function getTgUser() {
    const token = localStorage.getItem(`token-${address}`);

    try {
      const resp = await axios.get<Nullable<TelegramUser>>(`${API_URL}/api/telegramUser`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTgUser(resp.data);
    } catch (e) {
      console.error('!!!!!', e);
      signOut();
    }
  }

  return (
    <AuthCtx.Provider
      value={{ loggedIn, signOut, signedIn, signIn, demoSignIn, tgUser, getTgUser }}
    >
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => useContext(AuthCtx);
