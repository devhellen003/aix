import { useWeb3ModalAccount } from '@web3modal/ethers/react';
import { useMemo } from 'react';
import { API_URL } from 'src/configs/api.config';
import { useAuth } from 'src/providers/AuthProvider';
import {
  ReferralLinkResp,
  ReferralLinkType,
  ReferralUserInfo,
  RefUserPaymentHistoryItem,
  RefUserStats,
} from 'src/types/affiliate';
import { createApiService } from 'src/utils/axios';

export const useAffiliateApi = () => {
  const { address } = useWeb3ModalAccount();
  const { loggedIn, tgUser, signOut } = useAuth();

  const apiInst = useMemo(() => {
    if (!address) return null;
    if (!loggedIn) return null;

    return createApiService(API_URL, address, signOut);
  }, [address, loggedIn]);

  async function submitRefCode(code: string) {
    if (!apiInst) return null;

    try {
      await apiInst.post('/affiliate/link_referral', {
        user_id: tgUser?.user_id,
        code_id: code,
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async function submitTgNickname(nickname: string) {
    if (!apiInst) return null;

    try {
      await apiInst.post('/affiliate/submitTelegram/', {
        user_id: tgUser?.user_id,
        username: nickname,
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async function fetchUserTelegramToken() {
    if (!apiInst) return null;

    try {
      const resp = await apiInst.get<string>('/affiliate/telegramToken/');
      return resp.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async function fetchReferralLink(type: ReferralLinkType) {
    if (!apiInst) return null;

    try {
      const resp = await apiInst.get<ReferralLinkResp>(`/affiliate/referralLink/?type=${type}`);
      return resp.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async function fetchUserInfo() {
    if (!apiInst) return null;

    try {
      const resp = await apiInst.get<ReferralUserInfo>('/affiliate/user/');
      return resp.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async function fetchUserPaymentHistory() {
    if (!apiInst) return null;

    try {
      const resp = await apiInst.get<RefUserPaymentHistoryItem[]>('/affiliate/paymentsHistory/');
      return resp.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async function fetchUserStats() {
    if (!apiInst) return null;

    try {
      const resp = await apiInst.get<RefUserStats>('/affiliate/affiliateStats/');
      return resp.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  return {
    fetchReferralLink,
    fetchUserInfo,
    fetchUserStats,
    fetchUserPaymentHistory,
    fetchUserTelegramToken,
    submitTgNickname,
    submitRefCode,
  };
};
