import { Icon } from '@iconify/react';
import { FC } from 'react';
import toast, { Toast, ToastBar, Toaster } from 'react-hot-toast';

const ToastContent: FC<{ t: Toast }> = ({ t }) => {
  const isLink = t.id?.includes('/');

  return (
    <div className="flex items-center ">
      <div
        className="absolute right-1.5 top-1.5 cursor-pointer"
        onClick={() => toast.dismiss(t.id)}
      >
        <Icon icon="fa6-solid:xmark" width={12} />
      </div>
      {t.icon}
      <div className="flex flex-col items-start ml-2 mr-4">
        {t.message?.toString()}
        {isLink && (
          <a
            className="underline flex items-center"
            href={t.id}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on explorer
            <Icon className="ml-3 -mt-0.5" icon="fa6-solid:arrow-up-right-from-square" />
          </a>
        )}
      </div>
    </div>
  );
};

export const TransactionsToasts: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      containerStyle={{
        top: '5rem',
      }}
      toastOptions={{
        duration: 5000,
        className: 'bg-transparent',
        style: {
          maxWidth: 'unset',
        },
        success: {
          className: 'bg-[#52C41A] bg-opacity-20 text-white px-6 py-4 border border-[#52C41A]',
          icon: <Icon icon="fa6-solid:circle-check" className="text-[#52C41A]" width={20} />,
        },
        error: {
          className: 'bg-[#ED1522] bg-opacity-20 text-white px-6 py-4 border border-[#ED1522]',
          icon: <Icon icon="fa6-solid:circle-xmark" className="text-[#ED1522]" width={20} />,
        },
      }}
    >
      {(t) => <ToastBar toast={t}>{() => <ToastContent t={t} />}</ToastBar>}
    </Toaster>
  );
};
