import { FC, useState } from 'react';
import { Modal } from 'src/components/UI/Modal';
import { UIButton } from 'src/components/UI/UIButton';

export const XTTariffsModal: FC<{ modalKey: 'xt-tariffs' }> = () => {
  const [selectedChannel, setSelectedChannel] = useState('tg');

  return (
    <Modal size="xl">
      <div className="modal-title">Which channels would you like to use it:</div>
      <div className="flex space-x-2 mb-6">
        <div className="flex-1 pt-[25%] relative" onClick={() => setSelectedChannel('tg')}>
          <div
            className={`cursor-pointer text-xl absolute flex flex-col align-middle justify-center left-0 top-0 w-full h-full text-center py-3 rounded-2xl border-2 bg-black bg-opacity-5 ${
              selectedChannel === 'tg' ? 'border-purple-600' : ''
            }`}
          >
            <img className="mb-2 w-11 mx-auto" src="/images/telegram-icon.svg" alt="telegram" />
            <span>Telegram</span>
          </div>
        </div>
        <div className="flex-1 pt-[20%] relative" onClick={() => setSelectedChannel('dis')}>
          <div
            className={`cursor-pointer text-xl absolute flex flex-col align-middle justify-center left-0 top-0 w-full h-full text-center py-3 rounded-2xl border-2 bg-black bg-opacity-5 ${
              selectedChannel === 'dis' ? 'border-purple-600' : ''
            }`}
          >
            <img className="mb-2 w-11 mx-auto" src="/images/discord-icon.svg" alt="discord" />
            <span>Discord</span>
          </div>
        </div>
        <div className="flex-1 pt-[20%] relative" onClick={() => setSelectedChannel('whats')}>
          <div
            className={`cursor-pointer text-xl absolute flex flex-col align-middle justify-center left-0 top-0 w-full h-full text-center py-3 rounded-2xl border-2 bg-black bg-opacity-5 ${
              selectedChannel === 'whats' ? 'border-purple-600' : ''
            }`}
          >
            <img className="mb-2 w-11 mx-auto" src="/images/whats-app-icon.svg" alt="whats-app" />
            <span>WhatsApp</span>
          </div>
        </div>
      </div>
      <UIButton className="w-full">Next</UIButton>
    </Modal>
  );
};
