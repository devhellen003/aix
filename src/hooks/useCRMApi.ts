import { useWeb3ModalAccount } from '@web3modal/ethers/react';
import { useMemo } from 'react';
import { API_URL } from 'src/configs/api.config';
import { useAuth } from 'src/providers/AuthProvider';
import {
  BotChatHistory,
  BotChatMessageSentResp,
  BotChatSummaryGenResp,
  BotConversationsList,
  BotsListResp,
  IVisitorFull,
  Visitor,
} from 'src/types/conversation';
import { createApiService } from 'src/utils/axios';

let pollingAbortController: AbortController;

export const useCRMApi = () => {
  const { address } = useWeb3ModalAccount();
  const { loggedIn, signOut } = useAuth();

  const axiosInst = useMemo(() => {
    if (!address) return null;
    if (!loggedIn) return null;

    return createApiService(`${API_URL}/affiliate/crm`, address, signOut);
  }, [address, loggedIn]);

  async function fetchBotsList() {
    if (!axiosInst) return null;

    try {
      const resp = await axiosInst.get<BotsListResp>('/bot/list');
      return resp.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async function fetchBotConversations(botId: string) {
    if (!axiosInst) return null;

    try {
      const resp = await axiosInst.get<BotConversationsList>(`/bot/last-messages/${botId}`);
      return resp.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async function fetchBotChatHistory(chatId: string) {
    if (!axiosInst) return null;

    try {
      const resp = await axiosInst.get<BotChatHistory>(`/chat/history/${chatId}`);
      return resp.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async function generateChatSummary(chatId: string) {
    if (!axiosInst) return null;

    try {
      const resp = await axiosInst.get<BotChatSummaryGenResp>(`/chat/summarize/${chatId}`);
      return resp.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async function sendMessageToUser(chat_id: string, text: string, channel: Visitor['source']) {
    if (!axiosInst) return null;

    try {
      const resp = await axiosInst.post<BotChatMessageSentResp>(`/bot/${chat_id}/send`, {
        chat_id,
        text,
        channel,
      });

      return resp.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async function setUserMetadata(
    chat_id: string,
    notes: IVisitorFull['notes'],
    tags: IVisitorFull['tags'],
    onSuccess?: () => void,
    onError?: () => void,
  ) {
    if (!axiosInst) return;

    try {
      await axiosInst.post('/user/metadata/set', {
        chat_id,
        notes,
        tags,
      });
      if (onSuccess) onSuccess();
    } catch (e) {
      console.error(e);
      if (onError) onError();
    }
  }

  async function deleteUserMetadata(
    chat_id: string,
    notes = false,
    tags: string[] = [],
    onSuccess?: () => void,
    onError?: () => void,
  ) {
    if (!axiosInst) return;

    try {
      await axiosInst.post('/user/metadata/delete', {
        chat_id,
        notes,
        tags,
      });
      if (onSuccess) onSuccess();
    } catch (e) {
      console.error(e);
      if (onError) onError();
    }
  }

  async function checkNewMessage(
    chatId: string,
    onNewMessage: (resp: Omit<BotChatHistory, 'visitor'>) => void,
    onError?: (e: any) => void,
  ) {
    if (!axiosInst) return;

    if (pollingAbortController) pollingAbortController.abort();
    pollingAbortController = new AbortController();

    try {
      const resp = await axiosInst
        .get<Omit<BotChatHistory, 'visitor'>>(`/chat/unread/${chatId}`, {
          signal: pollingAbortController.signal,
        })
        .catch();
      onNewMessage(resp.data);
    } catch (e) {
      console.error(e);
      if (onError) onError(e);
    }
  }

  async function releaseChat(chatId: string, botId: string) {
    if (!axiosInst) return null;

    const reqURL = `/bot/${botId}/release/${chatId}`;
    try {
      const resp = await axiosInst.get<{
        status: 'success';
        chat: string;
        message: 'chat released';
        bot: string;
      }>(reqURL);

      return resp.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async function pauseChat(chatId: string, botId: string, sec?: string | number) {
    if (!axiosInst) return null;

    const reqURL = `/bot/${botId}/pause/${chatId}/${sec ? `?expiry=${sec}` : ''}`;
    try {
      const resp = await axiosInst.get<{
        status: 'success';
        chat: string;
        message: 'chat paused';
        bot: string;
        expiry: number;
        expiry_at: number;
      }>(reqURL);

      return resp.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  return {
    botsInst: axiosInst,
    fetchBotsList,
    fetchBotConversations,
    fetchBotChatHistory,
    sendMessageToUser,
    setUserMetadata,
    deleteUserMetadata,
    checkNewMessage,
    pauseChat,
    releaseChat,
    generateChatSummary,
  };
};
