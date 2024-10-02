import { Icon } from '@iconify/react';
import { FC, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from 'src/components/UI/Modal';
import { UIButton } from 'src/components/UI/UIButton';
import { useBotsApi } from 'src/hooks/useBotsApi';
import { useSetModal } from 'src/providers/ModalsProvider';
import { TGIntegrModalSettings } from 'src/types/modal';

export const SetUpTelegramIntegrationModal: FC<TGIntegrModalSettings> = ({ botId }) => {
  const [command, setCommand] = useState('');
  const setModal = useSetModal();
  const { fetchTelegramGroupToken } = useBotsApi();

  const STEPS = [
    <p>
      Add{' '}
      <a
        className="font-semibold cursor-pointer underline inline text-[#FB1FFF]"
        href="https://t.me/AIgentXBot"
        target="_blank"
        rel="noreferrer"
      >
        @AIgentXBot
      </a>{' '}
      to your group
    </p>,
    <p>Set the Bot as an admin of the group</p>,
    <div>
      <div className="mb-2">Execute command inside of the group</div>
      <div className="bg-black bg-opacity-5 border border-gray-200 rounded-2xl text-black relative px-4 py-8 mb-8">
        <div>
          <Icon
            icon="fa6-solid:clone"
            className="absolute right-2 top-2 text-black opacity-20 cursor-pointer break-all"
            onClick={() => handleCopy(command)}
          />
        </div>
        <div className="break-words">{command}</div>
      </div>
    </div>,
  ];

  useEffect(() => {
    if (!botId) return;

    fetchTelegramGroupToken(botId).then((resp) => {
      if (!resp) return;
      setCommand(resp.command);
    });
  }, [botId]);

  function handleCopy(txt: string) {
    navigator.clipboard.writeText(txt);
    toast.success('Command coped');
  }

  return (
    <Modal size="lg">
      <div className="modal-title">To setup the bot to telegram</div>
      <div className="max-w-md mx-auto p-6 bg-black bg-opacity-5 rounded-2xl">
        <ul className="list-decimal list-inside">
          {STEPS.map((step, i) => (
            <li className="relative step flex items-start [&:not(:last-child)]:pb-4 after:bottom-0 after:h-full">
              <div className="relative z-10 w-6 h-6 flex items-center justify-center rounded-full bg-gray-300 text-gray-700 mr-3 flex-shrink-0">
                <span className="-ml-[1px]">{i + 1}</span>
              </div>
              <div className="mt-[2px]">{step}</div>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-center mt-6">
        Watch{' '}
        <a
          className="font-semibold cursor-pointer underline inline text-[#FB1FFF]"
          href="https://youtube.com"
          target="_blank"
          rel="noreferrer"
        >
          video
        </a>{' '}
        with detailed instructions.
      </p>
      <UIButton className="mt-8 w-full" onClick={() => setModal(null)}>
        Done
      </UIButton>
    </Modal>
  );
};
