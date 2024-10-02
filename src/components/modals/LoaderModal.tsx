import { Icon } from '@iconify/react';
import { FC } from 'react';
import { CircularProgress } from 'src/components/UI/CircularProgress';
import { Modal } from 'src/components/UI/Modal';
import { useAppChain } from 'src/providers/AppChainProvider';

export const LoaderModal: FC<{ title: string; txHash?: string }> = ({ title, txHash }) => {
  const [{ chainConfig }] = useAppChain();

  return (
    <Modal size="lg">
      <div className="flex flex-col justify-center items-center mb-8">
        <div className="w-32 h-32 mt-8 mb-4">
          <CircularProgress spinnerSize="full" />
        </div>
        <span>Loading...</span>
      </div>
      <div className="text-xl text-center mb-7">{title}</div>
      {txHash && (
        <div className="flex items-center justify-center text-purple-600">
          <a className="underline" href={`${chainConfig.explorer}/tx/${txHash}`} target={'_blank'}>
            Show transaction status
          </a>
          <Icon className="ml-3 -mt-0.5" icon="fa6-solid:arrow-up-right-from-square" />
        </div>
      )}
    </Modal>
  );
};
