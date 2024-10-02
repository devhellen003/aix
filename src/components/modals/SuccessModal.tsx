import { Icon } from '@iconify/react';
import { FC } from 'react';
import { Modal } from 'src/components/UI/Modal';
import { UIButton } from 'src/components/UI/UIButton';
import { useAppChain } from 'src/providers/AppChainProvider';
import { useSetModal } from 'src/providers/ModalsProvider';

export const SuccessModal: FC<{ title: string; txHash?: string }> = ({ title, txHash }) => {
  const [{ chainConfig }] = useAppChain();
  const setModal = useSetModal();

  return (
    <Modal size="lg">
      <Icon className="text-9xl text-green-600 mx-auto my-6" icon="fa6-solid:circle-check" />
      <div className="modal-title">{title}</div>
      {txHash && (
        <div className="flex items-center justify-center text-purple-600 mb-4">
          <a className="underline" href={`${chainConfig.explorer}/tx/${txHash}`} target={'_blank'}>
            Show transaction
          </a>
          <Icon className="ml-3 -mt-0.5" icon="fa6-solid:arrow-up-right-from-square" />
        </div>
      )}

      <div className="flex justify-center">
        <UIButton
          className="border-black text-black"
          buttonType="stroke"
          onClick={() => setModal(null)}
        >
          Close
        </UIButton>
      </div>
    </Modal>
  );
};
