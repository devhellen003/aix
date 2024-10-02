import { Icon } from '@iconify/react';
import axios from 'axios';
import { FC, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from 'src/components/UI/Modal';
import { UIButton } from 'src/components/UI/UIButton';
import { API_URL } from 'src/configs/api.config';
import { useSetModal } from 'src/providers/ModalsProvider';
import { TelegramToken } from 'src/types/bots';
import { ConnectTgModalSettings } from 'src/types/modal';
import { Nullable } from 'src/types/objectHelpers';

export const ConnectTgModal: FC<ConnectTgModalSettings> = ({ address, onDone }) => {
  const setModal = useSetModal();

  const [tgToken, setTgToken] = useState<Nullable<TelegramToken>>(null);

  useEffect(() => {
    getTgToken();
  }, []);

  const connectMessage = tgToken
    ? `/set_wallet ${tgToken.wallet} ${tgToken.token}`
    : 'Loading token...';

  async function getTgToken() {
    const token = localStorage.getItem(`token-${address}`);

    try {
      const resp = await axios.get<Nullable<TelegramToken>>(`${API_URL}/api/telegramToken`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTgToken(resp.data);
    } catch (e) {
      console.error('!!!!!', e);
      return;
    }
  }

  async function handleCopy(txt: string) {
    await navigator.clipboard.writeText(txt);
    toast.success('Message coped');
  }

  return (
    <Modal>
      <div className="modal-title">To connect Telegram account</div>

      <div className="mx-auto p-6 bg-black bg-opacity-5 rounded-2xl">
        <ul className="list-decimal list-inside">
          <li className="relative step flex items-start [&:not(:last-child)]:pb-4 after:bottom-0 after:h-full">
            <div className="relative z-10 w-6 h-6 flex items-center justify-center rounded-full bg-gray-300 text-gray-700 mr-3">
              <span className="-ml-[1px]">1</span>
            </div>
            <div className="mt-[2px]">
              Open{' '}
              <a
                href="https://t.me/AIgentX_v2_bot"
                target="_blank"
                rel="noreferrer"
                className="font-semibold cursor-pointer underline inline text-[#FB1FFF]"
              >
                @AIgentBot
              </a>
            </div>
          </li>
          <li className="relative step flex items-start [&:not(:last-child)]:pb-4 after:bottom-0 after:h-full">
            <div className="flex-shrink-0 relative z-10 w-6 h-6 flex items-center justify-center rounded-full bg-gray-300 text-gray-700 mr-3">
              <span className="-ml-[1px]">2</span>
            </div>
            <div className="mt-[2px] overflow-hidden">
              <p>Send this message to @AIgentBot:</p>

              <div className="bg-black bg-opacity-5 border border-gray-200 rounded-2xl text-black relative p-8 mt-2">
                <div>
                  <Icon
                    icon="fa6-solid:clone"
                    className="absolute right-2 top-2 text-black opacity-20 cursor-pointer break-all"
                    onClick={() => handleCopy(connectMessage)}
                  />
                </div>
                <p
                  className="break-words cursor-pointer hover:underline"
                  style={{ overflowWrap: 'break-word' }}
                  onClick={() => handleCopy(connectMessage)}
                >
                  {connectMessage}
                </p>
              </div>
            </div>
          </li>
          <li className="relative step flex items-start [&:not(:last-child)]:pb-4 after:bottom-0 after:h-full">
            <div className="flex-shrink-0 relative z-10 w-6 h-6 flex items-center justify-center rounded-full bg-gray-300 text-gray-700 mr-3">
              <span className="-ml-[1px]">3</span>
            </div>
            <div className="mt-[2px] overflow-hidden">
              <p>Click "Done" to finish the setup</p>
            </div>
          </li>
        </ul>
      </div>
      <UIButton className="mt-8 mb-4 w-full" onClick={onDone}>
        Done
      </UIButton>
    </Modal>
  );
};
