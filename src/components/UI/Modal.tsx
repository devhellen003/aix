import { Icon } from '@iconify/react';
import { useEffect } from 'react';
import { useImmutableCallback } from 'src/hooks/useActualRef';
import { useSetModal } from 'src/providers/ModalsProvider';
import { FCC } from 'src/types/FCC';

const modalSizeClasses = {
  sm: 'max-w-sm',
  lg: 'max-w-lg',
  md: 'max-w-md',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
} as const;

export type ModalSize = keyof typeof modalSizeClasses;

type ModalProps = {
  size?: ModalSize | string;
};

export const Modal: FCC<ModalProps> = ({ children, size = '2xl' }) => {
  const setModal = useSetModal();

  const escButtonListener = useImmutableCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setModal(null);
    }
  });

  useEffect(() => {
    document.addEventListener('keydown', escButtonListener);
    return () => document.removeEventListener('keydown', escButtonListener);
  }, [escButtonListener]);

  const modalSizeClass = modalSizeClasses[size as keyof typeof modalSizeClasses] || `max-w-${size}`;

  return (
    <>
      <div className="fixed w-full h-full left-0 top-0 z-30 bg-black bg-opacity-40 backdrop-blur"></div>
      <div
        className="z-40 overflow-auto fixed w-full h-full left-0 top-0 text-center before:content-[''] before:inline-block before:h-full before:align-middle"
        onMouseDown={() => setModal(null)}
      >
        <div
          className={`relative inline-block align-middle bg-white rounded-2xl text-left text-black p-6 pt-12 ${modalSizeClass} w-full`}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="absolute right-5 top-5 opacity-40" onClick={() => setModal(null)}>
            <div className="cursor-pointer before:content-[''] before:absolute before:w-6 before:h-6 before:-right-1 before:-top-0.5">
              <Icon icon="fa6-solid:xmark" className="relative text-xl" />
            </div>
          </div>
          {children}
        </div>
      </div>
    </>
  );
};
