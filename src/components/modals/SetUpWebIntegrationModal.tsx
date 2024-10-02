import { Icon } from '@iconify/react';
import { FC, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from 'src/components/UI/Modal';
import { UIButton } from 'src/components/UI/UIButton';
import { useBotsApi } from 'src/hooks/useBotsApi';
import { useSetModal } from 'src/providers/ModalsProvider';
import { WebIntegrModalSettings } from 'src/types/modal';

const INIT_STATE = { webchat_link: '', webchat_js: '' };

export const SetUpWebIntegrationModal: FC<WebIntegrModalSettings> = ({ botId }) => {
  const setModal = useSetModal();
  const { fetchBotWebchatLink } = useBotsApi();
  const [links, setLinks] = useState(INIT_STATE);

  useEffect(() => {
    if (!botId) return;

    fetchBotWebchatLink(botId).then((resp) => setLinks(resp || INIT_STATE));
  }, []);

  function handleCopy(txt: string) {
    navigator.clipboard.writeText(txt);
    toast.success('Link coped');
  }

  return (
    <Modal>
      <div className="modal-title">To setup the bot to webchat</div>
      <div className="bg-black bg-opacity-5 border border-gray-200 rounded-2xl text-black relative p-8 mb-8">
        <div>
          <Icon
            icon="fa6-solid:clone"
            className="absolute right-2 top-2 text-black opacity-20 cursor-pointer break-all"
            onClick={() => handleCopy(links.webchat_link)}
          />
          <span className="text-lg">Web chat link:</span>
        </div>
        <div className="break-words">{links.webchat_link}</div>
      </div>
      <div className="bg-black bg-opacity-5 border border-gray-200 rounded-2xl text-black relative p-8">
        <div>
          <Icon
            icon="fa6-solid:clone"
            className="absolute right-2 top-2 text-black opacity-20 cursor-pointer break-all"
            onClick={() => handleCopy(links.webchat_js)}
          />
          <span className="text-lg">JS code:</span>
        </div>
        <div className="break-words">{`${links.webchat_js}`}</div>
      </div>
      <UIButton className="mt-8 w-full" onClick={() => setModal(null)}>
        Done
      </UIButton>
    </Modal>
  );
};
