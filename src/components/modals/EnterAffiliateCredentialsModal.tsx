import { FC, useState } from 'react';
import { Modal } from 'src/components/UI/Modal';
import { UIButton } from 'src/components/UI/UIButton';
import { useAffiliateApi } from 'src/hooks/useAffiliateApi';
import { EnterAffiliateCredentialsModalSettings } from 'src/types/modal';

export const EnterAffiliateCredentialsModal: FC<EnterAffiliateCredentialsModalSettings> = ({
  title,
  onConfirm,
}) => {
  const [value, setValue] = useState('');

  const { submitTgNickname } = useAffiliateApi();

  async function handleSubmit() {
    await submitTgNickname(value);
    onConfirm();
  }

  return (
    <Modal size="3xl">
      <div className="grid grid-cols-7 -mt-7">
        <div className="col-span-3 relative">
          <div className="absolute w-[140%] left-[-25%] top-[-23%]">
            <img className="w-full" src="/images/affiliate-modal.png" />
          </div>
        </div>
        <div className="col-span-4 pl-6">
          <div className="modal-title text-left mb-4 text-xl">{title}</div>
          <input
            value={value}
            type="text"
            placeholder="@..."
            className="w-full mb-6 pl-3 pr-14 py-2 border rounded-lg text-gray-700 focus:ring-purple-500 focus:border-purple-500"
            onChange={(e) => setValue(e.target.value)}
          />
          <p className="mb-6 text-sm text-gray-500">
            Join closed AIgentX's affiliate Telegram community to unlock your network's earning
            potential with our sales support and exclusive features. We'll review your application
            within 24 hours and contact you once it's approved.
          </p>
          <div className="flex items-center justify-center">
            <UIButton className="w-full" onClick={handleSubmit} disabled={!value}>
              Unlock My Potential
            </UIButton>
          </div>
        </div>
      </div>
    </Modal>
  );
};
