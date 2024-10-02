import { useWeb3ModalAccount } from '@web3modal/ethers/react';
import axios from 'axios';
import debug from 'debug';
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { IOption } from 'src/components/UI/UIDropdown';
import { INIT_SELECTOR_STATE } from 'src/constants/diff';
import { useImmutableCallback } from 'src/hooks/useActualRef';
import { useCRMApi } from 'src/hooks/useCRMApi';
import {
  BotChatHistory,
  BotChatHistorySettings,
  BotConversationsList,
  BotsListResp,
  IVisitorFull,
} from 'src/types/conversation';
import { FCC } from 'src/types/FCC';
import { Nullable } from 'src/types/objectHelpers';

const log = debug('providers:ConversationsProvider');

const INIT_BOTS_STATE = { bots: null, fetching: true } as const;
const INIT_CONVERSATIONS_STATE = { conversations: null, fetching: true } as const;
const INIT_HISTORY_STATE = { history: null, fetching: true } as const;

type Bots = { bots: BotsListResp['bots_list']; fetching: false } | typeof INIT_BOTS_STATE;
type BotConversations =
  | {
      conversations: BotConversationsList['last_messages'];
      fetching: false;
    }
  | {
      conversations: null;
      fetching: true;
    };
type ConversationHistoryState =
  | {
      history: BotChatHistory['messages'];
      fetching: false;
    }
  | {
      history: null;
      fetching: true;
    };

const ConversationsProviderInitCtx = {
  botsState: INIT_BOTS_STATE,
  selectedBot: INIT_SELECTOR_STATE,
  setSelectedBot: () => {},
  conversationsState: INIT_CONVERSATIONS_STATE,
  selectedConversation: null,
  setSelectedConversation: () => {},
  conversationHistoryState: INIT_HISTORY_STATE,
  setConversationSettings: () => {},
  conversationSettings: null,
  setConversationHistoryState: () => {},
  pauseConversation: () => Promise.resolve(),
  releaseConversation: () => Promise.resolve(),
  visitor: null,
};

const ConversationsProviderCtx = createContext<{
  botsState: Bots;
  selectedBot: IOption;
  setSelectedBot: Dispatch<SetStateAction<IOption>>;
  conversationsState: BotConversations;
  selectedConversation: Nullable<BotConversationsList['last_messages'][number]>;
  setSelectedConversation: Dispatch<
    SetStateAction<Nullable<BotConversationsList['last_messages'][number]>>
  >;
  conversationHistoryState: ConversationHistoryState;
  conversationSettings: BotChatHistorySettings | null;
  setConversationSettings: Dispatch<SetStateAction<Nullable<BotChatHistorySettings>>>;
  setConversationHistoryState: Dispatch<SetStateAction<ConversationHistoryState>>;
  visitor: Nullable<IVisitorFull>;
  pauseConversation: (sec?: string) => Promise<void>;
  releaseConversation: () => Promise<void>;
}>(ConversationsProviderInitCtx);

export const ConversationsProvider: FCC = ({ children }) => {
  const {
    fetchBotsList,
    fetchBotConversations,
    fetchBotChatHistory,
    checkNewMessage,
    pauseChat,
    releaseChat,
  } = useCRMApi();
  const { address } = useWeb3ModalAccount();

  const [botsState, setBotsState] = useState<Bots>(INIT_BOTS_STATE);
  const [selectedBot, setSelectedBot] = useState<IOption>(INIT_SELECTOR_STATE);
  const [conversationsState, setConversationsState] =
    useState<BotConversations>(INIT_CONVERSATIONS_STATE);
  const [selectedConversation, setSelectedConversation] =
    useState<Nullable<BotConversationsList['last_messages'][number]>>(null);
  const [conversationHistoryState, setConversationHistoryState] =
    useState<ConversationHistoryState>(INIT_HISTORY_STATE);
  const [conversationSettings, setConversationSettings] =
    useState<Nullable<BotChatHistorySettings>>(null);
  const [visitor, setVisitor] = useState<Nullable<IVisitorFull>>(null);

  const botsFetchInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    getBotsList();
  }, [address]);

  useEffect(() => {
    if (botsState.fetching) return;

    if (botsState.bots.length === 0) {
      setSelectedBot(INIT_SELECTOR_STATE);
      return;
    }

    setSelectedBot((prevState) => {
      if (prevState.value === botsState.bots[0].bot_name) return prevState;

      return {
        value: botsState.bots[0].bot_name,
        name: botsState.bots[0].bot_name,
      };
    });
  }, [botsState]);

  useEffect(() => {
    getBotConversations();

    botsFetchInterval.current = setInterval(() => getBotConversations(true), 5000);

    return () => clearInterval(botsFetchInterval.current);
  }, [selectedBot]);

  useEffect(() => {
    getConversationHistory();
  }, [selectedConversation]);

  useEffect(() => {
    if (conversationHistoryState.fetching) return;

    const container = document.querySelector('#chat .rcs-inner-container');

    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [conversationHistoryState.fetching]);

  async function getBotsList(silent = false) {
    if (!silent) setBotsState(INIT_BOTS_STATE);

    const resp = await fetchBotsList();

    if (!resp) {
      setBotsState({ bots: [], fetching: false });
      return;
    }

    setBotsState({
      bots: resp.bots_list,
      fetching: false,
    });
  }

  const getBotConversations = useImmutableCallback(async (silent = false) => {
    if (!selectedBot.value) return;

    if (!silent) setConversationsState(INIT_CONVERSATIONS_STATE);

    const resp = await fetchBotConversations(selectedBot.value);

    if (!resp) {
      setConversationsState((prevState) => ({
        conversations: prevState.conversations || [],
        fetching: false,
      }));
      return;
    }

    if (selectedConversation) {
      const conversationIndex = resp.last_messages.findIndex(
        (el) => el.chat_id === selectedConversation.chat_id,
      );

      resp.last_messages[conversationIndex] = {
        ...resp.last_messages[conversationIndex],
        unread_msg_count: 0,
      };
    }

    setConversationsState({
      conversations: resp.last_messages.sort((a, b) => {
        if (a.last_message.timestamp > b.last_message.timestamp) return -1;
        if (a.last_message.timestamp < b.last_message.timestamp) return 1;
        return 0;
      }),
      fetching: false,
    });
  });

  async function getConversationHistory() {
    if (!selectedConversation) return;

    setConversationHistoryState(INIT_HISTORY_STATE);

    const resp = await fetchBotChatHistory(selectedConversation.chat_id);

    if (!resp) {
      setConversationHistoryState({ history: [], fetching: false });
      setVisitor(null);
      setConversationSettings(null);
    } else {
      const { visitor, messages, status, bot, expiry_at, is_paused } = resp;
      setVisitor(visitor);
      setConversationSettings({
        status,
        bot,
        expiry_at,
        is_paused,
      });
      setConversationHistoryState({ history: messages, fetching: false });
      waitForNewMessage();
      setConversationsState((prevState) => {
        if (!prevState.conversations) return prevState;

        const conversations = [...prevState.conversations];
        const conversationIndex = conversations.findIndex(
          (el) => el.chat_id === selectedConversation.chat_id,
        );

        if (conversationIndex === -1) return prevState;

        conversations[conversationIndex] = {
          ...conversations[conversationIndex],
          unread_msg_count: 0,
        };

        return { ...prevState, conversations };
      });
    }
  }

  const waitForNewMessage = async () => {
    if (!selectedConversation) return;

    await checkNewMessage(
      selectedConversation.chat_id,
      (data: Omit<BotChatHistory, 'visitor'>) => {
        if (data.status === 'success') {
          setConversationHistoryState((prevState) => {
            if (!prevState.history) return prevState;

            return {
              ...prevState,
              history: [
                ...prevState.history.filter((el) => el.user_id !== 'typing'),
                ...data.messages,
              ],
            };
          });
        }

        waitForNewMessage();
      },
      (e: any) => {
        if (axios.isCancel(e)) return;
        setTimeout(() => waitForNewMessage(), 2000);
      },
    );
  };

  const pauseConversation = async (sec?: string) => {
    const resp = await pauseChat(selectedConversation!.chat_id, selectedBot.name, sec);

    if (resp) {
      setConversationSettings((prevState) => {
        if (!prevState) return prevState;

        return {
          ...prevState,
          is_paused: true,
          expiry_at: resp.expiry_at,
        };
      });
    }
  };

  const releaseConversation = async () => {
    const resp = await releaseChat(selectedConversation!.chat_id, selectedBot.name);

    if (resp) {
      setConversationSettings((prevState) => {
        if (!prevState) return prevState;

        return {
          ...prevState,
          is_paused: false,
          expiry_at: null,
        };
      });
    }
  };

  return (
    <ConversationsProviderCtx.Provider
      value={{
        botsState,
        selectedBot,
        setSelectedBot,
        conversationsState,
        selectedConversation,
        setSelectedConversation,
        conversationHistoryState,
        conversationSettings,
        setConversationSettings,
        setConversationHistoryState,
        visitor,
        pauseConversation,
        releaseConversation,
      }}
    >
      {children}
    </ConversationsProviderCtx.Provider>
  );
};

export const useConversations = () => useContext(ConversationsProviderCtx);
